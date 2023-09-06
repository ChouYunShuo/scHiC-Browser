import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { number } from "prop-types";

type chromQueryType = {
  chrom1: string;
  chrom2: string;
};

type apiCallType = {
  id: number;
  selectedCells: string[];
  query: chromQueryType;
  showChromPos: boolean;
  selectRegion: boolean;
};

type selectRectType = {
  isVisible: boolean;
  startX: number;
  startY: number;
  width: number;
  height: number;
};

type HeatMapStateType = {
  dataset_name: string;
  resolution: string;
  all_resolution: number[];
  chrom_lengths: number[];
  app_size: number;
  contact_map_size: number;
  pix_size: number;
  map_cnts: number;
  apiCalls: apiCallType[];
  selectedSidebarItem: number | null;
  selectRect: selectRectType;
};
const initMapQuery = {
  chrom1: "chrom2:0-100000000",
  chrom2: "chrom2:0-100000000",
};
const initApiCalls = [
  {
    id: 0,
    selectedCells: ["0"],
    query: initMapQuery,
    showChromPos: false,
    selectRegion: false,
  },
  {
    id: 1,
    selectedCells: ["1"],
    query: initMapQuery,
    showChromPos: false,
    selectRegion: false,
  },
  {
    id: 2,
    selectedCells: ["2"],
    query: initMapQuery,
    showChromPos: false,
    selectRegion: false,
  },
  {
    id: 3,
    selectedCells: ["3"],
    query: initMapQuery,
    showChromPos: false,
    selectRegion: false,
  },
];
const initSelectRect = {
  isVisible: false,
  startX: 0,
  startY: 0,
  width: 0,
  height: 0,
};

const initialState: HeatMapStateType = {
  dataset_name: "Lee_et_al", //Ramani
  resolution: "500000",
  all_resolution: [],
  chrom_lengths: [],
  app_size: 450,
  contact_map_size: 400,
  pix_size: 2,
  map_cnts: 4,
  apiCalls: initApiCalls,
  selectedSidebarItem: null,
  selectRect: initSelectRect,
};

const heatMap2DSlice = createSlice({
  name: "heatmap2D",
  initialState,
  reducers: {
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
    updateSelectedSidebarItem: (state, action: PayloadAction<number>) => {
      state.selectedSidebarItem = action.payload;
    },
    updateSelectRect: (state, action: PayloadAction<selectRectType>) => {
      state.selectRect = action.payload;
    },
  },
});

export default heatMap2DSlice.reducer;
export const {
  updateResolution,
  updateDataset,
  updateMapSelectCells,
  updateMapShowChromPos,
  updateMapSelectRegion,
  updateApiChromQuery,
  updateChromLen,
  updateAllRes,
  updateSelectedSidebarItem,
  updateSelectRect,
} = heatMap2DSlice.actions;
export const selectAppSize = (state: HeatMapStateType) => state.app_size;
export const selectPixSize = (state: HeatMapStateType) => state.pix_size;
export const selectAllRes = (state: HeatMapStateType) => state.all_resolution;
export const selectChromLen = (state: HeatMapStateType) => state.chrom_lengths;
export const selectSidebarItem = (state: HeatMapStateType) =>
  state.selectedSidebarItem;
