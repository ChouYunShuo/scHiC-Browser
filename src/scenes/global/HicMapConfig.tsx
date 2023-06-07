import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Button,
  Slider,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import {
  updateChrom1,
  updateChrom2,
  updateResolution,
  updateApiCalls,
  updateAllRes,
  updateChromLen,
} from "../../redux/heatmap2DSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

const HicMapConfig: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const dispatch = useAppDispatch();
  const [zoomInLevel, setZoomInLevel] = useState<number>(2);
  const [zoomOutLevel, setZoomOutLevel] = useState<number>(2);

  const handleZoomInLevelChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setZoomInLevel(newValue as number);
    console.log(newValue);
  };
  const handleZoomOutLevelChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setZoomOutLevel(newValue as number);
  };
  const zoomIn = () => {};
  const zoomOut = () => {};
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" color={colors.grey[100]}>
          Query region
        </Typography>
        <Box>
          <Button variant="outlined" color="secondary">
            Send
          </Button>
        </Box>
      </Box>
      <Box paddingTop={2}>
        <TextField
          label="Chrom1"
          variant="outlined"
          size="small"
          fullWidth
          value={heatmap_state.chrom1}
          onChange={(e) => dispatch(updateChrom1(e.target.value))}
        />
      </Box>
      <Box paddingTop={2}>
        <TextField
          label="Chrom2"
          variant="outlined"
          size="small"
          fullWidth
          value={heatmap_state.chrom2}
          onChange={(e) => dispatch(updateChrom2(e.target.value))}
        />
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop={4}
      >
        <Typography variant="h5" color={colors.grey[100]}>
          Zoom In
        </Typography>
        <Button size="small" variant="outlined" color="error" onClick={zoomIn}>
          Zoom In
        </Button>
      </Box>

      <Box paddingX={1} paddingTop={1}>
        <Slider
          aria-label="Temperature"
          defaultValue={2}
          onChange={handleZoomInLevelChange}
          color="primary"
          valueLabelDisplay="auto"
          step={2}
          marks
          min={2}
          max={10}
        />
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop={4}
      >
        <Typography variant="h5" color={colors.grey[100]}>
          Zoom Out
        </Typography>
        <Button size="small" variant="outlined" color="error" onClick={zoomOut}>
          Zoom Out
        </Button>
      </Box>

      <Box paddingX={1} paddingTop={1}>
        <Slider
          aria-label="Temperature"
          defaultValue={2}
          onChange={handleZoomOutLevelChange}
          color="primary"
          valueLabelDisplay="auto"
          step={2}
          marks
          min={2}
          max={10}
        />
      </Box>
    </Box>
  );
};

export default HicMapConfig;
