import { BaseActions } from '../features/actions';

const defaultState = null;

export function web3State(state = defaultState, action) {
    switch (action.type) {
        case BaseActions.web3Updated:
            return action.web3;

        default:
            return state;
    }
}
