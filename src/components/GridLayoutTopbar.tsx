import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/system";
import { tokens } from "../theme";
import GridLayoutCMapSetting from "./GridLayoutSetting";

type GridLayoutTopbarProps = {
  id: number;
  type: string;
};

const GridLayoutTopbar: React.FC<GridLayoutTopbarProps> = ({ id, type }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);

  const handleShowToggle = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" className="dragHandle" sx={{ cursor: "grab" }}>
        <Box display="flex" alignItems="center" paddingX={1}>
          <Typography
            variant="h5"
            color={colors.grey[100]}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 1,
            }}
          >
            {type === "scatter" ? `Scatter Plot(Umap)` : null}
            {type === "cmap" ? `Contact Map ${id + 1}` : null}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end" flexGrow={1}>
          <IconButton onClick={handleShowToggle}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>
      {open && type === "cmap" && (
        <GridLayoutCMapSetting
          map_id={id}
          isVisible={open}
          handleVisToggle={handleShowToggle}
        />
      )}
    </Box>
  );
};

export default GridLayoutTopbar;
