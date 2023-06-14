import React from "react";
import { styled } from "@mui/system";
import { Box, IconButton, useTheme, Typography } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import logoDark from "../../assets/scViz_logo.png";
import logoLight from "../../assets/scViz_logo_light.png";
const TopBarTypography = styled(Typography)(({ theme }) => ({
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
          src={theme.palette.mode === "dark" ? logoDark : logoLight}
          alt="Logo"
          style={{ height: "2em", marginRight: "1em" }}
        />
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <TopBarTypography variant="h4" color={colors.grey[100]}>
            CellScope
          </TopBarTypography>
          <TopBarTypography
            variant="h5"
            color={colors.grey[100]}
            marginLeft={2}
          >
            Dashboard
          </TopBarTypography>
          <TopBarTypography
            variant="h5"
            marginLeft={1}
            color={colors.grey[100]}
          >
            Datasets
          </TopBarTypography>
        </Box>
      </Box>

      {/* ICONS */}
      <Box display="flex" justifyContent="flex-end" flexGrow={1}>
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
