import { styled } from "@mui/system";
import { tokens } from "../../theme";
import { Box, useTheme, Grid, IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import InvertColorsIcon from "@mui/icons-material/InvertColors";

type Scatter2DControlsProps = {
  isZoom: boolean;
  isCellSelect: boolean;
  handleZoomToggle: () => void;
  handleColorToggle: () => void;
};

const Scatter2DControls: React.FC<Scatter2DControlsProps> = ({
  isZoom,
  isCellSelect,
  handleZoomToggle,
  handleColorToggle,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      margin={1}
      position="absolute"
      display="flex"
      justifyContent="flex-start"
    >
      <IconButton
        style={{
          backgroundColor: isCellSelect
            ? colors.primary[300]
            : colors.primary[400],
          marginRight: "20px",
        }}
        onClick={() => handleColorToggle()}
      >
        <InvertColorsIcon />
      </IconButton>
      <IconButton
        style={{
          backgroundColor: isZoom ? colors.primary[300] : colors.primary[400],
        }}
        onClick={() => !isZoom && handleZoomToggle()}
      >
        <ZoomInIcon />
      </IconButton>
      <IconButton
        style={{
          backgroundColor: !isZoom ? colors.primary[300] : colors.primary[400],
        }}
        onClick={() => isZoom && handleZoomToggle()}
      >
        <HighlightAltIcon />
      </IconButton>
    </Box>
  );
};

export default Scatter2DControls;
