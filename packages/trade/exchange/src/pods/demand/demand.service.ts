import { OrderStatus } from '@energyweb/exchange-core';
import { DemandStatus } from '@energyweb/utils-general';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { Connection, Repository } from 'typeorm';

import { ForbiddenActionError } from '../../utils/exceptions';
import { SubmitOrderCommand } from '../order/commands/submit-order.command';
import { CreateBidDTO } from '../order/create-bid.dto';
import { Order } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { CreateDemandDTO } from './create-demand.dto';
import { DemandSummaryDTO } from './demand-summary.dto';
import { DemandTimePeriodService } from './demand-time-period.service';
import { Demand, IDemand } from './demand.entity';

@Injectable()
export class DemandService<TProduct> {
    private readonly logger = new Logger(DemandService.name);

    constructor(
        @InjectRepository(Demand)
        private readonly repository: Repository<Demand>,
        private readonly orderService: OrderService<TProduct>,
        private readonly connection: Connection,
        private readonly demandTimePeriodService: DemandTimePeriodService<TProduct>,
        private readonly commandBus: CommandBus
    ) {}

    public async create(userId: string, createDemand: CreateDemandDTO<TProduct>): Promise<Demand> {
        const bidsToCreate = this.prepareBids(createDemand);

        let demand: Demand;
        let bids: Order[];

        await this.connection.transaction(async (transaction) => {
            const repository = transaction.getRepository<Demand>(Demand);

            const demandToCreate: Omit<IDemand, 'id' | 'bids'> = {
                userId,
                price: createDemand.price,
                volumePerPeriod: new BN(createDemand.volumePerPeriod),
                periodTimeFrame: createDemand.periodTimeFrame,
                product: createDemand.product,
                start: createDemand.start,
                end: createDemand.end,
                status: DemandStatus.ACTIVE
            };

            demand = await repository.save(demandToCreate);

            bids = await this.orderService.createDemandBids(
                userId,
                bidsToCreate,
                demand.id,
                transaction
            );
        });

        for (const bid of bids) {
            await this.commandBus.execute(new SubmitOrderCommand(bid));
        }

        return this.findOne(userId, demand.id);
    }

    public async replace(
        userId: string,
        demandId: string,
        createDemand: CreateDemandDTO<TProduct>
    ): Promise<Demand> {
        const demand = await this.findOne(userId, demandId);
        if (!demand) {
            return null;
        }

        if (demand.status === DemandStatus.ACTIVE) {
            await this.cancelDemandBids(demand);
        }

        await this.repository.update(demand.id, { status: DemandStatus.ARCHIVED });

        return this.create(userId, createDemand);
    }

    public createSummary(createDemand: CreateDemandDTO<TProduct>): DemandSummaryDTO<TProduct> {
        const bids = this.prepareBids(createDemand);

        return new DemandSummaryDTO(bids);
    }

    public async pause(userId: string, demandId: string): Promise<Demand> {
        const demand = await this.findOne(userId, demandId);
        if (!demand) {
            return null;
        }
        if (demand.status !== DemandStatus.ACTIVE) {
            throw new ForbiddenActionError(
                `Demand ${demand.id} expected status is ${DemandStatus.ACTIVE} but had ${demand.status}`
            );
        }

        await this.repository.update(demand.id, { status: DemandStatus.PAUSED });
        await this.cancelDemandBids(demand);

        return this.findOne(userId, demand.id);
    }

    public async archive(userId: string, demandId: string): Promise<Demand> {
        const demand = await this.findOne(userId, demandId);
        if (!demand) {
            return null;
        }
        if (demand.status === DemandStatus.ARCHIVED || demand.status === DemandStatus.ACTIVE) {
            throw new ForbiddenActionError(
                `Demand ${demand.id} expected status is DemandStatus.PAUSED but had ${demand.status}`
            );
        }

        await this.repository.update(demand.id, { status: DemandStatus.ARCHIVED });
        return this.findOne(userId, demand.id);
    }

    public async resume(userId: string, demandId: string): Promise<Demand> {
        const demand = await this.findOne(userId, demandId);
        if (!demand) {
            return null;
        }
        if (
            demand.status !== DemandStatus.PAUSED ||
            demand.bids.some((bid) => bid.status === OrderStatus.PendingCancellation)
        ) {
            const msg = `Demand ${demand.id} expected status is DemandStatus.PAUSED but had ${demand.status}`;
            this.logger.error(msg);
            throw new ForbiddenActionError(msg);
        }

        await this.repository.update(demand.id, { status: DemandStatus.ACTIVE });
        await this.reSubmitDemandBids(demand);

        return this.findOne(userId, demand.id);
    }

    public async findOne(userId: string, id: string): Promise<Demand> {
        return this.repository.findOne(id, { where: { userId } });
    }

    public async getAll(userId: string): Promise<Demand[]> {
        return this.repository.find({ where: { userId } });
    }

    private async cancelDemandBids(demand: Demand) {
        const bids = demand.bids.filter(
            (b) => b.status === OrderStatus.Active || b.status === OrderStatus.PartiallyFilled
        );
        for (const bid of bids) {
            await this.orderService.cancelOrder(demand.userId, bid.id, true);
        }
    }

    private async reSubmitDemandBids(demand: Demand) {
        const bids = demand.bids.filter(
            (b) =>
                b.status === OrderStatus.Cancelled || b.status === OrderStatus.PendingCancellation
        );
        for (const bid of bids) {
            await this.orderService.reactivateOrder(bid);
        }
    }

    private prepareBids(createDemand: CreateDemandDTO<TProduct>) {
        const validityDates = this.demandTimePeriodService.generateValidityDates(createDemand);
        return validityDates.map(
            ({ validFrom, generationFrom, generationTo }): CreateBidDTO<TProduct> => ({
                volume: createDemand.volumePerPeriod,
                price: createDemand.price,
                validFrom,
                product: createDemand.boundToGenerationTime
                    ? {
                          ...createDemand.product,
                          generationFrom: generationFrom.toISOString(),
                          generationTo: generationTo.toISOString()
                      }
                    : createDemand.product
            })
        );
    }
}
