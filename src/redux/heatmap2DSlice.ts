import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import config from "../configs/Lee_et_al.json";
import { RootState } from "./store";

type chromQueryType = {
  chrom1: string;
  chrom2: string;
};

export type apiCallType = {
  id: number;
  selectedCells: string[];
  selectedCellType: string;
  query: chromQueryType;
  showChromPos: boolean;
  selectRegion: boolean;
};

type selectRectType = {
  isVisible: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type HeatMapStateType = {
  dataset_name: string;
  resolution: string;
  all_resolution: number[];
  chrom_lengths: number[];
  app_size: number;
  contact_map_size: number;
  pix_size: number;
  map_cnts: number;
  apiCalls: apiCallType[];
  selectRect: selectRectType;
  track_type: string;
  uuid: string;
};
const initApiCall = (id: number) => ({
  id,
  selectedCells: [`${id}`],
  selectedCellType: "",
  query: config.init_state.query,
  showChromPos: false,
  selectRegion: false,
});

export const initApiCalls = Array.from(
  { length: config.init_state.map_cnts },
  (_, i) => initApiCall(i)
);

export const initSelectRect = {
  isVisible: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
};

const initialState: HeatMapStateType = {
  ...config.init_state,
  all_resolution: [],
  chrom_lengths: [],
  apiCalls: initApiCalls,
  selectRect: initSelectRect,
  uuid: "f9a819ec-6e8e-4b43-a1d3-4281bb154643",
};

const heatMap2DSlice = createSlice({
  name: "heatmap2D",
  initialState,
  reducers: {
    loadConfig: (state, action: PayloadAction<HeatMapStateType>) => {
      return action.payload;
    },
    updateResolution: (state, action: PayloadAction<string>) => {
      state.resolution = action.payload;
    },
    updateDataset: (state, action: PayloadAction<string>) => {
      state.dataset_name = action.payload;
    },

    updateMapSelectCells: (
      state,
      action: PayloadAction<{ id: number; selectedCells: string[] }>
    ) => {
      state.apiCalls[action.payload.id].selectedCells =
        action.payload.selectedCells;
    },
    updateMapSelectCellTypeAndCells: (
      state,
      action: PayloadAction<{
        id: number;
        selectedCellType: string;
        selectedCells: string[];
      }>
    ) => {
      state.apiCalls[action.payload.id].selectedCellType =
        action.payload.selectedCellType;
      state.apiCalls[action.payload.id].selectedCells =
        action.payload.selectedCells;
    },
    updateMapShowChromPos: (
      state,
      action: PayloadAction<{ id: number; showChromPos: boolean }>
    ) => {
      state.apiCalls[action.payload.id].showChromPos =
        action.payload.showChromPos;
    },
    updateMapSelectRegion: (
      state,
      action: PayloadAction<{ id: number; selectRegion: boolean }>
    ) => {
      state.apiCalls[action.payload.id].selectRegion =
        action.payload.selectRegion;
    },
    updateDashboardUuid: (state, action: PayloadAction<string>) => {
      state.uuid = action.payload;
    },
    updateApiChromQuery: (
      state,
      action: PayloadAction<{ id: number; query: chromQueryType }>
    ) => {
      state.apiCalls[action.payload.id].query = action.payload.query;
    },
    updateChromLen: (state, action: PayloadAction<number[]>) => {
      state.chrom_lengths = action.payload;
    },
    updateAllRes: (state, action: PayloadAction<string>) => {
      const numbersArr = action.payload.split(",").map(Number);
      state.all_resolution = numbersArr;
    },
    updateSelectRect: (state, action: PayloadAction<selectRectType>) => {
      state.selectRect = action.payload;
    },
    updateTrackType: (state, action: PayloadAction<string>) => {
      state.track_type = action.payload;
    },
  },
});

export default heatMap2DSlice.reducer;
export const {
  loadConfig,
  updateResolution,
  updateDataset,
  updateMapSelectCells,
  updateMapSelectCellTypeAndCells,
  updateMapShowChromPos,
  updateMapSelectRegion,
  updateApiChromQuery,
  updateChromLen,
  updateAllRes,
  updateSelectRect,
  updateTrackType,
  updateDashboardUuid,
} = heatMap2DSlice.actions;
export const selectAppSize = (state: HeatMapStateType) => state.app_size;
export const selectPixSize = (state: HeatMapStateType) => state.pix_size;
export const selectAllRes = (state: HeatMapStateType) => state.all_resolution;
export const selectChromLen = (state: HeatMapStateType) => state.chrom_lengths;
export const selectTrackType = (state: RootState) => state.heatmap2D.track_type;
export const selectDashboardUuid = (state: RootState) => state.heatmap2D.uuid;
