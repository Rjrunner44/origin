import { Certificate } from './pods/certificate/certificate.entity';
import { CertificateModule } from './pods/certificate/certificate.module';
import { BlockchainProperties } from './pods/blockchain/blockchain-properties.entity';
import { BlockchainPropertiesModule } from './pods/blockchain/blockchain-properties.module';
import { CertificationRequest, CertificationRequestModule } from './pods/certification-request';

export * from './pods/certification-request';
export * from './pods/blockchain';
export { CertificateCreatedEvent } from './pods/certificate/events/certificate-created-event';
export { SyncCertificateEvent } from './pods/certificate/events/sync-certificate-event';
export { BlockchainPropertiesService } from './pods/blockchain/blockchain-properties.service';
export { AppModule, providers } from './app.module';

export const entities = [Certificate, CertificationRequest, BlockchainProperties];

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
