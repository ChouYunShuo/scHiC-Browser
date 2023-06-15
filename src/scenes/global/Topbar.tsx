import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { styled } from "@mui/system";
import { Box, IconButton, useTheme, Typography } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";

import { ColorModeContext, tokens } from "../../theme";
import logoDark from "../../assets/scViz_logo.png";
import logoLight from "../../assets/scViz_logo_light.png";

const TopBarTypography = styled(Typography)(({ theme }) => ({
  color: tokens(theme.palette.mode).text[200],
  fontWeight: 600,
  "&:hover": {
    color: tokens(theme.palette.mode).text[100], // choose a lighter color on hover
    cursor: "pointer",
  },
}));

type ItemType = "Dashboard" | "Datasets";
interface ItemProps {
  title: ItemType;
  to: string;
  selected: string;
  handleSelect: (title: ItemType) => void;
}

const UnderLine: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "1px",
        bgcolor: colors.grey[100],
        zIndex: 100,
      }}
    ></Box>
  );
};

const Item: React.FC<ItemProps> = ({ title, to, selected, handleSelect }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Link
      to={to}
      onClick={() => handleSelect(title)}
      style={{
        textDecoration: "none",
        color: colors.grey[100],
        position: "relative",
      }}
    >
      <TopBarTypography variant="h5" color={colors.grey[100]}>
        {title}
      </TopBarTypography>

      {selected === title && <UnderLine />}
    </Link>
  );
};

const Topbar: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [selected, setSelected] = useState<ItemType>("Dashboard");

  const handleSelect = (title: ItemType) => {
    setSelected(title);
  };
  return (
    <Box
      display="flex"
      p={1}
      sx={{ borderBottom: 2, borderColor: colors.border[100] }}
    >
      <Box width="30%" display="flex" alignItems="center" ml={1}>
        <img
          src={theme.palette.mode === "dark" ? logoDark : logoLight}
          alt="Logo"
          style={{ height: "2em", marginRight: "1em" }}
        />
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Typography
            variant="h4"
            marginRight={2}
            color={colors.text[100]}
            fontWeight={600}
          >
            CellScope
          </Typography>

          <Item
            title="Dashboard"
            to="/"
            selected={selected}
            handleSelect={handleSelect}
          ></Item>
          <Item
            title="Datasets"
            to="/datasets"
            selected={selected}
            handleSelect={handleSelect}
          ></Item>
        </Box>
      </Box>

      {/* ICONS */}
      <Box display="flex" justifyContent="flex-end" flexGrow={1}>
        <IconButton
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: colors.border[100],
            },
          }}
          onClick={colorMode.toggleColorMode}
        >
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: colors.border[100],
            },
          }}
        >
          <GitHubIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
