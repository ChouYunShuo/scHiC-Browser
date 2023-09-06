import React, { useState } from "react";
import { map, range } from "lodash";
import {
  Box,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  Typography,
  useTheme,
  Checkbox,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { tokens } from "../../theme";
import {
  updateApiChromQuery,
  updateResolution,
  updateAllRes,
  updateChromLen,
} from "../../redux/heatmap2DSlice";
import {
  getNewChromeMove,
  getNewChromZoomIn,
  getNewChromZoomOut,
  validateChrom,
} from "../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import ControlButtons from "../../components/MapControlButtons";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type MoveDirType = "up" | "down" | "left" | "right";

const HicMapConfig: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const dispatch = useAppDispatch();
  const [zoomInLevel, setZoomInLevel] = useState<number>(2);
  const [zoomOutLevel, setZoomOutLevel] = useState<number>(2);
  const [selectedMaps, setSelectedMaps] = useState<string[]>(["1"]);
  const [chrom1, setChrom1] = useState<string>(
    heatmap_state.apiCalls[0].query.chrom1
  );
  const [chrom2, setChrom2] = useState<string>(
    heatmap_state.apiCalls[0].query.chrom2
  );
  const mapCnt = heatmap_state.map_cnts;
  const maps = map(range(mapCnt), (val) => `${val + 1}`);

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
  const zoomMapIn = () => {
    if (selectedMaps.length === 0) return; // TODO:  Add a toast to remind user to select a map
    const chromRegex = /^chrom([1-9]|1[0-9]|2[0-3]|X|Y):[0-9]+-[0-9]+$/;
    let updatedChrom = false;
    if (!chromRegex.test(chrom1) || !chromRegex.test(chrom2)) {
      console.log("Invalid chrom format");
      return;
    }
    selectedMaps.map((id) => {
      if (id != "All") {
        const newChrom1 = getNewChromZoomIn(chrom1, zoomInLevel);
        const newChrom2 = getNewChromZoomIn(chrom2, zoomInLevel);

        let query = { chrom1: newChrom1, chrom2: newChrom2 };
        dispatch(updateApiChromQuery({ id: parseInt(id) - 1, query }));
        if (!updatedChrom) {
          handleSetChrom(newChrom1, newChrom2);
          updatedChrom = true;
        }
      }
    });
  };
  const zoomMapOut = () => {
    if (selectedMaps.length === 0) return; // TODO:  Add a toast to remind user to select a map
    const chromRegex = /^chrom([1-9]|1[0-9]|2[0-3]|X|Y):[0-9]+-[0-9]+$/;
    let updatedChrom = false;
    if (!chromRegex.test(chrom1) || !chromRegex.test(chrom2)) {
      console.log("Invalid chrom format");
      return;
    }
    selectedMaps.map((id) => {
      if (id != "All") {
        const newChrom1 = getNewChromZoomOut(chrom1, zoomInLevel);
        const newChrom2 = getNewChromZoomOut(chrom2, zoomInLevel);

        let query = { chrom1: newChrom1, chrom2: newChrom2 };
        dispatch(updateApiChromQuery({ id: parseInt(id) - 1, query }));
        if (!updatedChrom) {
          handleSetChrom(newChrom1, newChrom2);
          updatedChrom = true;
        }
      }
    });
  };

  const handleMapMove = (type: MoveDirType) => {
    if (selectedMaps.length === 0) return; // TODO:  Add a toast to remind user to select a map

    const chromRegex = /^chrom([1-9]|1[0-9]|2[0-3]|X|Y):[0-9]+-[0-9]+$/;
    let updatedChrom = false;
    if (!chromRegex.test(chrom1) || !chromRegex.test(chrom2)) {
      console.log("Invalid chrom format");
      return;
    }

    let newChrom1 = chrom1;
    let newChrom2 = chrom2;
    selectedMaps.map((id) => {
      if (id != "All") {
        if (type === "up") {
          newChrom2 = getNewChromeMove(chrom2, "left");
        } else if (type === "down") {
          newChrom2 = getNewChromeMove(chrom2, "right");
        } else if (type === "left") {
          newChrom1 = getNewChromeMove(chrom1, "left");
        } else {
          newChrom1 = getNewChromeMove(chrom1, "right");
        }
        //console.log(newChrom1, newChrom2);

        let query = { chrom1: newChrom1, chrom2: newChrom2 };
        dispatch(updateApiChromQuery({ id: parseInt(id) - 1, query }));
        if (!updatedChrom) {
          handleSetChrom(newChrom1, newChrom2);
          updatedChrom = true;
        }
      }
    });
  };

  const handleSetChrom = (chr1: string, chr2: string) => {
    setChrom1(chr1);
    setChrom2(chr2);
  };

  const handleUpdateQueryChrom = () => {
    if (selectedMaps.length === 0) return; // TODO:  Add a toast to remind user to select a map
    const chromRegex = /^chrom([1-9]|1[0-9]|2[0-3]|X|Y):[0-9]+-[0-9]+$/;
    let updatedChrom = false;
    if (!chromRegex.test(chrom1) || !chromRegex.test(chrom2)) {
      console.log("Invalid chrom format");
      return;
    }
    selectedMaps.map((id) => {
      if (id != "All") {
        let validatedChrom1 = validateChrom(chrom1);
        let validatedChrom2 = validateChrom(chrom2);

        let query = { chrom1: validatedChrom1, chrom2: validatedChrom2 };
        dispatch(updateApiChromQuery({ id: parseInt(id) - 1, query }));
        if (!updatedChrom) {
          handleSetChrom(validatedChrom1, validatedChrom2);
          updatedChrom = true;
        }
      }
    });
  };

  const handleSelectChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[];
    if (selectedMaps.includes("All") && !selectedValues.includes("All")) {
      setSelectedMaps([]);
      handleSetChrom("", "");
    } else if (
      selectedValues.includes("All") &&
      !selectedMaps.includes("All")
    ) {
      setSelectedMaps([...maps, "All"]);
      handleSetChrom(
        heatmap_state.apiCalls[0].query.chrom1,
        heatmap_state.apiCalls[0].query.chrom2
      );
    } else {
      setSelectedMaps(selectedValues.filter((e) => e != "All"));
      if (selectedValues.length === 0) {
        handleSetChrom("", "");
      } else {
        let id = parseInt(selectedValues[0]);
        handleSetChrom(
          heatmap_state.apiCalls[0].query.chrom1,
          heatmap_state.apiCalls[0].query.chrom2
        );
      }
    }
  };
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="center" alignItems="center">
        <FormControl
          sx={{
            width: "100%",
          }}
        >
          <InputLabel id="demo-simple-select-label">Select Map</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            value={selectedMaps}
            multiple
            onChange={handleSelectChange}
            label="Select Map"
            renderValue={(selected) =>
              (selected as string[])
                .filter((val) => val !== "All")
                .sort()
                .join(", ")
            }
          >
            {maps.map((map, index) => (
              <MenuItem key={index} value={map}>
                <Checkbox checked={selectedMaps.indexOf(map) > -1} />
                <ListItemText primary={`Contact Map ${map}`} />
              </MenuItem>
            ))}
            <MenuItem value="All">
              <Checkbox checked={selectedMaps.includes("All")} />
              <ListItemText primary="All" />
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        paddingTop={4}
      >
        <Typography variant="h5" color={colors.grey[100]}>
          Query region
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="success"
            onClick={handleUpdateQueryChrom}
          >
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
          value={chrom1}
          onChange={(e) => setChrom1(e.target.value)}
        />
      </Box>
      <Box paddingTop={2}>
        <TextField
          label="Chrom2"
          variant="outlined"
          size="small"
          fullWidth
          value={chrom2}
          onChange={(e) => setChrom2(e.target.value)}
        />
      </Box>
      <Box display="flex" flexDirection="column" marginTop={4}>
        <Typography variant="h5" color={colors.grey[100]}>
          Controls
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginTop={2}
          sx={{
            border: 2,
            borderRadius: 2,
            borderColor: colors.primary[500],
            padding: 4,
            height: "13vh",
          }}
        >
          <ControlButtons
            onUp={() => handleMapMove("up")}
            onDown={() => handleMapMove("down")}
            onLeft={() => handleMapMove("left")}
            onRight={() => handleMapMove("right")}
          />
          <Box
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
            }}
          >
            <Tooltip title="Zoom Out" arrow>
              <IconButton onClick={zoomMapOut} aria-label="zoom out">
                <RemoveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In" arrow>
              <IconButton onClick={zoomMapIn} aria-label="zoom in">
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HicMapConfig;
