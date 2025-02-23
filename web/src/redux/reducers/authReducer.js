import { SET_AUTH_STATE } from "../types";

const initialState = {
  isAuthenticated: false,
  token: ""
};

export function authReducer(state = initialState, action) {
  switch (action.type) {
    case SET_AUTH_STATE:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        token: action.payload.token
      };
    default:
      return state;
  }
}
