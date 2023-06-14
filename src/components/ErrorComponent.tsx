import React from "react";
import { Box, Typography } from "@mui/material";

const ErrorAPI: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="80%"
      margin="auto"
    >
      <Typography variant="h1" color="Secondary">
        Oops!
      </Typography>
      <Typography variant="h4" color="textPrimary">
        Server error
      </Typography>
      <Typography variant="body1" color="textSecondary">
        It looks like something went wrong on our end. We're experiencing some
        technical difficulties and our team is working to resolve this as
        quickly as possible.
      </Typography>
    </Box>
  );
};

export default ErrorAPI;
