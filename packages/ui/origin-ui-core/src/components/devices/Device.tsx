import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { getUserOffchain } from '../../features/users/selectors';
import { useLinks } from '../../utils';
import { PageContent } from '../PageContent/PageContent';
import { ProducingDeviceDetailView } from './ProducingDevice/ProducingDeviceDetailView';
import { RoleChangedModal } from '../Modal/RoleChangedModal';
import { ConnectBlockchainAccountModal } from '../Modal/ConnectBlockchainAccountModal';
import { deviceMenuCreator } from './deviceMenuCreator';

export function Device() {
    const userOffchain = useSelector(getUserOffchain);
    const { baseURL, getDevicesLink } = useLinks();
    const { t } = useTranslation();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    function ProductionDetailView(id: number): JSX.Element {
        return (
            <ProducingDeviceDetailView
                id={id}
                showCertificates={true}
                showSmartMeterReadings={true}
            />
        );
    }

    const deviceMenuList = deviceMenuCreator(userOffchain, t);

    return (
        <div className="PageWrapper">
            <Route
                path={`${getDevicesLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = deviceMenuList.filter((item) => {
                        return item.key === key;
                    });

                    if (matches.length > 0 && key === 'producing_detail_view') {
                        matches[0].component = () =>
                            ProductionDetailView(id ? parseInt(id, 10) : id);
                    }

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getDevicesLink()}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={getDevicesLink()}
                render={() => (
                    <Redirect to={{ pathname: `${getDevicesLink()}/${deviceMenuList[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getDevicesLink()}/${deviceMenuList[0].key}` }} />
                )}
            />
            <RoleChangedModal
                showModal={showRoleModal}
                setShowModal={setShowRoleModal}
                setShowBlockchainModal={setShowBlockchainModal}
            />
            <ConnectBlockchainAccountModal
                showModal={showBlockchainModal}
                setShowModal={setShowBlockchainModal}
            />
        </div>
    );
}
