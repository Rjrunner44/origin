import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { IsBoolean, IsInt, IsPositive, IsString, Min } from 'class-validator';
import {
    CertificateUtils,
    IClaim,
    IOwnershipCommitmentProof,
    Certificate as OnChainCertificate
} from '@energyweb/issuer';
import { BlockchainProperties } from '../blockchain/blockchain-properties.entity';

export const CERTIFICATES_TABLE_NAME = 'issuer_certificate';

@Entity({ name: CERTIFICATES_TABLE_NAME })
@Unique(['tokenId'])
export class Certificate extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    deviceId: string;

    @Column()
    @IsInt()
    @IsPositive()
    generationStartTime: number;

    @Column()
    @IsInt()
    @IsPositive()
    generationEndTime: number;

    @Column()
    @IsInt()
    @IsPositive()
    creationTime: number;

    @Column('simple-json')
    owners: CertificateUtils.IShareInCertificate;

    @Column('simple-json', { nullable: true })
    claimers: CertificateUtils.IShareInCertificate;

    @Column('simple-json', { nullable: true })
    claims: IClaim[];

    /* BLOCKCHAIN SPECIFIC */

    @ManyToOne(() => BlockchainProperties)
    blockchain: BlockchainProperties;

    @Column({ nullable: true })
    @IsInt()
    @Min(0)
    tokenId: number;

    @Column({ nullable: true })
    @IsString()
    creationBlockHash: string;

    /* PRIVATE CERTIFICATES ONLY */

    @Column('simple-json', { nullable: true })
    latestCommitment: IOwnershipCommitmentProof;

    @Column()
    @IsBoolean()
    issuedPrivately: boolean;

    /*
        Syncs the db certificate with it's on-chain counterpart.
    */
    async sync(): Promise<void> {
        if (!this.blockchain || !this.tokenId) {
            return;
        }

        const onChainCert = await new OnChainCertificate(
            this.tokenId,
            this.blockchain.wrap()
        ).sync();

        await Certificate.update(this.id, {
            owners: onChainCert.owners,
            claimers: onChainCert.claimers,
            claims: await onChainCert.getClaimedData()
        });
    }
}
