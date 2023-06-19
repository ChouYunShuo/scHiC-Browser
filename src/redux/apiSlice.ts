import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type datasetType = {
  name: string;
  description: string;
  resolutions: string;
  cells: number;
};
interface ContactMapRequest {
  chrom1: string;
  chrom2: string;
  dataset_name: string;
  resolution: string;
  cell_id: string | string[];
}

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
type RawDatum = [number, number, string];

export const rootApi = createApi({
  reducerPath: "rootApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://128.2.220.67:8081/api" }),
  endpoints: (builder) => ({
    getDatasets: builder.query<datasetType[], void>({
      query: () => "/datasets",
    }),
    getDataset: builder.query<datasetType, number>({
      query: (pk: number) => `/datasets/${pk}/`,
    }),
    fetchContactMapData: builder.query<number[][], ContactMapRequest>({
      query: (payload: ContactMapRequest) => ({
        url: `/query`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchChromLen: builder.query<number[], ChromLenQueryRequest>({
      query: (payload: ChromLenQueryRequest) => ({
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
  }),
});

export const {
  useGetDatasetsQuery,
  useGetDatasetQuery,
  useFetchContactMapDataQuery,
  useFetchChromLenQuery,
  useFetchEmbedQuery,
} = rootApi;
