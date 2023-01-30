import { useEffect, useState } from "react";
import Axios from "axios";
import { TextField, Button, Grid } from "@material-ui/core";
import HeatMap from "./components/ContactMap2D";
import { useGetDatasetsQuery } from "./redux/apiSlice";
import {
  updateChrom1,
  updateChrom2,
  updateResolution,
  updateApiCalls,
} from "./redux/heatmap2DSlice";
import { getResFromRange } from "./utils";
import { useAppDispatch, useAppSelector } from "./redux/hooks";

type queryType = {
  chrom1: string;
  chrom2: string;
  dataset_name: string;
  resolution: string;
  cell_id: string;
};

function App() {
  const dispatch = useAppDispatch();
  const heatMapState = useAppSelector((state) => state.heatmap2D);
  const map_cnts = heatMapState.map_cnts;

  const fetchContactMap = async () => {
    const res = getResFromRange(heatMapState.chrom1, heatMapState.chrom2);
    console.log(res);
    if (res) dispatch(updateResolution(res.toString()));
    for (let i = 0; i < map_cnts; i++)
      dispatch(
        updateApiCalls({
          call: true,
          id: i,
        })
      );
    console.log("fetched!");
  };

  const { data: allDataset, error, isLoading } = useGetDatasetsQuery();
  //console.log(allDataset);

  return (
    <div>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <TextField
            id="standard-basic"
            label="Chrom1"
            variant="standard"
            onChange={(e) => dispatch(updateChrom1(e.target.value))}
          />
        </Grid>
        <Grid item>
          <TextField
            id="standard-basic"
            label="Chrom2"
            variant="standard"
            onChange={(e) => dispatch(updateChrom2(e.target.value))}
          />
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => fetchContactMap()}
            style={{ position: "relative", top: "10px" }}
          >
            Send
          </Button>
        </Grid>
        <Grid container justifyContent="center">
          <Grid item>
            {" "}
            <HeatMap map_id={0}></HeatMap>{" "}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

//{
//"file_path": "data/scHiC.h5",
//"grp_path": "resolutions/100000/cells/cell_id0",
//"range1": "chrom2:0-40000000",
//"range2": "chrom2:0-40000000"
//}
/*
{
"chrom1": "chrom2:0-40000000",
"chrom2": "chrom2:0-40000000"
}*/
