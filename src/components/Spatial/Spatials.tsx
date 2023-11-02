import { useState, useEffect, useRef } from "react";
import {
  useFetchSpatialQuery,
  useFetchGeneExprQuery,
} from "../../redux/apiSlice";
import { useAppSelector } from "../../redux/hooks";
import * as d3 from "d3";
import { zoom, ZoomTransform } from "d3";
import { tokens } from "../../theme";
import { Box, useTheme, Grid } from "@mui/material";

import LoadingSpinner from "../LoadingPage";
import ErrorAPI from "../ErrorComponent";
import SpatialTopBar from "./SpatialTopBar";

interface Datum {
  x: number;
  y: number;
  expr: number;
}

function vwToPixels(vw: number) {
  return vw * (window.innerWidth / 100);
}
const Spatials: React.FC = () => {
  const [formattedData, setFormattedData] = useState<Datum[]>([]);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ref = useRef<SVGSVGElement | null>(null);
  const legendRef = useRef<SVGSVGElement | null>(null);

  const width = vwToPixels(45);
  const height = vwToPixels(45);
  const DivRef = useRef<HTMLDivElement>(null);
  const xExtent = d3.extent(formattedData, (d) => d.x) as [number, number];
  const yExtent = d3.extent(formattedData, (d) => d.y) as [number, number];
  const [isColorCellSelect, setIsColorCellSelect] = useState<boolean>(false);

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

  useEffect(() => {
    if (!isLoading && rawSpatialData && !isExprLoading && geneExprData) {
      const formattedData = rawSpatialData.map(([x, y], index) => {
        const expr = geneExprData?.[index] ?? "N/A";
        return {
          x: typeof x === "string" ? parseFloat(x) : x,
          y: typeof y === "string" ? parseFloat(y) : y,
          expr: typeof expr === "string" ? parseFloat(expr) : expr,
        };
      });

      setFormattedData(formattedData);
    }
  }, [isLoading, rawSpatialData, geneExprData]);

  const handleColorToggle = () => {
    setIsColorCellSelect((prev) => !prev);
  };
  const drawSvg = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    updateColorOnly: boolean = false
  ) => {
    if (ref.current && formattedData.length != 0) {
      g.selectAll("circle")
        .data(formattedData)
        .join("circle")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", (d) => 3)
        .style("fill", function (d: Datum) {
          return colorScale(d.expr);
        });

      generateLegend();
    }
  };
  const generateLegend = () => {
    const legend = d3.select(legendRef.current);
    legend.selectAll("*").remove();

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

    // // // Add the y Axis
    legend
      .append("g")
      .attr("class", "axis") //Assign "axis" class
      .call(d3.axisRight(yScale)); // Create an axis component with d3.axisRight
  };

  const hasData = formattedData.length > 0;
  useEffect(() => {
    //console.log("In embed get data drawSvg");
    if (ref.current && formattedData.length != 0) {
      const svg = d3.select(ref.current);

      svg.selectAll("*").remove();
      svg.style("background-color", colors.primary[400]);
      // Create a 'g' element inside the SVG
      const g = svg.append("g");

      drawSvg(g);

      // Cleanup function
      return () => {
        g.remove(); // Remove the <g> element when the component unmounts
      };
    }
  }, [hasData]);
  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);
      const g = svg.select("g");
      svg.style("background-color", colors.primary[400]);
      //@ts-ignore
      drawSvg(g);
    }
  }, [theme]);
  useEffect(() => {
    if (ref.current && formattedData.length != 0) {
      const svg = d3.select(ref.current);
      const g = svg.select("g");

      // Create a zoom behavior
      const zoomBehavior = zoom()
        .scaleExtent([0.5, 5]) // This defines the range of zoom (0.5x to 5x here)
        .translateExtent([
          [-width, -height],
          [2 * width, 2 * height],
        ]) // This defines the range of panning
        .on("zoom", (event: { transform: ZoomTransform }) => {
          g.attr("transform", event.transform.toString());
        });

      //@ts-ignore
      svg.call(zoomBehavior);

      return () => {
        svg.on(".zoom", null);
      };
    }
  }, [formattedData]);

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
        <SpatialTopBar
          isCellSelect={isColorCellSelect}
          handleColorToggle={handleColorToggle}
        />
        <svg
          ref={ref}
          width="100%"
          height="100%"
          style={{ border: "1px solid rgba(0, 0, 0, 0.2)" }}
        />

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
