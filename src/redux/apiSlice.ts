import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


type datasetType = {
    name: string, 
    description: string, 
    resolutions: number[],
    cells:number,
}

export const rootApi = createApi({
    reducerPath: "rootApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://127.0.0.1:8000/api" }),
    endpoints: builder => ({
        getDatasets: builder.query<datasetType[], void>({
            query: () => "/datasets",
        }),
        getDataset: builder.query<datasetType, number>({
            query: (pk) => `/datasets/${pk}/`,
        }),
    })
})

export const { useGetDatasetsQuery, useGetDatasetQuery} = rootApi
