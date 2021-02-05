import { IOriginConfiguration, DeviceCreateData } from '@energyweb/origin-backend-core';
import { ExchangeClient } from '../../utils/clients/ExchangeClient';
import { BackendClient } from '../../utils/clients/BackendClient';
import { IRecClient } from '../../utils/clients/IRecClient';

export enum GeneralActions {
    setLoading = 'GENERAL_SET_LOADING',
    setError = 'GENERAL_SET_ERROR',
    setBackendClient = 'GENERAL_SET_BACKEND_CLIENT',
    setExchangeClient = 'GENERAL_SET_EXCHANGE_CLIENT',
    setEnvironment = 'GENERAL_SET_ENVIRONMENT',
    setOffchainConfiguration = 'GENERAL_SET_OFFCHAIN_CONFIGURATION',
    setAccountMismatchModalProperties = 'GENERAL_SET_ACCOUNT_MISMATCH_MODAL_PROPERTIES',
    accountMismatchModalResolved = 'GENERAL_ACCOUNT_MISMATCH_MODAL_RESOLVED',
    requestDeviceCreation = 'GENERAL_REQUEST_DEVICE_CREATION',
    setNoAccountModalVisibility = 'NO_ACCOUNT_MODAL_VISIBILITY',
    setIRecClient = 'GENERAL_SET_IREC_CLIENT'
}

export interface IEnvironment {
    MODE: string;
    BACKEND_URL: string;
    BACKEND_PORT: string;
    BLOCKCHAIN_EXPLORER_URL: string;
    WEB3: string;
    REGISTRATION_MESSAGE_TO_SIGN: string;
    ISSUER_ID: string;
    DEVICE_PROPERTIES_ENABLED: string;
    DEFAULT_ENERGY_IN_BASE_UNIT: string;
    EXCHANGE_WALLET_PUB: string;
    GOOGLE_MAPS_API_KEY: string;
    MARKET_UTC_OFFSET: number;
}

export interface ISetLoadingAction {
    type: GeneralActions.setLoading;
    payload: boolean;
}

export const setLoading = (payload: ISetLoadingAction['payload']) => ({
    type: GeneralActions.setLoading,
    payload
});

export type TSetLoading = typeof setLoading;

export interface ISetErrorAction {
    type: GeneralActions.setError;
    payload: string;
}

export const setError = (payload: ISetErrorAction['payload']) => ({
    type: GeneralActions.setError,
    payload
});

export type TSetError = typeof setError;

export interface ISetBackendClientAction {
    type: GeneralActions.setBackendClient;
    payload: BackendClient;
}

export const setBackendClient = (payload: ISetBackendClientAction['payload']) => ({
    type: GeneralActions.setBackendClient,
    payload
});

export type TSetBackendClientAction = typeof setBackendClient;

export interface ISetEnvironmentAction {
    type: GeneralActions.setEnvironment;
    payload: IEnvironment;
}

export const setEnvironment = (payload: ISetEnvironmentAction['payload']) => ({
    type: GeneralActions.setEnvironment,
    payload
});

export type TSetEnvironmentAction = typeof setEnvironment;

export interface ISetExchangeClientAction {
    type: GeneralActions.setExchangeClient;
    payload: ExchangeClient;
}

export const setExchangeClient = (payload: ISetExchangeClientAction['payload']) => ({
    type: GeneralActions.setExchangeClient,
    payload
});

export type TSetExchangeClientAction = typeof setExchangeClient;

export interface ISetOffchainConfigurationAction {
    type: GeneralActions.setOffchainConfiguration;
    payload: {
        configuration: IOriginConfiguration;
    };
}

export const setOffchainConfiguration = (payload: ISetOffchainConfigurationAction['payload']) => ({
    type: GeneralActions.setOffchainConfiguration,
    payload
});

export type TSetOffchainConfigurationAction = typeof setOffchainConfiguration;

export interface IAccountMismatchModalResolvedAction {
    type: GeneralActions.accountMismatchModalResolved;
    payload: boolean;
}

export const accountMismatchModalResolvedAction = (
    payload: IAccountMismatchModalResolvedAction['payload']
) => ({
    type: GeneralActions.accountMismatchModalResolved,
    payload
});

export type TAccountMismatchModalResolvedAction = typeof accountMismatchModalResolvedAction;

export interface ISetAccountMismatchModalPropertiesAction {
    type: GeneralActions.setAccountMismatchModalProperties;
    payload: {
        visibility: boolean;
    };
}

export const setAccountMismatchModalPropertiesAction = (
    payload: ISetAccountMismatchModalPropertiesAction['payload']
) => ({
    type: GeneralActions.setAccountMismatchModalProperties,
    payload
});

export type TSetAccountMismatchModalPropertiesAction = typeof setAccountMismatchModalPropertiesAction;

export interface ISetNoAccountModalVisibilityAction {
    type: GeneralActions.setNoAccountModalVisibility;
    payload: boolean;
}

export const setNoAccountModalVisibilityAction = (
    payload: ISetNoAccountModalVisibilityAction['payload']
) => ({
    type: GeneralActions.setNoAccountModalVisibility,
    payload
});

export type TSetNoAccountModalVisibilityAction = typeof setNoAccountModalVisibilityAction;

export interface IRequestDeviceCreationAction {
    type: GeneralActions.requestDeviceCreation;
    payload: DeviceCreateData;
}

export const requestDeviceCreation = (payload: IRequestDeviceCreationAction['payload']) => ({
    type: GeneralActions.requestDeviceCreation,
    payload
});

export type TRequestDeviceCreationAction = typeof requestDeviceCreation;

export interface ISetIRecClientAction {
    type: GeneralActions.setIRecClient;
    payload: IRecClient;
}

export const setIRecClient = (payload: ISetIRecClientAction['payload']) => ({
    type: GeneralActions.setIRecClient,
    payload
});

export type TSetIRecClientAction = typeof setIRecClient;

export type IGeneralAction =
    | ISetLoadingAction
    | ISetErrorAction
    | ISetBackendClientAction
    | ISetEnvironmentAction
    | ISetExchangeClientAction
    | ISetOffchainConfigurationAction
    | ISetAccountMismatchModalPropertiesAction
    | ISetNoAccountModalVisibilityAction
    | IAccountMismatchModalResolvedAction
    | IRequestDeviceCreationAction
    | ISetIRecClientAction;
