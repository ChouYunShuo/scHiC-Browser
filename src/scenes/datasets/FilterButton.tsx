import React, { useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Popover,
  useTheme,
  Button,
  Typography,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { tokens } from "../../theme";
interface FilterButtonProps {
  instance: any;
}

const FilterButton: React.FC<FilterButtonProps> = ({ instance }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { allColumns, setAllFilters } = instance;

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const resetFilters = useCallback(() => {
    setAllFilters([]);
    handleFilterClose();
  }, [setAllFilters, handleFilterClose]);

  const open = Boolean(anchorEl);
  const id = open ? "filter-popover" : undefined;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      position="fixed"
      top="7vh"
      right="2vw"
    >
      <Tooltip title="Filter" arrow>
        <IconButton
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: colors.border[100],
            },
          }}
          onClick={handleFilterClick}
        >
          <FilterListIcon />
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box
          sx={{ padding: 2 }}
          display="flex"
          flexDirection="column"
          bgcolor={colors.primary[400]}
        >
          <Box
            sx={{ padding: 1 }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderRadius={2}
          >
            <Typography variant="h4">Filters</Typography>
            <Button variant="outlined" color="error" onClick={resetFilters}>
              Reset
            </Button>
          </Box>
          <Box>
            {allColumns
              //@ts-ignore
              .filter((column) => column.canFilter)
              //@ts-ignore
              .map((column) => (
                <Box margin={1} key={column.id}>
                  {column.render("Filter")}
                </Box>
              ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default FilterButton;
