import React from "react";
import { useState } from "react";
import { tokens } from "../../theme";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import LayersIcon from "@mui/icons-material/Layers";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HicMapConfig from "./HicMapConfig";
import UmapConfig from "./UmapConfig";

interface SidebarItemProps {
  selected?: boolean;
  aboveSelected?: boolean;
  belowSelected?: boolean;
  onClick?: () => void;
}

const SidebarItem = styled(Box)<SidebarItemProps>(
  ({ theme, selected, aboveSelected, belowSelected }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: selected
      ? tokens(theme.palette.mode).primary[400]
      : tokens(theme.palette.mode).primary[500],
    cursor: "pointer",
    userSelect: "none",
    borderTopRightRadius: aboveSelected ? 10 : 0,
    borderBottomRightRadius: belowSelected ? 10 : 0,
    color: tokens(theme.palette.mode).grey[400],
    "&:hover": {
      color: tokens(theme.palette.mode).grey[200], // color of text and icons on hover
    },
  })
);

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selected, setSelected] = useState<number | null>(null);

  const handleItemClick = (id: number) => {
    if (selected == id) {
      setSelected(null);
    } else setSelected(id);
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 80,
          height: "100vh",
          backgroundColor: colors.primary[400],
          borderRight: selected ? 0 : 1,
          borderColor: colors.primary[400],
        }}
      >
        <SidebarItem
          selected={selected === 1}
          aboveSelected={false}
          belowSelected={selected === 2}
          onClick={() => handleItemClick(1)}
        >
          <DashboardIcon />
          Layout
        </SidebarItem>
        <SidebarItem
          selected={selected === 2}
          belowSelected={selected === 3}
          aboveSelected={selected === 1}
          onClick={() => handleItemClick(2)}
        >
          <LayersIcon />
          HiC Map
        </SidebarItem>
        <SidebarItem
          selected={selected === 3}
          aboveSelected={selected === 2}
          belowSelected={false}
          onClick={() => handleItemClick(3)}
        >
          <ScatterPlotIcon />
          Umap
        </SidebarItem>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: colors.primary[500],
            borderTopRightRadius: selected === 3 ? 10 : 0,
          }}
        ></Box>
      </Box>

      {selected && (
        <Box
          sx={{
            backgroundColor: colors.primary[400],
            padding: 2,
            width: 240,
          }}
        >
          {selected === 2 ? (
            <HicMapConfig />
          ) : selected === 3 ? (
            <UmapConfig />
          ) : (
            <Typography variant="h5">Layout Design</Typography>
          )}
          {/* Add more content as needed */}
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
