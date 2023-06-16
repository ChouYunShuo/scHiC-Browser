import React, { useState } from "react";
import { Box, Typography, Checkbox, ClickAwayListener } from "@mui/material";
import { useTheme } from "@mui/system";
import { tokens } from "../theme";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updateMapShowChromPos } from "../redux/heatmap2DSlice";
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
  const [checked, setChecked] = useState(showChromPos);
  const dispatch = useAppDispatch();

  const handleClickAway = () => {
    handleVisToggle();
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    dispatch(
      updateMapShowChromPos({
        id: map_id,
        showChromPos: event.target.checked,
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
            checked={checked}
            onChange={handleCheckboxChange}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </Box>
      </ClickAwayListener>
    </Box>
  );
};

export default GridLayoutCMapSetting;
