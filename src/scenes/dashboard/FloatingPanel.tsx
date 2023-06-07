// FloatingPanel.tsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Button,
  Slider,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { makeStyles } from "@mui/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  updateChrom1,
  updateChrom2,
  updateResolution,
  updateApiCalls,
  updateAllRes,
  updateChromLen,
} from "../../redux/heatmap2DSlice";
import {
  getResFromRange,
  getNewChromZoomIn,
  getNewChromZoomOut,
  validateChrom,
  fetchChromLens,
} from "../../utils";
const useStyles = makeStyles({
  root: {
    position: "fixed",
    bottom: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 4,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  expandButton: {
    marginLeft: "auto",
    width: 48,
    height: 48,
  },
});

type FloatingPanelProps = {
  onTextChange: (text: string) => void;
  onZoomInChange: (level: number) => void;
  onZoomOutChange: (level: number) => void;
};

const FloatingPanel: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [expanded, setExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
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
  const fetchContactMap = async () => {
    const newChrom1 = validateChrom(heatmap_state.chrom1);
    const newChrom2 = validateChrom(heatmap_state.chrom2);
    dispatch(updateChrom1(newChrom1));
    dispatch(updateChrom2(newChrom2));
    const new_res = getResFromRange(
      validateChrom(newChrom1),
      validateChrom(newChrom2)
    );
    console.log(newChrom1, newChrom2, new_res);
    if (new_res) dispatch(updateResolution(new_res.toString()));
    for (let i = 0; i < heatmap_state.map_cnts; i++)
      dispatch(
        updateApiCalls({
          call: true,
          id: i,
          selectedCells: heatmap_state.apiCalls[i].selectedCells,
        })
      );
    console.log("fetched!");
  };

  const fetctZoomContactMap = async (newChrom1: string, newChrom2: string) => {
    const new_res = getResFromRange(
      validateChrom(newChrom1),
      validateChrom(newChrom2)
    );
    console.log(newChrom1, newChrom2, new_res);
    if (new_res) dispatch(updateResolution(new_res.toString()));
    for (let i = 0; i < heatmap_state.map_cnts; i++)
      dispatch(
        updateApiCalls({
          call: true,
          id: i,
          selectedCells: heatmap_state.apiCalls[i].selectedCells,
        })
      );
    console.log("fetched!");
  };

  const zoomIn = () => {
    console.log(zoomInLevel);
    const new_chrom1 = getNewChromZoomIn(
      validateChrom(heatmap_state.chrom1),
      zoomInLevel
    );
    const new_chrom2 = getNewChromZoomIn(
      validateChrom(heatmap_state.chrom2),
      zoomInLevel
    );
    console.log(new_chrom1);
    if (new_chrom1 && new_chrom2) {
      dispatch(updateChrom1(new_chrom1));
      dispatch(updateChrom2(new_chrom2));
      fetctZoomContactMap(new_chrom1, new_chrom2);
    }
  };
  const zoomOut = () => {
    const new_chrom1 = getNewChromZoomOut(
      validateChrom(heatmap_state.chrom1),
      zoomOutLevel
    );
    const new_chrom2 = getNewChromZoomOut(
      validateChrom(heatmap_state.chrom2),
      zoomOutLevel
    );
    console.log(new_chrom1);
    if (new_chrom1 && new_chrom2) {
      dispatch(updateChrom1(new_chrom1));
      dispatch(updateChrom2(new_chrom2));
      fetctZoomContactMap(new_chrom1, new_chrom2);
    }
  };

  return (
    <Box
      width={expanded ? "32%" : undefined}
      className={classes.root}
      padding={2}
      display="flex"
      bgcolor={colors.primary[400]}
      flexDirection="column"
    >
      {expanded && (
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="40px"
          gap="10px"
        >
          {/* ROW 1 */}
          <Box
            gridColumn="span 5"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <TextField
              label="Chrom1"
              variant="outlined"
              size="small"
              fullWidth
              value={heatmap_state.chrom1}
              onChange={(e) => dispatch(updateChrom1(e.target.value))}
            />
          </Box>
          <Box
            gridColumn="span 5"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
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
            gridColumn="span 2"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={fetchContactMap}
            >
              Send
            </Button>
          </Box>

          {/* ROW 2 */}
          <Box
            gridColumn="span 4"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
          >
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
            gridColumn="span 2"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={zoomIn}
            >
              Zoom In
            </Button>
          </Box>
          <Box
            gridColumn="span 4"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
          >
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
          <Box
            gridColumn="span 2"
            bgcolor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={zoomOut}
            >
              Zoom Out
            </Button>
          </Box>
        </Box>
      )}
      <Box display="flex" justifyContent="flex-end">
        <IconButton
          className={classes.expandButton}
          onClick={() => setExpanded((prev) => !prev)}
          aria-label="expand"
        >
          {expanded ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default FloatingPanel;
