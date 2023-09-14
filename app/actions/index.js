import {
    SET_SIGNED_IN, SET_USER_DETAILS, SET_ORG_UNIT_DETAILS,
    SET_BADGE_NUMBER, SET_CUSTOMER, CLEAR_CUSTOMER, DISABLE_DRAWER, SET_COUPONS
} from '../constants/Actions';
import GlobalHelper from '../utils/globalHelper';

export function setSignedIn(isSignedIn) {
    return (dispatch) => {
        dispatch({ type: SET_SIGNED_IN, payload: isSignedIn });
    };
}

export function setUserDetails(userDetails) {
    return (dispatch) => {
        dispatch({ type: SET_USER_DETAILS, payload: userDetails });
    };
}

export function setOrgUnitDetails(orgUnitDetails) {
    return (dispatch) => {
        dispatch({ type: SET_ORG_UNIT_DETAILS, payload: orgUnitDetails });
    };
}

export function setBadgeNumber(numberToSet) {
    return (dispatch) => {
        dispatch({ type: SET_BADGE_NUMBER, payload: numberToSet });
    };
}

export function setCustomer(customer) {
    return (dispatch) => {
        dispatch({ type: SET_CUSTOMER, payload: customer });
    };
}

export function clearCustomer() {
    return (dispatch) => {
        dispatch({ type: CLEAR_CUSTOMER });
    };
}

export function disableDrawer(isDisabled) {
    return (dispatch) => {
        dispatch({ type: DISABLE_DRAWER, payload: isDisabled });
    };
}

export function setCoupons(coupons) {
    return (dispatch) => {
        dispatch({ type: SET_COUPONS, payload: coupons });
    };
}

export function clearCart() {
    return (dispatch) => {
        GlobalHelper.cartId = '';
        dispatch({ type: SET_BADGE_NUMBER, payload: 0 });
        dispatch({ type: SET_COUPONS, payload: [] });
    };
}