import React from "react";
import { useState } from "react";
import { tokens } from "../../theme";
import { Box, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import HicMapConfig from "./HicMapConfig";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

const DashboardContol: React.FC = () => {
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

export default DashboardContol;
