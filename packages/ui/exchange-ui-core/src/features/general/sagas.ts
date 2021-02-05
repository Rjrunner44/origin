import axios, { Canceler } from 'axios';
import { SagaIterator } from 'redux-saga';
import { put, select, all, fork, call, cancelled, take } from 'redux-saga/effects';
import { UsersActions } from '@energyweb/origin-ui-core';
import { ExchangeClient } from '../../utils/exchange';
import {
    setExchangeClient,
    setEnvironment,
    IEnvironment,
    ExchangeGeneralActionType
} from './actions';
import { getEnvironment } from './selectors';

function prepareGetEnvironmentTask(): {
    getEnvironment: () => Promise<IEnvironment>;
    cancel: Canceler;
} {
    const source = axios.CancelToken.source();

    return {
        getEnvironment: async () => {
            try {
                const response = await axios.get('env-config.json', {
                    cancelToken: source.token
                });

                return response.data;
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.warn('Error while fetching env-config.json', error?.message ?? error);
                }
            }

            return {
                MODE: 'development',
                BACKEND_URL: 'http://localhost',
                BACKEND_PORT: '3030',
                BLOCKCHAIN_EXPLORER_URL: 'https://volta-explorer.energyweb.org',
                WEB3: 'http://localhost:8545',
                REGISTRATION_MESSAGE_TO_SIGN: 'I register as Origin user',
                MARKET_UTC_OFFSET: 0
            };
        },
        cancel: source.cancel
    };
}

function* setupEnvironment(): SagaIterator {
    let getEnvironmentTask: ReturnType<typeof prepareGetEnvironmentTask>;

    try {
        getEnvironmentTask = yield call(prepareGetEnvironmentTask);

        const environment: IEnvironment = yield call(getEnvironmentTask.getEnvironment);

        yield put(setEnvironment(environment));
    } finally {
        if (yield cancelled()) {
            getEnvironmentTask.cancel();
        }
    }
}

function* initializeExchangeClient(): SagaIterator {
    while (true) {
        yield take([
            ExchangeGeneralActionType.SET_ENVIRONMENT,
            UsersActions.clearAuthenticationToken
        ]);

        const environment: IEnvironment = yield select(getEnvironment);

        const token = localStorage.getItem('AUTHENTICATION_TOKEN');
        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

        yield put(
            setExchangeClient({
                exchangeClient: new ExchangeClient(backendUrl, token)
            })
        );
    }
}

function* initializeExchangeApp(): SagaIterator {
    while (true) {
        yield take(ExchangeGeneralActionType.INITIALIZE_EXCHANGE_APP);
        yield call(setupEnvironment);
    }
}

export function* exchangeGeneralSaga(): SagaIterator {
    yield all([
        fork(initializeExchangeClient),
        fork(setupEnvironment),
        fork(initializeExchangeApp)
    ]);
}
