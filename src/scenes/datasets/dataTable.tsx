import React, { useState } from "react";
import { useFilters, usePagination, useSortBy, useTable } from "react-table";
import {
  SvgIconTypeMap,
  FormControl,
  TableSortLabel,
  Tooltip,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material";
import { OverridableComponent } from "@mui/types";
import { tokens } from "../../theme";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LastPageIcon from "@mui/icons-material/LastPage";
import FilterButton from "./FilterButton";
interface DataTableProps {
  columns: any;
  data: any;
}

interface PaginationButtonProps {
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  onClick: () => void;
  disabled: boolean;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  Icon,
  onClick,
  disabled,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      sx={{
        borderRadius: 1,
        "&:hover": {
          backgroundColor: colors.border[100],
        },
      }}
    >
      <Icon />
    </IconButton>
  );
};

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const instance = useTable(
    //@ts-ignore
    { columns, data, initialState: { pageSize: 10 } },
    useFilters,
    useSortBy,
    usePagination
  ) as any;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    pageCount,
    gotoPage,
    state: { pageIndex, pageSize },
    setPageSize,
  } = instance;

  return (
    <TableContainer sx={{ padding: 3, width: "98vw", position: "relative" }}>
      <FilterButton instance={instance} />
      <Table
        {...getTableProps()}
        sx={{
          minWidth: 650,
          width: "100%",
          height: "80vh",
          [`& .${tableCellClasses.root}`]: {
            borderBottom: "none",
          },
        }}
      >
        <TableHead>
          {headerGroups.map((headerGroup: any) => (
            <TableRow
              sx={{ borderBottom: `1px solid ${colors.border[100]}` }}
              {...headerGroup.getHeaderGroupProps()}
            >
              {headerGroup.headers.map((column: any) => (
                <TableCell {...column.getHeaderProps()} width={column.width}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {column.canSort ? (
                      <Tooltip title={"Toggle SortBy"}>
                        <TableSortLabel
                          active={column.isSorted} // Change this line
                          direction={column.isSortedDesc ? "desc" : "asc"}
                          onClick={() =>
                            column.toggleSortBy(!column.isSortedDesc)
                          }
                        >
                          <Typography variant="h4">
                            {column.render("Header")}
                          </Typography>
                        </TableSortLabel>
                      </Tooltip>
                    ) : (
                      <Typography variant="h4">
                        {column.render("Header")}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody {...getTableBodyProps()}>
          {page.map((row: any) => {
            prepareRow(row);
            return (
              <TableRow
                sx={{
                  borderBottom: `1px solid ${colors.border[100]}`,
                  width: "100%", // Ensure that the table row also spans the full width
                }}
                {...row.getRowProps()}
              >
                {row.cells.map((cell: any) => (
                  <TableCell {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Box
        width="100%"
        right={0}
        display="flex"
        justifyContent="flex-end"
        gap={1}
        alignItems="center"
        p={2}
      >
        <Typography variant="h6" marginRight={1}>
          Rows per page:{" "}
        </Typography>
        <FormControl variant="standard" sx={{ mr: 3, minWidth: 80 }}>
          <Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[5, 10, 25, 50].map((pageSizeOption) => (
              <MenuItem key={pageSizeOption} value={pageSizeOption}>
                {pageSizeOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box marginRight={2}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Page: {pageIndex + 1} of {pageCount}
          </Typography>{" "}
        </Box>
        <PaginationButton
          Icon={FirstPageIcon}
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        />
        <PaginationButton
          Icon={NavigateBeforeIcon}
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        />
        <PaginationButton
          Icon={NavigateNextIcon}
          onClick={() => nextPage()}
          disabled={!canNextPage}
        />
        <PaginationButton
          Icon={LastPageIcon}
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        />
      </Box>
    </TableContainer>
  );
};

export default DataTable;
