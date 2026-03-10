import { configureStore } from '@reduxjs/toolkit';
import theme from './reducer';
const store = configureStore({
    reducer: {
        auth: theme, 
    },
});

export default store;