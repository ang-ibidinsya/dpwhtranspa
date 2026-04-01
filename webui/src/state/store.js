import { configureStore } from "@reduxjs/toolkit";
import { dataReducer } from './data/dataSlice';

export const store = configureStore({
    reducer: {
        dataReducer: dataReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
      })
});