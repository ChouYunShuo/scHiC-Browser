import React, { useState } from "react";
import { Box, Typography, Checkbox, ClickAwayListener } from "@mui/material";
import { useTheme } from "@mui/system";
import { tokens } from "../theme";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  updateMapSelectRegion,
  updateMapShowChromPos,
} from "../redux/heatmap2DSlice";
type ComponentProps = {
  map_id: number;
  isVisible: boolean;
  handleVisToggle: () => void;
};

const GridLayoutCMapSetting: React.FC<ComponentProps> = ({
  map_id,
  isVisible,
  handleVisToggle,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const showChromPos = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id].showChromPos
  );
  const selectRegion = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id].selectRegion
  );
  const [showChromChecked, setShowChromChecked] = useState(showChromPos);
  const [selectRegionChecked, setSelectRegionChecked] = useState(selectRegion);
  const dispatch = useAppDispatch();

  const handleClickAway = () => {
    handleVisToggle();
  };

  const handleShowChromChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowChromChecked(event.target.checked);
    dispatch(
      updateMapShowChromPos({
        id: map_id,
        showChromPos: event.target.checked,
      })
    );
  };

  const handleSelectRegionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectRegionChecked(event.target.checked);
    dispatch(
      updateMapSelectRegion({
        id: map_id,
        selectRegion: event.target.checked,
      })
    );
  };

  return (
    <Box
      sx={{
        position: "absolute", // add this line
        top: 36,
        right: 0,
        padding: 1,
        borderRadius: 1,
        backgroundColor: colors.primary[400],
        width: "80%", // you may adjust this as needed
        color: colors.text[100], // for text color
        zIndex: 100,
        boxShadow: 3,
      }}
    >
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingX={1}
        >
          <Typography variant="body1">Show chrome location</Typography>
          <Checkbox
            checked={showChromChecked}
            onChange={handleShowChromChange}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </Box>
      </ClickAwayListener>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingX={1}
        >
          <Typography variant="body1">Select Region</Typography>
          <Checkbox
            checked={selectRegionChecked}
            onChange={handleSelectRegionChange}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </Box>
      </ClickAwayListener>
    </Box>
  );
};

export default GridLayoutCMapSetting;
