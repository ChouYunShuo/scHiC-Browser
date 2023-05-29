import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


type datasetType = {
    name: string, 
    description: string, 
    resolutions: string,
    cells:number,
}

export const rootApi = createApi({
    reducerPath: "rootApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://128.2.220.67:8020/api" }),
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
