import React from "react";
import { Box, Typography } from "@mui/material";

const Error404: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Typography variant="h1" color="textPrimary">
        404
      </Typography>
      <Typography variant="h4" color="textPrimary">
        Page Not Found
      </Typography>
      <Typography variant="body1" color="textSecondary">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </Typography>
    </Box>
  );
};

export default Error404;
