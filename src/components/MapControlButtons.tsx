import React from "react";
import { Box, useTheme, Tooltip } from "@mui/material";
import { tokens } from "../theme";
import IconButton from "@mui/material/IconButton";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

interface ControlButtonsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100px",
      }}
    >
      <Tooltip title="Move Up" arrow>
        <IconButton onClick={onUp} aria-label="move up">
          <ArrowDropUpIcon />
        </IconButton>
      </Tooltip>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100px",
        }}
      >
        <Tooltip title="Move Left" arrow>
          <IconButton onClick={onLeft} aria-label="move left">
            <ArrowLeftIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move Right" arrow>
          <IconButton onClick={onRight} aria-label="move right">
            <ArrowRightIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Tooltip title="Move Down" arrow>
        <IconButton onClick={onDown} aria-label="move down">
          <ArrowDropDownIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ControlButtons;
