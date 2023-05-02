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
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
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
