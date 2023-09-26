import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiEndpoint = "128.2.220.67:8020";

type datasetType = {
  name: string;
  description: string;
  resolutions: string;
  cells: number;
};
type ContactMapRequest = {
  chrom1: string;
  chrom2: string;
  dataset_name: string;
  resolution: string;
  cell_id: string | string[];
};

type TrackRequest = {
  type: string;
  chrom1: string;
  dataset_name: string;
  resolution: string;
  cell_id: string | string[];
};

type ChromLenQueryRequest = {
  name: string;
  resolution: string;
  cell_id: string;
};

type EmbedQueryRequest = {
  dataset_name: string;
  resolution: string;
  embed_type: string;
};

type SpatialQueryRequest = {
  dataset_name: string;
  resolution: string;
  gene_name: string;
};

type RawDatum = [number, number, string];
type SpatialDatum = [number, number, number];
export const rootApi = createApi({
  reducerPath: "rootApi",
  baseQuery: fetchBaseQuery({ baseUrl: `http://${apiEndpoint}/api` }),
  endpoints: (builder) => ({
    getDatasets: builder.query<datasetType[], void>({
      query: () => "/datasets",
    }),
    getDataset: builder.query<datasetType, number>({
      query: (pk) => `/datasets/${pk}/`,
    }),
    fetchContactMapData: builder.query<number[][], ContactMapRequest>({
      query: (payload) => ({
        url: `/query`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchTrackData: builder.query<number[], TrackRequest>({
      query: (payload) => ({
        url: `/track`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchChromLen: builder.query<number[], ChromLenQueryRequest>({
      query: (payload) => ({
        url: `/chromlens`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchEmbed: builder.query<RawDatum[], EmbedQueryRequest>({
      query: (payload) => ({
        url: `/embed`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchSpatial: builder.query<SpatialDatum[], SpatialQueryRequest>({
      query: (payload) => ({
        url: `/spatial`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
  }),
});

export const {
  useGetDatasetsQuery,
  useGetDatasetQuery,
  useFetchContactMapDataQuery,
  useFetchTrackDataQuery,
  useFetchChromLenQuery,
  useFetchEmbedQuery,
  useFetchSpatialQuery,
} = rootApi;
