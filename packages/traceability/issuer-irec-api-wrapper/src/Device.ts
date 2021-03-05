import { Expose, Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsIn,
    IsLatitude,
    IsLongitude,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString
} from 'class-validator';

export enum DeviceState {
    Draft = 'Draft',
    InProgress = 'In-progress',
    Rejected = 'Rejected',
    Approved = 'Approved'
}

export class DeviceCreateUpdateParams {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @Expose({ name: 'default_account_code', toPlainOnly: true })
    @IsString()
    defaultAccount?: string;

    @IsOptional()
    @Expose({ name: 'device_type_code', toPlainOnly: true })
    @IsString()
    deviceType?: string;

    @IsOptional()
    @Expose({ name: 'fuel_code', toPlainOnly: true })
    @IsString()
    fuel?: string;

    @IsOptional()
    @Expose({ name: 'country_code', toPlainOnly: true })
    @IsString()
    countryCode?: string;

    @IsOptional()
    @Expose({ name: 'registrant_organisation_code', toPlainOnly: true })
    @IsString()
    registrantOrganization?: string;

    @IsOptional()
    @Expose({ name: 'issuer_code', toPlainOnly: true })
    @IsString()
    issuer?: string;

    @IsOptional()
    @Transform((value: string) => Number(value))
    @IsPositive()
    capacity?: number;

    @IsOptional()
    @Expose({ name: 'commissioning_date', toPlainOnly: true })
    @Transform((value: Date) => value?.toISOString().split('T')[0], {
        toPlainOnly: true
    })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    commissioningDate?: Date;

    @IsOptional()
    @Expose({ name: 'registration_date', toPlainOnly: true })
    @Transform((value: Date) => value?.toISOString().split('T')[0], { toPlainOnly: true })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    registrationDate?: Date;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsLatitude()
    latitude?: number;

    @IsOptional()
    @IsLongitude()
    longitude?: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    active: boolean;
}

export class Device extends DeviceCreateUpdateParams {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(DeviceState))
    status:
        | DeviceState.Approved
        | DeviceState.Draft
        | DeviceState.InProgress
        | DeviceState.Rejected;
}
