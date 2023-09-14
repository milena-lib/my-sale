import { SET_COUPONS, SET_BADGE_NUMBER, DISABLE_DRAWER } from '../constants/Actions';

const initialState = { numOfItems: 0, isDrawerDisabled: false, coupons: [] }

export default function cartReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_BADGE_NUMBER: {
      return { ...state, numOfItems: payload }
    }
    case DISABLE_DRAWER: {
      return { ...state, isDrawerDisabled: payload }
    }
    case SET_COUPONS: {
      return { ...state, coupons: payload }
    }
    default:
      return state;
  }
}