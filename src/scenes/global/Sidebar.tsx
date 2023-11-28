import React from "react";
import { useState } from "react";
import { tokens } from "../../theme";
import { Box, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import shouldForwardProp from "@styled-system/should-forward-prop";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import LayersIcon from "@mui/icons-material/Layers";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HicMapConfig from "./HicMapConfig";
import UmapConfig from "./UmapConfig";
import { updateSelectedSidebarItem } from "../../redux/heatmap2DSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
interface SidebarItemProps {
  selected?: boolean;
  aboveSelected?: boolean;
  belowSelected?: boolean;
  onClick?: () => void;
}

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selected, setSelected] = useState<number | null>(null);

  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        borderBottom: 1,
        borderColor: colors.primary[400],
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          width: "100%",
          height: "60px",
          backgroundColor: colors.primary[500],
          ml: 2,
        }}
      >
        <HicMapConfig />
      </Box>
    </Box>
  );
};

export default Sidebar;
