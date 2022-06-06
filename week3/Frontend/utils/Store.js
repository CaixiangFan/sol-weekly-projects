import { createContext, useReducer } from 'react';
export const Store = createContext();
const initialState = {
  var1: '1',
  var2: '2',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_VAR1':
      return { ...state, var1: true };
    default:
      return state;
  }
};

export const StoreProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
};
