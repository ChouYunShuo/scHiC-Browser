import React, { useMemo } from "react";
import _ from "lodash";
import { Box, Typography, useTheme, CircularProgress } from "@mui/material";
import { Cell, Column } from "react-table";
import { tokens } from "../../theme";
import { useGetDatasetsQuery } from "../../redux/apiSlice";
import DataTable from "./dataTable";
import { ColumnFilter } from "./dataFilters";

type DataType = {
  name: string;
  description: string;
  cells: number;
  resolutions: number;
};

const DataPage: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    data: allDataset,
    error: error_getDataSet,
    isFetching,
  } = useGetDatasetsQuery();

  // const desc: string [] = useMemo(,[])
  // const data: DataType[] = useMemo(
  //   () =>
  //     _.range(1, 101).map((idx) => ({
  //       Dataset: `Dataset ${idx}`,
  //       Cells: idx * 10,
  //       Tissue: `Tissue${idx}`,
  //       Organism: `Organism${idx}`,
  //     })),
  //   []
  // );
  //@ts-ignore
  const columns: Column<DataType>[] = useMemo(
    () => [
      {
        id: "dataset_description", // Adding a custom id
        Header: "Datasets",
        accessor: (d: DataType) => `${d.name}\n${d.description}`,
        //@ts-ignore
        Cell: ({ value }) => (
          <Box>
            {/* @ts-ignore */}
            {value.split("\n").map((item, i) =>
              i == 0 ? (
                <Box key={i}>
                  <Typography variant="h5">{item}</Typography>
                </Box>
              ) : (
                <Box key={i}>
                  <Typography color={colors.text[300]}>{item}</Typography>
                </Box>
              )
            )}
          </Box>
        ),
        width: "34%", // Adjust width to your needs
        Filter: ColumnFilter,
      },
      {
        Header: "Cells",
        accessor: "cells",
        width: "22%",
        Filter: ColumnFilter,
      },
      {
        Header: "Resolutions",
        accessor: "resolutions",
        width: "22%",
        Filter: ColumnFilter,
      },
    ],
    []
  );

  return !allDataset ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={200}
      width="100%"
    >
      <CircularProgress style={{ color: colors.text[100] }} />
    </Box>
  ) : (
    <Box>
      <DataTable data={allDataset} columns={columns} />
    </Box>
  );
};

export default DataPage;
