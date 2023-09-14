import { SET_SIGNED_IN, SET_USER_DETAILS, SET_ORG_UNIT_DETAILS, SET_CUSTOMER, CLEAR_CUSTOMER } from '../constants/Actions';

const initialState = { isSignedIn: false, userDetails: [], orgUnitDetails: [], customer: null };

export default function connectionDetailsReducer(state = initialState, action) {

    const { type, payload } = action;

    switch (type) {
        case SET_SIGNED_IN:
            return { ...state, isSignedIn: payload }
        case SET_USER_DETAILS:
            return { ...state, userDetails: payload };
        case SET_ORG_UNIT_DETAILS:
            return { ...state, orgUnitDetails: payload };
        case SET_CUSTOMER:
            return { ...state, customer: payload };
        case CLEAR_CUSTOMER:
            return { ...state, customer: null };
        default:
            return state;
    }
}