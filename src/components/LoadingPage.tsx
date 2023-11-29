import * as React from "react";
import { Box } from "@mui/material";
import { styled, keyframes } from "@mui/system";
import { tokens } from "../theme";
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const StyledSpinner = styled("div")(({ theme }) => ({
  border: `4px solid ${tokens(theme.palette.mode).primary[500]}`,
  borderTop: `4px solid ${tokens(theme.palette.mode).grey[200]}`,
  borderRadius: "50%",
  width: "20px",
  height: "20px",
  animation: `${rotate} 2s linear infinite`,
}));

const LoadingSpinner: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    }}
  >
    <StyledSpinner />
  </Box>
);

export default LoadingSpinner;
