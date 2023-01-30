import { createSlice, PayloadAction } from "@reduxjs/toolkit"
type chromInput =`chrom${number|'X'|'Y'}:${number}-${number}`
type apiCallType = {
    call: boolean,
    id:number
}
type HeatMapStateType = {
    chrom1: string;
    chrom2: string;
    dataset_name: string;
    resolution: string;
    app_size: number;
    pix_size: number;
    map_cnts: number;
    apiCalls: apiCallType[]
}
const initialState: HeatMapStateType = {
    chrom1: "chrom1:0-20000000",
    chrom2: "chrom1:0-20000000",
    dataset_name: "scHiC5",
    resolution: "10000",
    app_size: 400,
    pix_size: 2,
    map_cnts: 1,
    apiCalls: [{call: true, id:0}]
}

const heatMap2DSlice = createSlice({
    name: 'heatmap2D',
    initialState,
    reducers: {
        updateResolution: (state, action:PayloadAction<string>) =>{
            state.resolution = action.payload
        },
        updateDataset: (state, action:PayloadAction<string>) =>{
            state.dataset_name = action.payload
        },
        updateChrom1: (state, action:PayloadAction<string>) =>{
            state.chrom1 = action.payload
        },
        updateChrom2: (state, action:PayloadAction<string>) =>{
            state.chrom2 = action.payload
        },
        updateApiCalls: (state, action:PayloadAction<apiCallType>) =>{
            state.apiCalls[action.payload.id] = action.payload
        }
    },
    
})

export default heatMap2DSlice.reducer
export const { updateResolution, updateDataset, updateChrom1, updateChrom2,updateApiCalls } = heatMap2DSlice.actions
export const selectAppSize = (state: HeatMapStateType) => state.app_size
export const selectPixSize = (state: HeatMapStateType) => state.pix_size