import { styled } from "@mui/system";
import { tokens } from "../../theme";
import { Box, useTheme, Grid, IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import InvertColorsIcon from "@mui/icons-material/InvertColors";

type SpatialTopBarProps = {
  isCellSelect: boolean;
  handleColorToggle: () => void;
};

const SpatialTopBar: React.FC<SpatialTopBarProps> = ({
  isCellSelect,
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
    </Box>
  );
};

export default SpatialTopBar;
