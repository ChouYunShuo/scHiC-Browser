import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HeatMapStateType } from "./heatmap2DSlice";
import { layoutStateType } from "./layoutSlice";
export const apiEndpoint = "128.2.220.67:8020";
//export const apiEndpoint = "128.2.220.67:8000";
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
  cell_type: string;
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
  embed_type: string;
};

type MetaQueryRequest = {
  dataset_name: string;
  meta_type: string;
};

type GeneExprQueryRequest = {
  dataset_name: string;
  name: string;
};

type SpatialQueryRequest = {
  dataset_name: string;
};

interface Session {
  heatMapState: HeatMapStateType;
  layout: layoutStateType;
}
interface UploadSessionRequest {
  config: Session;
  file_name: string;
}
interface UploadSessionResponse {
  session_uuid: string;
}
type RawDatum = [number, number];

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
    fetchSpatial: builder.query<RawDatum[], SpatialQueryRequest>({
      query: (payload) => ({
        url: `/spatial`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchMeta: builder.query<string[], MetaQueryRequest>({
      query: (payload) => ({
        url: `/meta`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchGeneExpr: builder.query<number[], GeneExprQueryRequest>({
      query: (payload) => ({
        url: `/gene_expr`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: string, meta, arg) => {
        return JSON.parse(response);
      },
    }),
    fetchSession: builder.query<Session, string>({
      query: (uuid) => ({
        url: `/session/${uuid}`,
        method: "GET",
      }),
      transformResponse: (response: Session): Session => {
        // Check if the response is already an object, otherwise parse it
        const parsedResponse =
          typeof response === "string" ? JSON.parse(response) : response;
        console.log(parsedResponse);

        // Return the parsed response in the required format
        return {
          heatMapState: parsedResponse.heatMapState,
          layout: parsedResponse.layoutState,
        };
      },
    }),
    uploadSession: builder.mutation<
      UploadSessionResponse,
      UploadSessionRequest
    >({
      query: (payload) => ({
        url: "/session_upload",
        method: "POST",
        body: payload,
      }),
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
  useFetchMetaQuery,
  useFetchGeneExprQuery,
  useFetchSessionQuery,
  useUploadSessionMutation,
} = rootApi;
