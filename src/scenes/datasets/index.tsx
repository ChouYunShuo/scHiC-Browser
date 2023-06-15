import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useGetDatasetsQuery } from "../../redux/apiSlice";
import Header from "../../components/Header";

const Datasets: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data: allDataset, error: error_getDataSet } = useGetDatasetsQuery();
  console.log(allDataset);
  const columns = [
    { field: "pk", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      cellClassName: "name-column--cell",
      flex: 1,
      maxWidth: 150,
    },
    {
      field: "description",
      headerName: "Dataser Description",
      flex: 1,
      headerAlign: "left",
      align: "left",
      width: 300,
    },
    {
      field: "cells",
      headerName: "Cell Count",
      flex: 1,
    },
    {
      field: "resolutions",
      headerName: "Resolutions",
      flex: 1,
      minWidth: 500,
    },
  ];

  return (
    <Box m="20px">
      <Header title="DATASETS" subtitle="Viewing all the scHiC datasets" />
      <Box m="40px 0 0 0" height="75vh">
        {allDataset && (
          <DataGrid
            checkboxSelection
            rows={allDataset}
            /* @ts-ignore */
            columns={columns}
            getRowId={(row: any) => row.pk}
          />
        )}
      </Box>
    </Box>
  );
};

export default Datasets;
