import { CertificatesActions, ICertificatesAction } from './actions';
import { ProducingDevice } from '@energyweb/device-registry';
import {
    CertificatesClient,
    CertificationRequestsClient,
    BlockchainPropertiesClient
} from '@energyweb/issuer-api-client';
import { ICertificateViewItem } from '.';

export interface ICertificatesState {
    certificates: ICertificateViewItem[];
    requestCertificatesModal: {
        visible: boolean;
        producingDevice: ProducingDevice.Entity;
    };
    blockchainPropertiesClient: BlockchainPropertiesClient;
    certificatesClient: CertificatesClient;
    certificationRequestsClient: CertificationRequestsClient;
}

const defaultState: ICertificatesState = {
    certificates: [],
    requestCertificatesModal: {
        visible: false,
        producingDevice: null
    },
    blockchainPropertiesClient: null,
    certificatesClient: null,
    certificationRequestsClient: null
};

function certificateExists(state: ICertificatesState, { id, source }: ICertificateViewItem) {
    return state.certificates.find((i) => i.id === id && i.source === source);
}

export function certificatesState(
    state = defaultState,
    action: ICertificatesAction
): ICertificatesState {
    switch (action.type) {
        case CertificatesActions.addCertificate:
            if (certificateExists(state, action.payload)) {
                return state;
            }
            return { ...state, certificates: [...state.certificates, action.payload] };

        case CertificatesActions.updateCertificate:
            if (!certificateExists(state, action.payload)) {
                console.warn(
                    `Certificate Reducer: trying to update certificate with id ${action.payload.id} that does not exist in store`
                );
                return state;
            }

            const certificateIndex = state.certificates.findIndex(
                (c) => c.id === action.payload.id && c.source === action.payload.source
            );

            return {
                ...state,
                certificates: [
                    ...state.certificates.slice(0, certificateIndex),
                    action.payload,
                    ...state.certificates.slice(certificateIndex + 1)
                ]
            };

        case CertificatesActions.showRequestCertificatesModal:
            return {
                ...state,
                requestCertificatesModal: {
                    ...state.requestCertificatesModal,
                    producingDevice: action.payload.producingDevice
                }
            };

        case CertificatesActions.setRequestCertificatesModalVisibility:
            return {
                ...state,
                requestCertificatesModal: {
                    ...state.requestCertificatesModal,
                    visible: true
                }
            };

        case CertificatesActions.hideRequestCertificatesModal:
            return {
                ...state,
                requestCertificatesModal: {
                    visible: false,
                    producingDevice: null
                }
            };

        case CertificatesActions.clearCertificates:
            return { ...state, certificates: [] };

        case CertificatesActions.setBlockchainPropertiesClient:
            return {
                ...state,
                blockchainPropertiesClient: action.payload
            };

        case CertificatesActions.setCertificatesClient:
            return {
                ...state,
                certificatesClient: action.payload
            };

        case CertificatesActions.setCertificationRequestsClient:
            return {
                ...state,
                certificationRequestsClient: action.payload
            };

        default:
            return state;
    }
}
