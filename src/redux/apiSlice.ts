import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


type datasetType = {
    name: string, 
    description: string, 
    resolutions: string,
    cells:number,
}

export const rootApi = createApi({
  reducerPath: "rootApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://128.2.220.67:8081/api" }),
  endpoints: (builder: any) => ({
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

export const { useGetDatasetsQuery, useGetDatasetQuery} = rootApi
