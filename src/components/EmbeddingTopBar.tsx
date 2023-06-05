import { useState } from "react";

import { styled } from "@mui/system";
import { tokens } from "../theme";
import { Box, useTheme, Grid, IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";

const MyStyledButton = styled(IconButton)(({ theme }) => ({
  //backgroundColor: tokens(theme.palette.mode).primary[300],
}));

type EmbedTopBarProps = {
  isZoom: boolean;
  handleZoomToggle: () => void;
};

const EmbedTopBar: React.FC<EmbedTopBarProps> = ({
  isZoom,
  handleZoomToggle,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      top="-6%"
      position="absolute"
      width="90%"
      height="6%"
      display="flex"
      justifyContent="flex-end"
    >
      <MyStyledButton
        style={{
          backgroundColor: isZoom ? colors.primary[300] : colors.primary[400],
        }}
        onClick={() => !isZoom && handleZoomToggle()}
      >
        <ZoomInIcon />
      </MyStyledButton>
      <MyStyledButton
        style={{
          backgroundColor: !isZoom ? colors.primary[300] : colors.primary[400],
        }}
        onClick={() => isZoom && handleZoomToggle()}
      >
        <HighlightAltIcon />
      </MyStyledButton>
    </Box>
  );
};

export default EmbedTopBar;
