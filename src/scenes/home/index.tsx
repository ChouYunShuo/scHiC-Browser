import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import config from "../../config.json";
import {
  Box,
  Grid,
  Typography,
  Container,
  CardMedia,
  CardContent,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import { tokens } from "../../theme";
const cards = [
  {
    img: { light: "light_map.png", dark: "dark_map.png" },
    title: "Single cell Hi-C Maps",
    desc: "CellScope enables visualizing multiple Hi-C contact maps simultaneously, with configurable views.",
  },
  {
    img: { light: "light_spatial.png", dark: "dark_spatial.png" },
    title: "Integrated visualization",
    desc: "Co-assayed spatial and 1D track data with single-cell Hi-C analysis, offering a comprehensive view of cellular interactions.",
  },
  {
    img: { light: "light_umap.png", dark: "dark_umap.png" },
    title: "Interactive Data Exploration",
    desc: "CellScope offers lasso cell selection with real-time pseudo-bulk map calculations and synchronized views.",
  },
];
const HeaderTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  "&:hover": {
    color: tokens(theme.palette.mode).text[100], // choose a lighter color on hover
    cursor: "pointer",
  },
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box>
      <Box textAlign="center" sx={{ p: 4, mt: 16 }}>
        <Box sx={{ fontWeight: "bold", fontSize: 42, mb: 4 }}>
          Visualize and explore chromosome interactions
        </Box>
        <Box
          sx={{
            fontWeight: "regular",
            fontSize: 24,
            mb: 8,
            color: colors.text[100],
          }}
        >
          CellScope enpowers you to visually explore your <br /> multiscale Hi-C
          data at the cellular level.
        </Box>

        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            backgroundColor: colors.blueAccent[500],
          }}
        >
          <Box
            sx={{
              fontWeight: "600",
              fontSize: "24px",
              mb: 10,
              color: colors.primary[500],
              backgroundColor: colors.greenAccent[500],
              textAlign: "center", // Center the text
              padding: "8px 24px", // Add some padding (adjust as needed)
              borderRadius: "12px", // Rounded borders
              boxShadow: 3,
              display: "inline-block", // Make the width fit the content
              "&:hover": {
                backgroundColor: colors.greenAccent[600],
                cursor: "pointer",
              },
            }}
          >
            Try a demo
          </Box>
        </Link>
      </Box>

      {/* cards */}
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        {cards.map((card, index) => (
          <Grid item xs={20} sx={{ mb: 8 }} key={index} id={`card${index + 1}`}>
            <Box
              sx={{
                display: "flex",
                height: "80vh",
                width: "60vw",
                alignItems: "center",
              }}
            >
              <CardMedia
                component="img"
                sx={{ width: "50%" }}
                image={
                  theme.palette.mode === "dark" ? card.img.dark : card.img.light
                }
                alt={`Card ${index + 1}`}
              />
              <CardContent sx={{ ml: 4, px: 5 }}>
                <Typography variant="h2" marginBottom={2}>
                  {card.title}
                </Typography>
                <Typography variant="h4">{card.desc}</Typography>
              </CardContent>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* {footer} */}
      <Box
        component="footer"
        sx={{
          padding: "20px 0",
          borderTop: 2,
          borderColor: colors.border[100],
        }}
      >
        <Container
          sx={{
            paddingY: "30px",
            color: colors.text[100],
          }}
        >
          <Box display="flex">
            <Box width="50%" display="flex" alignItems="center" ml={1} gap={2}>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                <HeaderTypography variant="h5" color={colors.text[200]}>
                  Documentation
                </HeaderTypography>
              </Link>
              <Typography variant="h5" color={colors.text[200]}>
                |
              </Typography>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                <HeaderTypography variant="h5" color={colors.text[200]}>
                  About
                </HeaderTypography>
              </Link>
              <Typography variant="h5" color={colors.text[200]}>
                |
              </Typography>
              <HeaderTypography
                variant="h5"
                color={colors.text[200]}
                style={{ textDecoration: "none", position: "relative" }}
              >
                <a
                  href={"mailto:" + config.contact}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Contact us
                </a>
              </HeaderTypography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              flexGrow={1}
            >
              <Typography variant="h5" align="right">
                © {new Date().getFullYear()} Carnegie Mellon University
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
