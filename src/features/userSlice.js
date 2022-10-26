import {createSlice} from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLogged: false,
    cardNumber: '',
    registration: '',
  },
  reducers: {
    login: (state, action) => {
      state.cardNumber = action.payload.cardNumber;
      state.registration = action.payload.registration;
      state.isLogged = true;
    },
    logout: state => {
      state.cardNumber = '';
      state.registration = '';
      state.isLogged = false;
    },
  },
});

export const {login, logout} = userSlice.actions;

export const selectUser = state => state.user;

export default userSlice.reducer;
