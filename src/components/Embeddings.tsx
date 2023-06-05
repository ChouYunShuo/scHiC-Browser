import { useState, useEffect, useRef } from "react";
import { fetchEmbedding } from "../utils";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import * as d3 from "d3";
import { zoom, ZoomTransform } from "d3";
import { tokens } from "../theme";
import { Box, useTheme, Grid } from "@mui/material";
import EmbedTopBar from "./EmbeddingTopBar";
import UmapPopUp from "./UmapPopUp";
import { euclideanDistance } from "../utils";

interface Datum {
  pc1: number;
  pc2: number;
  cellType: string;
  cellId: string;
  selectMap: string;
}
type RawDatum = [number, number, string];

function vwToPixels(vw: number) {
  return vw * (window.innerWidth / 100);
}
const Embeds: React.FC = () => {
  const [formattedData, setFormattedData] = useState<Datum[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isZoom, setIsZoom] = useState<boolean>(true);
  const [isColorCellSelect, setIsColorCellSelect] = useState<boolean>(false);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ref = useRef<SVGSVGElement | null>(null);
  const lassoRef = useRef<d3.Selection<
    SVGPathElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const lassoThreshold = 50;

  const height = vwToPixels(38);
  const width = vwToPixels(38);
  const xExtent = d3.extent(formattedData, (d) => d.pc1) as [number, number];
  const yExtent = d3.extent(formattedData, (d) => d.pc2) as [number, number];
  const xScale = d3
    .scaleLinear()
    .domain([xExtent[0] - 1, xExtent[1] + 1])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([yExtent[0] - 1, yExtent[1] + 1])
    .range([height, 0]);

  const color: d3.ScaleOrdinal<string, string> = d3
    .scaleOrdinal<string>()
    .domain(Array.from(new Set(formattedData.map((d) => d.cellType))))
    .range(d3.schemeCategory10);

  useEffect(() => {
    const getData = async () => {
      console.log("Get Data!");
      const data: RawDatum[] = await fetchEmbedding({
        dataset_name: heatmap_state.dataset_name,
        resolution: heatmap_state.all_resolution[0].toString(),
        embed_type: "umap",
      });
      setFormattedData(
        data.map(([pc1, pc2, cellType], index) => ({
          pc1: typeof pc1 === "string" ? parseFloat(pc1) : pc1,
          pc2: typeof pc2 === "string" ? parseFloat(pc2) : pc2,
          cellType,
          cellId: index.toString(),
          selectMap: "0",
        }))
      );
    };
    if (heatmap_state.all_resolution.length) getData();
  }, [heatmap_state.all_resolution]);

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

  const drawSvg = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    if (ref.current && formattedData.length != 0) {
      g.selectAll("circle")
        .data(formattedData)
        .join("circle")
        .attr("cx", (d) => xScale(d.pc1))
        .attr("cy", (d) => yScale(d.pc2))
        .attr("r", (d) => 1.5)
        //@ts-ignore
        .style("fill", function (d: Datum) {
          if (isColorCellSelect) {
            // Assume colorMap is an array or function that can return color based on d.cellType.
            return d.selectMap === "0"
              ? "black"
              : d3.rgb(color(d.selectMap)).darker(0.5);
          } else {
            return d3.rgb(color(d.cellType)).darker(0.5);
          }
        });

      generateLegend();
    }
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
      .style("background-color", (d) => color(d))
      .style("margin-right", "5px");
    if (isColorCellSelect) {
      legendItems.append("div").text((d) => "Map " + d);
    } else {
      legendItems.append("div").text((d) => d);
    }
  };

  useEffect(() => {
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
  }, [formattedData, width, height, theme, isColorCellSelect]);
  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);
      const g = svg.select("g");
      const zoomBehavior = zoom().on(
        "zoom",
        (event: { transform: ZoomTransform }) => {
          g.attr("transform", event.transform.toString());
        }
      );
      //@ts-ignore
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
    }
  }, [theme]);
  useEffect(() => {
    if (ref.current && formattedData.length != 0) {
      const svg = d3.select(ref.current);
      const g = svg.select("g");

      let currentTransform = d3.zoomTransform(svg.node()!);
      let lassoPath: [number, number][] = [];
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
          .attr("r", 1.5)
          //@ts-ignore
          .style("fill", function (d: Datum) {
            if (isColorCellSelect) {
              // Assume colorMap is an array or function that can return color based on d.cellType.
              return d.selectMap === "0"
                ? "black"
                : d3.rgb(color(d.selectMap)).darker(0.5);
            } else {
              return d3.rgb(color(d.cellType)).darker(0.5);
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
            const cellX = xScale(d.pc1);
            const cellY = yScale(d.pc2);
            let [tranX, tranY] = currentTransform.apply([cellX, cellY]);
            return d3.polygonContains(lassoPath, [tranX, tranY]);
          })
          .map((d) => d.cellId);

        g.selectAll("circle")
          .attr("r", 1.5)
          //@ts-ignore
          .style("fill", (d: Datum) => {
            if (selected.includes(d.cellId)) {
              if (isColorCellSelect) {
                // Assume colorMap is an array or function that can return color based on d.cellType.
                return d.selectMap === "0"
                  ? "black"
                  : d3.rgb(color(d.selectMap)).brighter(1.5);
              } else {
                return d3.rgb(color(d.cellType)).brighter(1.5);
              }
            } else {
              if (isColorCellSelect) {
                // Assume colorMap is an array or function that can return color based on d.cellType.
                return d.selectMap === "0"
                  ? "black"
                  : d3.rgb(color(d.selectMap)).darker(0.5);
              } else {
                return d3.rgb(color(d.cellType)).darker(0.5);
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
  }, [formattedData, theme, isZoom]);

  return (
    <Grid container position="relative">
      <EmbedTopBar
        isZoom={isZoom}
        isCellSelect={isColorCellSelect}
        handleZoomToggle={handleZoomToggle}
        handleColorToggle={handleColorToggle}
      />
      <UmapPopUp
        isVisible={isPopup}
        handleVisToggle={handleVisToggle}
        handleMapToggle={handleContactMapToggle}
        selectedUmapCells={selectedCells}
      ></UmapPopUp>
      <svg
        ref={ref}
        width={width}
        height={height}
        style={{ border: "1px solid rgba(0, 0, 0, 0.2)" }}
      />

      <Box
        position="absolute"
        right={0}
        height="50%"
        width="10%"
        id="legend-container"
      ></Box>
    </Grid>
  );
};

export default Embeds;
