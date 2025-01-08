import { SET_PASSWORD } from "../types";

const initialState = {
  passwords: [],
  loading: false,
  error: null,
};

const passwordReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PASSWORD:
      return {
        ...state,
        passwords: action.payload,
      };
    default:
      return state;
  }
};

export default passwordReducer;
