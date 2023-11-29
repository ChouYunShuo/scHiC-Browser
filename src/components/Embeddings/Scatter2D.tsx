import { useState, useEffect, useRef, useCallback } from "react";
import { useFetchEmbedQuery, useFetchMetaQuery } from "../../redux/apiSlice";
import { apiCallType } from "../../redux/heatmap2DSlice";
import { useAppSelector } from "../../redux/hooks";
import * as d3 from "d3";
import { zoom, ZoomTransform } from "d3";
import { tokens } from "../../theme";
import { Box, useTheme, Grid } from "@mui/material";
import EmbeddingControls from "./EmbeddingControls";
import EmbeddingPopUp from "./EmbeddingPopUp";
import { euclideanDistance } from "../../utils/utils";
import LoadingSpinner from "../LoadingPage";
import ErrorAPI from "../ErrorComponent";

interface Datum {
  pc1: number;
  pc2: number;
  cellType: string;
  cellId: string;
  selectMap: string;
}

function vwToPixels(vw: number) {
  return vw * (window.innerWidth / 100);
}
const Scatter2D: React.FC = () => {
  // State declarations
  const [formattedData, setFormattedData] = useState<Datum[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isZoom, setIsZoom] = useState<boolean>(true);
  const [isColorCellSelect, setIsColorCellSelect] = useState<boolean>(false);
  const [isPopup, setIsPopup] = useState<boolean>(false);

  // Redux selectors and theme context
  const apiCalls = useAppSelector((state) => state.heatmap2D.apiCalls);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Refs for SVG and D3 components
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<ZoomTransform>(d3.zoomIdentity);
  const DivRef = useRef<HTMLDivElement>(null);
  const lassoRef = useRef<d3.Selection<
    SVGPathElement,
    unknown,
    null,
    undefined
  > | null>(null);

  // Constants and scales for the plot
  const lassoThreshold = 50;
  const width = vwToPixels(45);
  const height = vwToPixels(45);
  let currentWidth = DivRef.current ? DivRef.current.offsetWidth : width;

  // Function to update the scales based on data
  const updateScales = useCallback(() => {
    const xExtent = d3.extent(formattedData, (d) => d.pc1) as [number, number];
    const yExtent = d3.extent(formattedData, (d) => d.pc2) as [number, number];
    return {
      xScale: d3
        .scaleLinear()
        .domain([xExtent[0] - 1, xExtent[1] + 1])
        .range([0, width]),
      yScale: d3
        .scaleLinear()
        .domain([yExtent[0] - 1, yExtent[1] + 1])
        .range([height, 0]),
    };
  }, [formattedData, width, height]);

  const CellTypeColor: d3.ScaleOrdinal<string, string> = d3
    .scaleOrdinal<string>()
    .domain(Array.from(new Set(formattedData.map((d) => d.cellType))))
    .range(d3.schemeCategory10);

  const CellSelectColor: d3.ScaleOrdinal<string, string> = d3
    .scaleOrdinal<string>()
    .domain(
      Array.from({ length: heatmap_state.map_cnts }, (_, i) => String(i + 1))
    )
    .range(d3.schemeCategory10);

  const {
    data: rawEmbedData,
    isLoading,
    isFetching,
    error,
  } = useFetchEmbedQuery(
    {
      dataset_name: heatmap_state.dataset_name,
      embed_type: "umap",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const {
    data: cell_label,
    isLoading: isLabelLoading,
    isFetching: isLabelFetching,
    error: labelError,
  } = useFetchMetaQuery({
    dataset_name: heatmap_state.dataset_name,
    meta_type: "label",
  });

  useEffect(() => {
    // Only proceed if all required data is available and not loading
    if (!isLoading && rawEmbedData && !isLabelLoading && cell_label) {
      const newFormattedData = rawEmbedData.map(([pc1, pc2], index) => {
        const label = cell_label?.[index] ?? "N/A";
        return {
          pc1: typeof pc1 === "string" ? parseFloat(pc1) : pc1,
          pc2: typeof pc2 === "string" ? parseFloat(pc2) : pc2,
          cellType: label,
          cellId: index.toString(),
          selectMap: "0",
        };
      });

      setFormattedData(newFormattedData);
    }
  }, [rawEmbedData, cell_label, isFetching, isLabelFetching]); // Re-run when any of these dependencies change

  useEffect(() => {
    // A function to check if the cell is selected and return the corresponding map id
    const getSelectMapForCell = (
      cellId: string,
      apiCalls: apiCallType[]
    ): string => {
      // Find the apiCall that contains the cellId in its selectedCells array
      const apiCallWithCell = apiCalls.find((apiCall) =>
        apiCall.selectedCells.includes(cellId)
      );
      return apiCallWithCell ? (apiCallWithCell.id + 1).toString() : "0";
    };

    // Map over the formattedData to update the selectMap field
    const updatedData = formattedData.map((datum) => ({
      ...datum,
      selectMap: getSelectMapForCell(datum.cellId, apiCalls),
    }));
    setFormattedData(updatedData);
  }, [apiCalls]);

  const handleContactMapToggle = (selected_map: number) => {
    formattedData.forEach((cell) => {
      if (cell.selectMap === String(selected_map)) {
        cell.selectMap = "0";
      }
      if (selectedCells.includes(cell.cellId)) {
        cell.selectMap = String(selected_map);
      }
    });
  };

  const handleZoomToggle = () => {
    setIsZoom((prevIsZoom) => !prevIsZoom);
    if (lassoRef.current) {
      lassoRef.current.remove();
      lassoRef.current = null;
    }
  };
  const handleColorToggle = () => {
    setIsColorCellSelect((prev) => !prev);
  };
  const handleVisToggle = () => {
    setIsPopup((prev) => !prev);
  };

  const drawSvg = () => {
    if (!svgRef.current || formattedData.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous SVG elements
    const g = svg.select("g").empty() ? svg.append("g") : svg.select("g");
    const { xScale, yScale } = updateScales();

    // Draw or update circles
    //@ts-ignore
    g.selectAll("circle")
      //@ts-ignore
      .data(formattedData)
      .join("circle")
      //@ts-ignore
      .attr("cx", (d: Datum) => xScale(d.pc1))
      .attr("cy", (d: Datum) => yScale(d.pc2))
      .attr("r", 2)
      .style("fill", (d: Datum) =>
        isColorCellSelect
          ? d.selectMap === "0"
            ? "black"
            : CellSelectColor(d.selectMap)
          : CellTypeColor(d.cellType)
      );

    // Apply the stored zoom transform
    g.attr("transform", zoomRef.current.toString());

    // Define the zoom behavior
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 5])
      .translateExtent([
        [-3 * width, -1.5 * height],
        [3 * width, 2 * height],
      ])
      .on("zoom", (event) => {
        zoomRef.current = event.transform;
        g.attr("transform", event.transform.toString());
      });

    // Apply the zoom behavior to the SVG if zoom is enabled
    if (isZoom) {
      svg.call(zoomBehavior);
    } else {
      svg.on(".zoom", null); // Remove the zoom behavior
    }
    generateLegend();
  };
  const generateLegend = () => {
    const legend = d3.select("#legend-container");
    legend.selectAll("*").remove();
    let colorData;
    if (isColorCellSelect) {
      colorData = Array.from({ length: heatmap_state.map_cnts }, (_, i) =>
        String(i + 1)
      );
    } else {
      colorData = Array.from(new Set(formattedData.map((d) => d.cellType)));
    }

    const legendItems = legend
      .selectAll("div")
      .data(colorData)
      .join("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "5px");

    legendItems
      .append("div")
      .style("width", "15px")
      .style("height", "15px")
      //@ts-ignore
      .style("background-color", function (d) {
        if (isColorCellSelect) {
          return CellSelectColor(d);
        }
        return CellTypeColor(d);
      })
      .style("margin-right", "5px");
    if (isColorCellSelect) {
      legendItems.append("div").text((d) => "Map " + d);
    } else {
      legendItems.append("div").text((d) => d);
    }
  };
  useEffect(() => {
    // Redraw the SVG whenever necessary data changes
    drawSvg();
  }, [drawSvg, formattedData, isColorCellSelect, theme.palette.mode]);

  useEffect(() => {
    if (svgRef.current && formattedData.length != 0) {
      const svg = d3.select(svgRef.current);
      const g = svg.select("g");

      let currentTransform = d3.zoomTransform(svg.node()!);
      let lassoPath: [number, number][] = [];

      svg.on("mousedown", function (event) {
        // Reset the highlight for all circles
        if (isZoom) return;
        if (lassoRef.current) {
          lassoRef.current.remove();
          lassoRef.current = null;
        }

        g.selectAll("circle")
          .attr("r", 2)
          //@ts-ignore
          .style("fill", function (d: Datum) {
            if (isColorCellSelect) {
              // Assume colorMap is an array or function that can return color based on d.cellType.
              return d.selectMap === "0"
                ? "black"
                : d3.rgb(CellSelectColor(d.selectMap));
            } else {
              return d3.rgb(CellTypeColor(d.cellType));
            }
          });

        lassoPath = [d3.pointer(event)]; // Store the initial mouse position
        // create the lasso path
        lassoRef.current = svg
          .append("path")
          .attr("fill", colors.blueAccent[400])
          .attr("opacity", 0.5)
          .attr("stroke", colors.blueAccent[400])
          .style("stroke-dasharray", "3, 3")
          .attr("stroke-width", 1);

        event.preventDefault();
      });

      svg.on("mousemove", function (event) {
        // If no rectangle is being drawn, do nothing
        if (isZoom || !lassoRef.current || lassoPath.length === 0) return;

        // Get the mouse position
        const [x, y] = d3.pointer(event);
        lassoPath.push([x, y]);

        const dist = euclideanDistance(lassoPath[0], [x, y]);
        if (dist < lassoThreshold) {
          //lassoPath.push(lassoPath[0]); // close the lasso path
          lassoRef.current.attr("stroke", colors.greenAccent[200]);
          lassoRef.current.attr("fill", colors.greenAccent[400]); // change the lasso color to green
          lassoRef.current.attr("d", "M" + lassoPath.join("L") + "Z");
        } else {
          lassoRef.current.attr("fill", colors.blueAccent[600]); // change the lasso color to blue
          lassoRef.current.attr("stroke", colors.blueAccent[400]);
          lassoRef.current.attr("d", "M" + lassoPath.join("L"));
        }
      });
      svg.on("mouseup", function (event) {
        if (isZoom || !lassoRef.current || lassoPath.length == 0) return;
        const { xScale, yScale } = updateScales();
        const dist = euclideanDistance(
          lassoPath[0],
          lassoPath[lassoPath.length - 1]
        );
        if (dist > lassoThreshold) {
          lassoRef.current.remove();
          lassoRef.current = null;
          lassoPath = [];
          setSelectedCells([]);
          return;
        }

        const selected = formattedData
          .filter((d) => {
            const cellX = xScale(d.pc1);
            const cellY = yScale(d.pc2);
            let [tranX, tranY] = currentTransform.apply([cellX, cellY]);
            return d3.polygonContains(lassoPath, [tranX, tranY]);
          })
          .map((d) => d.cellId);

        g.selectAll("circle")
          .attr("r", 2)
          //@ts-ignore
          .style("fill", (d: Datum) => {
            if (selected.includes(d.cellId)) {
              if (isColorCellSelect) {
                // Assume colorMap is an array or function that can return color based on d.cellType.
                return d.selectMap === "0"
                  ? "black"
                  : d3.rgb(CellSelectColor(d.selectMap));
              } else {
                return d3.rgb(CellTypeColor(d.cellType)).brighter(1.5);
              }
            } else {
              if (isColorCellSelect) {
                // Assume colorMap is an array or function that can return color based on d.cellType.
                return d.selectMap === "0"
                  ? "black"
                  : d3.rgb(CellSelectColor(d.selectMap));
              } else {
                return d3.rgb(CellTypeColor(d.cellType)).darker(0.5);
              }
            }
          });
        setSelectedCells(selected);

        if (selected.length > 0) {
          setIsPopup(true);
        }
        lassoPath = [];
      });
      return () => {
        svg.on(".zoom", null);
      };
    }
  }, [formattedData, isZoom, isColorCellSelect, theme]);

  return (
    <Box width="100%" height="100%">
      <Grid
        container
        position="relative"
        width="100%"
        height="100%"
        ref={DivRef}
        style={{
          overflow: "hidden",
          display: error ? "none" : "block", // Hide canvas when loadingdisplay= error ? "none" : "block", // Hide canvas when loading
        }}
      >
        <EmbeddingControls
          isZoom={isZoom}
          isCellSelect={isColorCellSelect}
          handleZoomToggle={handleZoomToggle}
          handleColorToggle={handleColorToggle}
        />
        <EmbeddingPopUp
          isVisible={isPopup}
          handleVisToggle={handleVisToggle}
          handleMapToggle={handleContactMapToggle}
          selectedUmapCells={selectedCells}
          pWidth={currentWidth}
        ></EmbeddingPopUp>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ border: "1px solid", borderColor: colors.border[100] }}
        />

        <Box
          position="absolute"
          top={0}
          right={0}
          paddingTop={1}
          width="10%"
          id="legend-container"
        ></Box>
      </Grid>
      {isFetching || isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAPI />
      ) : null}
    </Box>
  );
};

export default Scatter2D;
