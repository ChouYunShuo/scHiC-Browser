import { TextField, Box, Typography, useTheme } from "@mui/material";

import { tokens } from "../../theme";
type DataType = {
  Dataset: {
    title: string;
    desc: string;
  };
  Cells: number;
  Tissue: string;
  Organism: string;
};

export const ColumnFilter: React.FC<{
  column: any;
}> = ({ column }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { render, filterValue, setFilter } = column;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setFilter(value || undefined);
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography color={colors.text[300]} width="30%">
        {render("Header")}:{" "}
      </Typography>
      <TextField
        value={filterValue || ""}
        onChange={handleChange}
        placeholder={"enter filter..."}
        size="small"
        variant="outlined"
      />
    </Box>
  );
};
