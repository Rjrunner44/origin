/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contracts } from '@energyweb/issuer';
import { UserStatus } from '@energyweb/origin-backend-core';
import { DatabaseService, RolesGuard } from '@energyweb/origin-backend-utils';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import { ethers } from 'ethers';

import { entities } from '../src';
import { AppModule } from '../src/app.module';
import {
    IDeviceSettings,
    IExchangeConfigurationService,
    IExternalDeviceService,
    IProductInfo
} from '../src/interfaces';
import { AccountBalanceService } from '../src/pods/account-balance/account-balance.service';
import { AccountService } from '../src/pods/account/account.service';
import { BundleService } from '../src/pods/bundle/bundle.service';
import { DemandService } from '../src/pods/demand/demand.service';
import { OrderService } from '../src/pods/order/order.service';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DemandModule as TestDemandModule } from './demand/demand.module';
import { OrderModule as TestOrderModule } from './order/order.module';
import { ProductModule as TestProductModule } from './product/product.module';
import { TradeModule as TestTradeModule } from './trade/trade.module';

const WEB3 = 'http://localhost:8580';

// ganache account 2
const registryDeployer = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';

const deployContract = async (web3: string, { abi, bytecode }: { abi: any; bytecode: string }) => {
    const provider = getProviderWithFallback(web3);
    const wallet = new ethers.Wallet(registryDeployer, provider);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    return contract.deployed();
};

const deployRegistry = async (web3: string) => {
    const contract = await deployContract(web3, Contracts.RegistryJSON);

    return contract;
};

const deployIssuer = async (web3: string, registry: string) => {
    const contract = await deployContract(web3, Contracts.IssuerJSON);
    const wallet = new ethers.Wallet(registryDeployer);

    await contract['initialize(int256,address,address)'](100, registry, wallet.address);

    return contract;
};

export const authenticatedUser = { id: 1, organization: { id: '1000' }, status: UserStatus.Active };

const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = authenticatedUser;

        return true;
    }
};

const testLogger = new Logger('e2e');

export const bootstrapTestInstance = async (
    web3 = WEB3,
    deviceServiceMock?: IExternalDeviceService,
    modules: any[] = []
) => {
    testLogger.debug(`Using ${web3}`);

    const registry = await deployRegistry(web3);
    const issuer = await deployIssuer(web3, registry.address);

    const configService = new ConfigService({
        WEB3: web3,
        // ganache account 0
        EXCHANGE_ACCOUNT_DEPLOYER_PRIV:
            '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
        // ganache account 1
        EXCHANGE_WALLET_PUB: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
        EXCHANGE_WALLET_PRIV: '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3',
        ISSUER_ID: 'Issuer ID',
        ENERGY_PER_UNIT: 1000000,
        EXCHANGE_PRICE_STRATEGY: 0
    });

    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'localhost',
                port: Number(process.env.DB_PORT) ?? 5432,
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                entities,
                logging: ['info']
            }),
            AppModule,
            TestOrderModule,
            TestProductModule,
            TestDemandModule,
            TestTradeModule,
            ...modules
        ],
        providers: [
            DatabaseService,
            {
                provide: IExchangeConfigurationService,
                useValue: {
                    getRegistryAddress: async () => registry.address,
                    getIssuerAddress: async () => issuer.address
                }
            },
            {
                provide: IExternalDeviceService,
                useValue: deviceServiceMock ?? {
                    getDeviceProductInfo: async (): Promise<IProductInfo> => ({
                        deviceType: 'Solar;Photovoltaic;Classic silicon',
                        country: 'Thailand',
                        region: 'Central',
                        province: 'Nakhon Pathom',
                        operationalSince: 2016,
                        gridOperator: 'TH-PEA'
                    }),
                    getDeviceSettings: async (): Promise<IDeviceSettings> => ({
                        postForSale: false,
                        postForSalePrice: null
                    })
                }
            }
        ]
    })
        .overrideProvider(ConfigService)
        .useValue(configService)
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .overrideGuard(RolesGuard)
        .useValue(authGuard)
        .compile();

    const app = moduleFixture.createNestApplication();

    const transferService = await app.resolve<TransferService>(TransferService);
    const accountService = await app.resolve<AccountService>(AccountService);
    const accountBalanceService = await app.resolve<AccountBalanceService>(AccountBalanceService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const demandService = await app.resolve<DemandService<string>>(DemandService);
    const orderService = await app.resolve<OrderService<string>>(OrderService);
    const bundleService = await app.resolve<BundleService>(BundleService);

    app.useLogger(testLogger);
    app.enableCors();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    return {
        transferService,
        accountService,
        accountBalanceService,
        databaseService,
        demandService,
        orderService,
        bundleService,
        registry,
        issuer,
        app
    };
};
