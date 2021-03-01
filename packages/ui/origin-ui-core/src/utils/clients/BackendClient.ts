import {
    AdminClient,
    ConfigurationClient,
    Configuration,
    FileClient,
    InvitationClient,
    OrganizationClient,
    UserClient,
    AuthClient
} from '@energyweb/origin-backend-client';
import { DeviceClient } from '@energyweb/origin-device-registry-irec-form-api-client';
import { MeterReadsClient } from '@energyweb/origin-energy-api-client';
import { BaseClient } from './BaseClient';

export class BackendClient extends BaseClient {
    adminClient: AdminClient;

    authClient: AuthClient;

    configurationClient: ConfigurationClient;

    deviceClient: DeviceClient;

    fileClient: FileClient;

    invitationClient: InvitationClient;

    organizationClient: OrganizationClient;

    userClient: UserClient;

    meterReadsClient: MeterReadsClient;

    setup(accessToken?: string) {
        const config = new Configuration(
            accessToken
                ? {
                      baseOptions: {
                          headers: {
                              Authorization: `Bearer ${accessToken}`
                          }
                      },
                      accessToken
                  }
                : {}
        );

        this.adminClient = new AdminClient(config, this.backendUrl);
        this.authClient = new AuthClient(config, this.backendUrl);
        this.configurationClient = new ConfigurationClient(config, this.backendUrl);
        this.deviceClient = new DeviceClient(config, this.backendUrl);
        this.fileClient = new FileClient(config, this.backendUrl);
        this.invitationClient = new InvitationClient(config, this.backendUrl);
        this.organizationClient = new OrganizationClient(config, this.backendUrl);
        this.userClient = new UserClient(config, this.backendUrl);
        this.meterReadsClient = new MeterReadsClient(config, this.backendUrl);
    }
}
