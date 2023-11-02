import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import config from "../config.json";

type panelType = {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
};
type gridType = {
  lg: panelType[];
  md?: panelType[];
  xs?: panelType[];
};
type componentType = {
  type: string;
  i: string;
  embed_type?: string;
  meta_type?: string;
  gene_name?: string;
};
type layoutStateType = {
  grid: gridType;
  component: componentType[];
};
const initialState: layoutStateType = {
  ...config.layout,
};

const layoutSlice = createSlice({
  name: "gridLayout",
  initialState,
  reducers: {
    updateGridLayout: (state, action: PayloadAction<gridType>) => {
      state.grid = action.payload;
    },
    updateComponent: (state, action: PayloadAction<componentType[]>) => {
      state.component = action.payload;
    },
  },
});

export default layoutSlice.reducer;
export const { updateGridLayout, updateComponent } = layoutSlice.actions;
