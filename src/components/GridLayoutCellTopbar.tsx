import { useState } from "react";
import { styled, Box, Typography, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/system";

import { tokens } from "../theme";
import GridLayoutCMapSetting from "./GridLayoutCmapSetting";

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
      <Box display="flex">
        <GrabBox
          className="dragHandle"
          flexGrow={1}
          display="flex"
          alignItems="center"
          paddingX={1}
        >
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
            {type === "embed" ? `Scatter Plot(Umap)` : null}
            {type === "spatial" ? `Spatial Coords` : null}
            {type === "cmap" ? `Contact Map ${id + 1}` : null}
          </Typography>
        </GrabBox>
        <Box display="flex" justifyContent="flex-end">
          <div onClick={handleShowToggle}>
            <IconButton
              sx={{
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: colors.border[100],
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </div>
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

export default GridLayoutCellTopbar;
