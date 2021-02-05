import {
    DeviceClient as OriginDeviceClient,
    Configuration
} from '@energyweb/origin-device-registry-api-client';
import { DeviceClient as IRecDeviceClient } from '@energyweb/origin-device-registry-irec-local-api-client';
import { BaseClient } from '@energyweb/origin-ui-core';

export class DeviceClient extends BaseClient {
    originClient: OriginDeviceClient;

    iRecClient: IRecDeviceClient;

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

        this.originClient = new OriginDeviceClient(config, this.backendUrl);
        this.iRecClient = new IRecDeviceClient(config, this.backendUrl);
    }
}
