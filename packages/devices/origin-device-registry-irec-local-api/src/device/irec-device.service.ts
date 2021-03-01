import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import {
    AccessTokens,
    Device as IrecDevice,
    DeviceCreateUpdateParams,
    DeviceState,
    IRECAPIClient
} from '@energyweb/issuer-irec-api-wrapper';
import {
    GetConnectionCommand,
    RefreshTokensCommand
} from '@energyweb/origin-organization-irec-api';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecDeviceService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

    async getIrecClient(user: UserIdentifier | string | number) {
        const irecConnection = await this.commandBus.execute(new GetConnectionCommand(user));

        if (!irecConnection) {
            throw new ForbiddenException('User does not have an IREC connection');
        }

        const client = new IRECAPIClient(this.configService.get<string>('IREC_API_URL'), {
            accessToken: irecConnection.accessToken,
            refreshToken: irecConnection.refreshToken,
            expiryDate: irecConnection.expiryDate
        });

        client.on('tokensRefreshed', (accessToken: AccessTokens) => {
            this.commandBus.execute(new RefreshTokensCommand(user, accessToken));
        });

        return client;
    }

    async createIrecDevice(
        user: UserIdentifier,
        deviceData: DeviceCreateUpdateParams
    ): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        const irecDevice = await irecClient.device.create(deviceData);
        await irecClient.device.submit(irecDevice.code);
        irecDevice.status = DeviceState.InProgress;
        return irecDevice;
    }

    async update(
        user: UserIdentifier,
        code: string,
        device: Partial<IrecDevice>
    ): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        const iredDevice = await irecClient.device.edit(code, device);
        await irecClient.device.submit(code);
        iredDevice.status = DeviceState.InProgress;
        return iredDevice;
    }

    async getDevice(user: UserIdentifier, code: string): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.device.get(code);
    }
}