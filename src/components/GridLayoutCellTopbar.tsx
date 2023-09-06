import { useState } from "react";
import { styled, Box, Typography, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/system";

import { tokens } from "../theme";
import GridLayoutCMapSetting from "./GridLayoutCellSetting";

type GridLayoutTopbarProps = {
  id: number;
  type: string;
};
const GrabBox = styled(Box)({
  cursor: "grab",
  "&:active": {
    cursor: "grabbing",
  },
});
const GridLayoutCellTopbar: React.FC<GridLayoutTopbarProps> = ({
  id,
  type,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);

  const handleShowToggle = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <Box display="flex" flexDirection="column">
      <GrabBox display="flex" className="dragHandle">
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
            {type === "spatial" ? `Spatial Coords` : null}
            {type === "cmap" ? `Contact Map ${id + 1}` : null}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end" flexGrow={1}>
          <IconButton
            onClick={handleShowToggle}
            sx={{
              borderRadius: 1,
              "&:hover": {
                backgroundColor: colors.border[100],
              },
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </GrabBox>
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

export default GridLayoutCellTopbar;
