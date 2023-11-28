import { tokens } from "../../theme";
import { Box, useTheme, Tooltip, IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import InvertColorsIcon from "@mui/icons-material/InvertColors";

type EmbeddingControlsProps = {
  isZoom: boolean;
  isCellSelect: boolean;
  handleZoomToggle: () => void;
  handleColorToggle: () => void;
};

const EmbeddingControls: React.FC<EmbeddingControlsProps> = ({
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
      <Tooltip title="Toggle color" arrow>
        <IconButton
          style={{
            color: isCellSelect ? colors.grey[100] : colors.grey[600],
            marginRight: "20px",
          }}
          onClick={() => handleColorToggle()}
        >
          <InvertColorsIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom/Pan" arrow>
        <IconButton
          onClick={() => !isZoom && handleZoomToggle()}
          style={{
            color: isZoom ? colors.grey[100] : colors.grey[600],
          }}
        >
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Lasso select" arrow>
        <IconButton
          onClick={() => isZoom && handleZoomToggle()}
          style={{
            color: !isZoom ? colors.grey[100] : colors.grey[600],
          }}
        >
          <HighlightAltIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default EmbeddingControls;
