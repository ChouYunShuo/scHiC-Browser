import React, { useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Button,
  Slider,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import FloatingPanel from "./FloatingPanel";
import Header from "../../components/Header";
import StatBox from "../../components/Statbox";
import HeatMap from "../../components/ContactMap2D";

import EmailIcon from "@mui/icons-material/Email";
import { useGetDatasetsQuery } from "../../redux/apiSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { updateAllRes, updateChromLen } from "../../redux/heatmap2DSlice";
import { fetchChromLens } from "../../utils";
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data: allDataset, error: error_getDataSet } = useGetDatasetsQuery();
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (allDataset) {
      const dataset_name = heatmap_state.dataset_name;
      const key = "name";
      const d_index = allDataset.findIndex((obj) => obj[key] === dataset_name);
      if (d_index != -1) {
        dispatch(updateAllRes(allDataset[d_index].resolutions));
      }
    }
  }, [allDataset]);
  useEffect(() => {
    const getData = async () => {
      const chromLens = await fetchChromLens({
        name: heatmap_state.dataset_name,
        resolution: heatmap_state.all_resolution[0].toString(),
        cell_id: heatmap_state.apiCalls[0].id.toString(),
      });
      //console.log(chromLens);
      dispatch(updateChromLen(chromLens));
    };

    if (heatmap_state.all_resolution.length != 0) getData();
  }, [heatmap_state.all_resolution, heatmap_state.dataset_name]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to scHiC dashboard" />
      </Box>
      <Box padding={2} display="flex" flexDirection="column">
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="150px"
          gap="10px"
        >
          {/* ROW 1 */}
          <Box
            gridColumn="span 6"
            gridRow="span 3"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <HeatMap map_id={0}></HeatMap>
          </Box>
          <Box
            gridColumn="span 6"
            gridRow="span 3"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <HeatMap map_id={1}></HeatMap>
          </Box>
          {/* <Box
            gridColumn="span 4"
            gridRow="span 3"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          ></Box> */}
        </Box>
      </Box>
      <FloatingPanel />
    </Box>
  );
};

export default Dashboard;
