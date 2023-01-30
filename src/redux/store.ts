import {configureStore} from '@reduxjs/toolkit'

import { rootApi } from './apiSlice'
import heatmap2DReducer from './heatmap2DSlice'

const store = configureStore({
    reducer:{
        [rootApi.reducerPath]: rootApi.reducer,
        heatmap2D: heatmap2DReducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    }).concat(rootApi.middleware),
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch