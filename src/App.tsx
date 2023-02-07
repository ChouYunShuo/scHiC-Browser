import { useEffect, useState } from "react";
import Axios from "axios";
import { TextField, Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import HeatMap from "./components/ContactMap2D";
import { useGetDatasetsQuery } from "./redux/apiSlice";
import {
  updateChrom1,
  updateChrom2,
  updateResolution,
  updateApiCalls,
} from "./redux/heatmap2DSlice";
import {
  getResFromRange,
  getNewChromZoomIn,
  getNewChromZoomOut,
  validateChrom,
} from "./utils";
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
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const map_cnts = heatmap_state.map_cnts;

  const fetchContactMap = async () => {
    const new_res = getResFromRange(heatmap_state.chrom1, heatmap_state.chrom2);
    console.log(heatmap_state.chrom1, heatmap_state.chrom2, new_res);
    if (new_res) dispatch(updateResolution(new_res.toString()));
    for (let i = 0; i < map_cnts; i++)
      dispatch(
        updateApiCalls({
          call: true,
          id: i,
        })
      );
    console.log("fetched!");
  };

  const zoomIn = () => {
    const new_chrom1 = getNewChromZoomIn(
      validateChrom(heatmap_state.chrom1),
      2
    );
    const new_chrom2 = getNewChromZoomIn(
      validateChrom(heatmap_state.chrom2),
      2
    );
    if (new_chrom1 && new_chrom2) {
      dispatch(updateChrom1(new_chrom1));
      dispatch(updateChrom2(new_chrom2));
      fetchContactMap();
    }
  };
  const zoomOut = () => {
    const new_chrom1 = getNewChromZoomOut(
      validateChrom(heatmap_state.chrom1),
      2
    );
    const new_chrom2 = getNewChromZoomOut(
      validateChrom(heatmap_state.chrom2),
      2
    );
    console.log(new_chrom1);
    if (new_chrom1 && new_chrom2) {
      dispatch(updateChrom1(new_chrom1));
      dispatch(updateChrom2(new_chrom2));
      fetchContactMap();
    }
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
            value={heatmap_state.chrom1}
            onChange={(e) => dispatch(updateChrom1(e.target.value))}
          />
        </Grid>
        <Grid item>
          <TextField
            id="standard-basic"
            label="Chrom2"
            variant="standard"
            value={heatmap_state.chrom2}
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
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => zoomOut()}
            style={{
              position: "relative",
              top: "10px",
              minWidth: "36px",
              minHeight: "36px",
            }}
          >
            -
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => zoomIn()}
            style={{
              position: "relative",
              top: "10px",
              minWidth: "36px",
              minHeight: "36px",
            }}
          >
            +
          </Button>
        </Grid>
        <Grid container justifyContent="center">
          <Grid>
            <HeatMap map_id={0}></HeatMap>
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
