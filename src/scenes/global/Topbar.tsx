import React from "react";
import { styled } from "@mui/system";
import { Box, IconButton, useTheme, Typography } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import logo from "../../assets/scViz_logo.png";

const TopBarTypography = styled(Typography)(({ theme }) => ({
  variant: "subtitle1",
  color: tokens(theme.palette.mode).grey[200],
  "&:hover": {
    color: tokens(theme.palette.mode).grey[100], // choose a lighter color on hover
    cursor: "pointer",
  },
}));

const Topbar: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  return (
    <Box
      display="flex"
      p={1}
      sx={{ borderBottom: 2, borderColor: colors.primary[400] }}
    >
      <Box width="30%" display="flex" alignItems="center" ml={1}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "2em", marginRight: "2em" }}
        />
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <TopBarTypography variant="h5" color={colors.grey[100]}>
            Dashboard
          </TopBarTypography>
          <TopBarTypography variant="h5" color={colors.grey[100]}>
            Datasets
          </TopBarTypography>
        </Box>
      </Box>

      {/* ICONS */}
      <Box display="flex" justifyContent="flex-end" width="100%">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton>
          <GitHubIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
