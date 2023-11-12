import { useState, useEffect, useRef } from "react";
import {
  useFetchSpatialQuery,
  useFetchGeneExprQuery,
} from "../../redux/apiSlice";
import { apiCallType } from "../../redux/heatmap2DSlice";
import { useAppSelector } from "../../redux/hooks";
import * as d3 from "d3";
import { zoom, ZoomTransform } from "d3";
import { tokens } from "../../theme";
import { Box, useTheme, Grid } from "@mui/material";
import { euclideanDistance } from "../../utils/utils";
import LoadingSpinner from "../LoadingPage";
import ErrorAPI from "../ErrorComponent";
import EmbeddingControls from "./EmbeddingControls";
import EmbeddingPopUp from "./EmbeddingPopUp";

interface Datum {
  x: number;
  y: number;
  expr: number;
  cellId: string;
  selectMap: string;
}

function vwToPixels(vw: number) {
  return vw * (window.innerWidth / 100);
}
const Spatials: React.FC = () => {
  const [formattedData, setFormattedData] = useState<Datum[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const apiCalls = useAppSelector((state) => state.heatmap2D.apiCalls);
  const [isZoom, setIsZoom] = useState<boolean>(true);
  const [isColorCellSelect, setIsColorCellSelect] = useState<boolean>(false);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ref = useRef<SVGSVGElement | null>(null);
  const legendRef = useRef<SVGSVGElement | null>(null);

  const width = vwToPixels(45);
  const height = vwToPixels(45);
  const DivRef = useRef<HTMLDivElement>(null);
  let currentWidth = DivRef.current ? DivRef.current.offsetWidth : width;
  const xExtent = d3.extent(formattedData, (d) => d.x) as [number, number];
  const yExtent = d3.extent(formattedData, (d) => d.y) as [number, number];
  const lassoRef = useRef<d3.Selection<
    SVGPathElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const lassoThreshold = 50;

  const xScale = d3
    .scaleLinear()
    .domain([xExtent[0] - 1, xExtent[1] + 1])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([yExtent[0] - 1, yExtent[1] + 1])
    .range([height, 0]);

  const {
    data: rawSpatialData,
    isLoading,
    isFetching,
    error,
  } = useFetchSpatialQuery({
    dataset_name: heatmap_state.dataset_name,
  },{
    refetchOnMountOrArgChange: true
  });
  const {
    data: geneExprData,
    isLoading: isExprLoading,
    isFetching: isExprFetching,
    error: exprError,
  } = useFetchGeneExprQuery({
    dataset_name: heatmap_state.dataset_name,
    index: "0",
  });
  const CellSelectColor: d3.ScaleOrdinal<string, string> = d3
    .scaleOrdinal<string>()
    .domain(
      Array.from({ length: heatmap_state.map_cnts }, (_, i) => String(i + 1))
    )
    .range(d3.schemeCategory10);

  const minRange = d3.min(formattedData, (d) =>
    typeof d.expr === "number" ? d.expr : Infinity
  );
  const maxRange = d3.max(formattedData, (d) =>
    typeof d.expr === "number" ? d.expr : -Infinity
  );

  const colorScale =
    theme.palette.mode === "dark"
      ? d3
          .scaleSequential(d3.interpolateViridis)
          //@ts-ignore
          .domain([minRange, maxRange]) // adjust domain for log scale
      : //@ts-ignore
        d3.scaleSequential(d3.interpolateReds).domain([minRange, maxRange]); // adjust domain for log scale

  console.log(isFetching, isExprFetching,rawSpatialData)
  useEffect(() => {
    if (!isLoading && rawSpatialData && !isExprLoading && geneExprData) {
      const formattedData = rawSpatialData.map(([x, y], index) => {
        const expr = geneExprData?.[index] ?? "N/A";
        return {
          x: typeof x === "string" ? parseFloat(x) : x,
          y: typeof y === "string" ? parseFloat(y) : y,
          expr: typeof expr === "string" ? parseFloat(expr) : expr,
          cellId: index.toString(),
          selectMap: "0",
        };
      });

      setFormattedData(formattedData);
    }
  }, [isFetching, isExprFetching, rawSpatialData, geneExprData]);

  useEffect(() => {
   if (ref.current && formattedData.length > 0) {
      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();
      const g = svg.append("g");
      svg.style("background-color", colors.primary[400]);
      drawSvg(g);
      return () => {
        g.remove(); // Remove the <g> element when the component unmounts
      };
    }
  }, [formattedData]);

  useEffect(() => {
    if (ref.current && formattedData.length != 0) {
      const svg = d3.select(ref.current);
      let g = svg.select("g");
      svg.style("background-color", colors.primary[400]);
      //@ts-ignore
      drawSvg(g, true);
    }
  }, [isColorCellSelect, theme]);

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

      // Return the corresponding map id, or "0" if the cell is not selected
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
    if (ref.current && formattedData.length != 0) {
      const svg = d3.select(ref.current);
      drawSvg(svg.select("g"));
    }
  };
  const handleVisToggle = () => {
    setIsPopup((prev) => !prev);
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
  const drawSvg = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    updateColorOnly: boolean = false
  ) => {
    if (ref.current && formattedData.length != 0) {
      if (!updateColorOnly) {
        g.selectAll("circle")
          .data(formattedData)
          .join("circle")
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("r", (d) => 3);
      }
      g.selectAll("circle")
        .data(formattedData)
        //@ts-ignore
        .style("fill", function (d: Datum) {
          if (isColorCellSelect) {
            // Assume colorMap is an array or function that can return color based on d.cellType.
            return d.selectMap === "0"
              ? "black"
              : d3.rgb(CellSelectColor(d.selectMap));
          } else {
            return colorScale(d.expr);
          }
        });
      generateLegend();
    }
  };
  const generateLegend = () => {
    if (isColorCellSelect) {
      d3.select(legendRef.current).selectAll("*").remove();
      let legend = d3.select("#legend2-container");
      legend.selectAll("*").remove();
      let colorData;
      colorData = Array.from({ length: heatmap_state.map_cnts }, (_, i) =>
        String(i + 1)
      );

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
          return CellSelectColor(d);
        })
        .style("margin-right", "5px");
      legendItems.append("div").text((d) => "Map " + d);
    } else {
      d3.select("#legend2-container").selectAll("*").remove();
      let legend = d3.select(legendRef.current);
      //legend.selectAll("*").remove();

      const legendHeight = 200; // define your legend height
      const gradientId = "legendGradient";
      legend.attr("height", legendHeight).attr("width", 30);

      // Append a defs (for definition) element to your SVG
      const defs = legend.append("defs");

      // Append a linearGradient element to the defs and give it a unique id
      const linearGradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("gradientUnits", "userSpaceOnUse") // add this line
        .attr("x1", "0")
        .attr("y1", String(legendHeight))
        .attr("x2", "0")
        .attr("y2", "0");

      // Set the color for the start (0%)
      linearGradient
        .append("stop")
        .attr("offset", "0%")
        //@ts-ignore
        .attr("stop-color", colorScale.range()[0]);

      // Set the color for the end (100%)
      linearGradient
        .append("stop")
        .attr("offset", "100%")
        //@ts-ignore
        .attr("stop-color", colorScale.range()[1]);

      // Draw the rectangle and fill it with the gradient
      legend
        .append("rect")
        .attr("width", 15) // this could be adjusted
        .attr("height", legendHeight)
        .style("fill", "url(#" + gradientId + ")");

      // Create scale that we will use as our axis
      const yScale = d3
        .scaleLinear()
        .range([legendHeight, 0])
        .domain(colorScale.domain());

      // Add the y Axis
      legend.append("g").attr("class", "axis").call(d3.axisRight(yScale)); // Create an axis component with d3.axisRight
    }
  };

  useEffect(() => {
    if (ref.current && formattedData.length != 0) {
      const svg = d3.select(ref.current);
      const g = svg.select("g");

      let currentTransform = d3.zoomTransform(svg.node()!);
      let lassoPath: [number, number][] = [];
      // Create a zoom behavior
      const zoomBehavior = zoom()
        .scaleExtent([0.4, 5]) // This defines the range of zoom (0.5x to 5x here)
        .translateExtent([
          [-3 * width, -1.5 * height],
          [3 * width, 2 * height],
        ]) // This defines the range of panning
        .on("zoom", (event: { transform: ZoomTransform }) => {
          g.attr("transform", event.transform.toString());
        });

      if (isZoom) {
        //@ts-ignore
        svg.call(zoomBehavior);
      }

      svg.on("mousedown", function (event) {
        // Reset the highlight for all circles

        if (isZoom) return;

        if (lassoRef.current) {
          lassoRef.current.remove();
          lassoRef.current = null;
        }

        g.selectAll("circle")
          .attr("r", 3)
          //@ts-ignore
          .style("fill", function (d: Datum) {
            if (isColorCellSelect) {
              // Assume colorMap is an array or function that can return color based on d.cellType.
              return d.selectMap === "0"
                ? "black"
                : d3.rgb(CellSelectColor(d.selectMap));
            } else {
              return colorScale(d.expr);
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
          lassoRef.current.attr("fill", colors.blueAccent[600]); // change the lasso color to green
          lassoRef.current.attr("stroke", colors.blueAccent[400]);
          lassoRef.current.attr("d", "M" + lassoPath.join("L"));
        }
      });
      svg.on("mouseup", function (event) {
        if (isZoom || !lassoRef.current || lassoPath.length == 0) return;
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
            const cellX = xScale(d.x);
            const cellY = yScale(d.y);
            let [tranX, tranY] = currentTransform.apply([cellX, cellY]);
            return d3.polygonContains(lassoPath, [tranX, tranY]);
          })
          .map((d) => d.cellId);

        g.selectAll("circle")
          .attr("r", 3)
          //@ts-ignore
          .style("fill", (d: Datum) => {
            if (selected.includes(d.cellId)) {
              if (isColorCellSelect) {
                // Assume colorMap is an array or function that can return color based on d.cellType.
                return d.selectMap === "0"
                  ? "black"
                  : d3.rgb(CellSelectColor(d.selectMap));
              } else {
                return colorScale(d.expr);
              }
            } else {
              if (isColorCellSelect) {
                // Assume colorMap is an array or function that can return color based on d.cellType.
                return d.selectMap === "0"
                  ? "black"
                  : d3.rgb(CellSelectColor(d.selectMap));
              } else {
                return colorScale(d.expr);
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
          ref={ref}
          width="100%"
          height="100%"
          style={{ border: "1px solid rgba(0, 0, 0, 0.2)" }}
        />

        {isColorCellSelect && (
          <Box
            position="absolute"
            top={0}
            right={0}
            paddingTop={1}
            width="10%"
            id="legend2-container"
          ></Box>
        )}
        {!isColorCellSelect && (
          <Box
            position="absolute"
            top={0}
            right={0}
            paddingTop={1}
            zIndex={50}
            width="10%"
          >
            <svg width="100%" height="100%" ref={legendRef} />
          </Box>
        )}
      </Grid>
      {isFetching || isLoading || isExprFetching || isExprLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAPI />
      ) : null}
    </Box>
  );
};

export default Spatials;