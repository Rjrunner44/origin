import React, { useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { Typography, Box, Grid } from '@material-ui/core';
import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import {
    getUserOffchain,
    useTranslation,
    deviceMenuCreator,
    certificatesMenuCreator,
    organizationMenuCreator,
    getInvitations,
    getIRecAccount,
    adminMenuCreator,
    accountMenuCreator
} from '@energyweb/origin-ui-core';
import { exchangeMenuCreator } from '@energyweb/exchange-ui-core';
import { OriginConfigurationContext } from './OriginConfigurationContext';
import { useLinks } from '../routing';
import { SidebarSubMenu } from './SidebarSubMenu';

export enum ActiveMenuItem {
    Devices = 1,
    Certificates = 2,
    Exchange = 3,
    Organization = 4,
    Admin = 5,
    Settings = 6
}

export function SidebarMenu() {
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const userIsActive = user && user.status === UserStatus.Active;
    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);
    const invitations = useSelector(getInvitations);
    const iRecAccount = useSelector(getIRecAccount);
    const { enabledFeatures, logo } = useContext(OriginConfigurationContext);
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<ActiveMenuItem>(null);
    const location = useLocation();

    const {
        getDefaultLink,
        getDevicesLink,
        getCertificatesLink,
        getAccountLink,
        getOrganizationLink,
        getAdminLink,
        getExchangeLink
    } = useLinks();

    function setSidebarActiveItem(link) {
        const currentPath = link.pathname.split('/')[1].toString().toLowerCase();
        switch (currentPath) {
            case 'devices':
                return ActiveMenuItem.Devices;
            case 'certificates':
                return ActiveMenuItem.Certificates;
            case 'exchange':
                return ActiveMenuItem.Exchange;
            case 'organization':
                return ActiveMenuItem.Organization;
            case 'admin':
                return ActiveMenuItem.Admin;
            case 'account':
                return ActiveMenuItem.Settings;
        }
    }

    useEffect(() => {
        const activeItem = setSidebarActiveItem(location);
        if (activeTab !== activeItem) {
            setActiveTab(activeItem);
        }
    }, [location]);

    const deviceMenuList = deviceMenuCreator(user, t);
    const certificateMenuList = certificatesMenuCreator(user);
    const exchangeMenuList = exchangeMenuCreator(user);
    const organizationMenuList = organizationMenuCreator(
        user,
        invitations,
        enabledFeatures,
        iRecAccount
    );
    const adminMenuList = adminMenuCreator(t);
    const settingsMenuList = accountMenuCreator(user, enabledFeatures, iRecAccount);

    const openDevices = activeTab === ActiveMenuItem.Devices;
    const openCertificates = activeTab === ActiveMenuItem.Certificates;
    const openExchange = activeTab === ActiveMenuItem.Exchange;
    const openOrganization = activeTab === ActiveMenuItem.Organization;
    const openAdmin = activeTab === ActiveMenuItem.Admin;
    const openSettings = activeTab === ActiveMenuItem.Settings;

    return (
        <div className="SidebarMenu">
            <Box className="Logo">
                <NavLink to={getDefaultLink()}>{logo}</NavLink>
            </Box>
            <Grid className="userNameAndOrg">
                <Typography variant="h6">
                    {user ? `${user.firstName} ${user.lastName}` : ''}
                </Typography>
                <Typography>{user?.organization ? `${user.organization.name}` : ''}</Typography>
            </Grid>

            <Grid className="SidebarNavigation">
                <ul>
                    {enabledFeatures.includes(OriginFeature.Devices) && (
                        <>
                            <li className="mainMenu">
                                <NavLink to={getDevicesLink()}>{t('header.devices')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getDevicesLink()}
                                menuList={deviceMenuList}
                                open={openDevices}
                            />
                        </>
                    )}

                    {((enabledFeatures.includes(OriginFeature.Certificates) &&
                        userIsActiveAndPartOfOrg) ||
                        isIssuer) && (
                        <>
                            <li className="mainMenu">
                                <NavLink to={getCertificatesLink()}>
                                    {t('header.certificates')}
                                </NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getCertificatesLink()}
                                menuList={certificateMenuList}
                                open={openCertificates}
                            />
                        </>
                    )}

                    {enabledFeatures.includes(OriginFeature.Exchange) && (
                        <>
                            <li className="mainMenu">
                                <NavLink to={getExchangeLink()}>{t('header.exchange')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getExchangeLink()}
                                menuList={exchangeMenuList}
                                open={openExchange}
                            />
                        </>
                    )}

                    {isRole(user, Role.OrganizationAdmin, Role.Admin, Role.SupportAgent) && (
                        <>
                            <li className="mainMenu">
                                <NavLink to={getOrganizationLink()}>
                                    {t('header.organizations')}
                                </NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getOrganizationLink()}
                                menuList={organizationMenuList}
                                open={openOrganization}
                            />
                        </>
                    )}
                    {isRole(user, Role.Admin) && (
                        <>
                            <li className="mainMenu">
                                <NavLink to={getAdminLink()}>{t('header.admin')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getAdminLink()}
                                menuList={adminMenuList}
                                open={openAdmin}
                            />
                        </>
                    )}

                    {isRole(user, Role.SupportAgent) && (
                        <>
                            <li className="mainMenu">
                                <NavLink to={getAdminLink()}>{t('header.supportAgent')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getAdminLink()}
                                menuList={adminMenuList}
                                open={openAdmin}
                            />
                        </>
                    )}
                    <>
                        <li className="mainMenu">
                            <NavLink to={getAccountLink()}>{t('settings.settings')}</NavLink>
                        </li>
                        <SidebarSubMenu
                            rootLink={getAccountLink()}
                            menuList={settingsMenuList}
                            open={openSettings}
                        />
                    </>
                </ul>
            </Grid>
        </div>
    );
}
