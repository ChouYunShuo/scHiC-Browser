import { useState, useEffect } from "react";
import {
  useFetchEmbedQuery,
  useFetchMetaQuery,
  useFetchSpatialQuery,
  useFetchGeneExprQuery,
} from "../redux/apiSlice";
import { useAppSelector } from "../redux/hooks";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import zIndex from "@mui/material/styles/zIndex";

interface EmbedDatum {
  x: number;
  y: number;
  cellType: string;
  cellId: string;
  selectMap: string;
}
interface SpatialDatum {
  x: number;
  y: number;
  expr: number;
  cellId: string;
  selectMap: string;
}
type Datum = EmbedDatum | SpatialDatum;

export const useScatterPlotData = (idx: number) => {
  const [formattedData, setFormattedData] = useState<Datum[]>([]);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const component = useAppSelector((state) => state.layout.component[idx]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<
    FetchBaseQueryError | SerializedError | null
  >(null);

  useEffect(() => {
    if (
      component.type === "embed" &&
      component.embed_type &&
      component.meta_type
    ) {
      const {
        data: rawEmbedData,
        isLoading: embedLoading,
        error: embedError,
      } = useFetchEmbedQuery({
        dataset_name: heatmap_state.dataset_name,
        embed_type: component.embed_type,
      });
      const { data: cell_label, isLoading: labelLoading } = useFetchMetaQuery({
        dataset_name: heatmap_state.dataset_name,
        meta_type: component.meta_type,
      });

      if (!embedLoading && rawEmbedData && !labelLoading && cell_label) {
        const formattedEmbedData = rawEmbedData.map(([x, y], index) => {
          const label = cell_label?.[index] ?? "N/A";
          return {
            x: typeof x === "string" ? parseFloat(x) : x,
            y: typeof y === "string" ? parseFloat(y) : y,
            cellType: label,
            cellId: index.toString(),
            selectMap: "0",
          };
        });
        setFormattedData(formattedEmbedData);
      }

      setIsLoading(embedLoading || labelLoading);
      setError(embedError ?? null);
    } else if (component.type === "spatial" && component.gene_name) {
      const {
        data: rawSpatialData,
        isLoading: spatialLoading,
        error: spatialError,
      } = useFetchSpatialQuery({
        dataset_name: heatmap_state.dataset_name,
      });

      const { data: geneExprData, isLoading: exprLoading } =
        useFetchGeneExprQuery({
          dataset_name: heatmap_state.dataset_name,
          index: component.gene_name,
        });

      if (!spatialLoading && rawSpatialData && !exprLoading && geneExprData) {
        const formattedSpatialData = rawSpatialData.map(([x, y], index) => {
          const expr = geneExprData?.[index] ?? "N/A";
          return {
            x: typeof x === "string" ? parseFloat(x) : x,
            y: typeof y === "string" ? parseFloat(y) : y,
            expr: typeof expr === "string" ? parseFloat(expr) : expr,
          };
        });
        setFormattedData(formattedSpatialData);
      }

      setIsLoading(spatialLoading || exprLoading);
      setError(spatialError ?? null);
    }
  }, [component, idx]);

  return { formattedData, isLoading, error };
};
