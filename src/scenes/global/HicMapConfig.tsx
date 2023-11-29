import React, { useEffect, useState } from "react";
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
  useTheme,
  Checkbox,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { tokens } from "../../theme";
import { updateApiChromQuery } from "../../redux/heatmap2DSlice";
import {
  getNewChromZoomIn,
  getNewChromZoomOut,
  validateChrom,
} from "../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const HicMapConfig: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const dispatch = useAppDispatch();
  const [zoomInLevel, setZoomInLevel] = useState<number>(2);
  const [zoomOutLevel, setZoomOutLevel] = useState<number>(2);
  const [selectedMaps, setSelectedMaps] = useState<string[]>(["1"]);
  const reduxCalls = heatmap_state.apiCalls;

  const [chrom1, setChrom1] = useState<string>(
    heatmap_state.apiCalls[0].query.chrom1
  );
  const [chrom2, setChrom2] = useState<string>(
    heatmap_state.apiCalls[0].query.chrom2
  );

  const mapCnt = heatmap_state.map_cnts;
  const maps = map(range(mapCnt), (val) => `${val + 1}`);

  useEffect(() => {
    if (selectedMaps.length > 0) {
      const selectedMapIndex = parseInt(selectedMaps[0], 10) - 1;
      handleSetChrom(
        reduxCalls[selectedMapIndex].query.chrom1,
        reduxCalls[selectedMapIndex].query.chrom2
      );
    } else {
      handleSetChrom("", "");
    }
  }, [reduxCalls]);

  const zoomMapIn = () => {
    if (selectedMaps.length === 0) return; // TODO:  Add a toast to remind user to select a map
    const chromRegex = /^chr([1-9]|1[0-9]|2[0-3]|X|Y):[0-9]+-[0-9]+$/;
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
    const chromRegex = /^chr([1-9]|1[0-9]|2[0-3]|X|Y):[0-9]+-[0-9]+$/;
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

  const handleSetChrom = (chr1: string, chr2: string) => {
    setChrom1(chr1);
    setChrom2(chr2);
  };

  const handleUpdateQueryChrom = () => {
    if (selectedMaps.length === 0) return; // TODO:  Add a toast to remind user to select a map
    const chromRegex = /^chr([1-9]|1[0-9]|2[0-3]|X|Y):[0-9]+-[0-9]+$/;
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
        let id = parseInt(selectedValues[0], 10) - 1;
        handleSetChrom(
          heatmap_state.apiCalls[id].query.chrom1,
          heatmap_state.apiCalls[id].query.chrom2
        );
      }
    }
  };
  return (
    <Box
      display="flex"
      flexDirection="row"
      gap={2}
      alignItems="center"
      width="40%"
    >
      <FormControl
        sx={{
          width: "20%",
        }}
        size="small"
      >
        <InputLabel id="demo-simple-select-label">Select Map</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          value={selectedMaps}
          multiple
          onChange={handleSelectChange}
          label="Select Maps"
          renderValue={(selected) =>
            (selected as string[])
              .filter((val) => val !== "All")
              .sort()
              .join(", ")
          }
        >
          {maps.map((map, index) => (
            <MenuItem key={index} value={map}>
              <Checkbox
                color="success"
                checked={selectedMaps.indexOf(map) > -1}
              />
              <ListItemText primary={`Contact Map ${map}`} />
            </MenuItem>
          ))}
          <MenuItem value="All">
            <Checkbox checked={selectedMaps.includes("All")} />
            <ListItemText primary="All" />
          </MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          label="Chr1"
          variant="outlined"
          size="small"
          fullWidth
          value={chrom1}
          onChange={(e) => setChrom1(e.target.value)}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          label="Chr2"
          variant="outlined"
          size="small"
          fullWidth
          value={chrom2}
          onChange={(e) => setChrom2(e.target.value)}
        />
      </Box>

      <Button
        variant="outlined"
        color="success"
        onClick={handleUpdateQueryChrom}
      >
        Send
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center">
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
  );
};

export default HicMapConfig;
