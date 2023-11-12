import { configureStore } from "@reduxjs/toolkit";

import { rootApi } from "./apiSlice";
import heatmap2DReducer from "./heatmap2DSlice";
import layoutReducer from "./layoutSlice";

const store = configureStore({
  reducer: {
    [rootApi.reducerPath]: rootApi.reducer,
    heatmap2D: heatmap2DReducer,
    layout: layoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: true,
      serializableCheck: false,
    }).concat(rootApi.middleware),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
