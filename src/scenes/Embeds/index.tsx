import { useState, useEffect, useRef } from "react";
import { fetchEmbedding } from "../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import * as d3 from "d3";
import { zoom, ZoomTransform, select } from "d3";
import { ColorModeContext, tokens } from "../../theme";
import { Grid, useTheme } from "@mui/material";
import HeatMap from "../../components/ContactMap2D";
import { updateMapSelectCells } from "../../redux/heatmap2DSlice";
interface Datum {
  pc1: number;
  pc2: number;
  cellType: string;
  cellId: string;
}
type RawDatum = [number, number, string];

const Embeds: React.FC = () => {
  const [formattedData, setFormattedData] = useState<Datum[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ref = useRef<SVGSVGElement | null>(null);
  const height = 450;
  const width = 450;

  useEffect(() => {
    const getData = async () => {
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
        }))
      );
    };

    getData();
  }, [theme]);

  useEffect(() => {
    if (ref.current && formattedData.length != 0) {
      const svg = d3.select(ref.current);

      svg.selectAll("*").remove();
      svg.style("background-color", colors.primary[400]);
      let rect: d3.Selection<SVGRectElement, unknown, null, undefined> | null =
        null;
      let startX: number | null = null;
      let startY: number | null = null;

      // Create a 'g' element inside the SVG
      const g = svg.append("g");
      const xExtent = d3.extent(formattedData, (d) => d.pc1) as [
        number,
        number
      ];
      const yExtent = d3.extent(formattedData, (d) => d.pc2) as [
        number,
        number
      ];
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

      svg.on("mousedown", function (event) {
        // Reset the highlight for all circles
        if (rect) return;
        g.selectAll("circle")
          .attr("r", 1.5)
          //@ts-ignore
          .style("fill", (d: Datum) => d3.rgb(color(d.cellType)).darker(0.5));

        const [x, y] = d3.pointer(event);

        // Store the initial mouse position
        startX = x;
        startY = y;

        rect = svg
          .append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", 0)
          .attr("height", 0)
          .attr("fill", "#8c8c8c")
          .attr("opacity", 0.5)
          .attr("stroke", "#eeeeee")
          .attr("stroke-width", 2);

        event.preventDefault();
      });
      svg.on("mousemove", function (event) {
        // If no rectangle is being drawn, do nothing
        if (!rect || startX === null || startY === null) return;

        // Get the mouse position
        const [x, y] = d3.pointer(event);

        // Update the size and position of the rectangle
        rect
          .attr("x", Math.min(x, startX))
          .attr("y", Math.min(y, startY))
          .attr("width", Math.abs(x - startX))
          .attr("height", Math.abs(y - startY));

        // Update selected cell IDs based on the current region
        const selected = formattedData
          .filter((d) => {
            const cellX = xScale(d.pc1);
            const cellY = yScale(d.pc2);
            return (
              cellX >= Math.min(x, startX!) &&
              cellX <= Math.max(x, startX!) &&
              cellY >= Math.min(y, startY!) &&
              cellY <= Math.max(y, startY!)
            );
          })
          .map((d) => d.cellId);

        g.selectAll("circle")
          .attr("r", 1.5)
          //@ts-ignore
          .style("fill", (d: Datum) => {
            if (selected.includes(d.cellId)) {
              return d3.rgb(color(d.cellType)).brighter(1.5);
            } else {
              return d3.rgb(color(d.cellType)).darker(0.5);
            }
          });
      });

      svg.on("mouseup", function (event) {
        //console.log("mouseup");
        if (!rect) return;
        const [x, y] = d3.pointer(event);
        const selected = formattedData
          .filter((d) => {
            const cellX = xScale(d.pc1);
            const cellY = yScale(d.pc2);
            return (
              cellX >= Math.min(x, startX!) &&
              cellX <= Math.max(x, startX!) &&
              cellY >= Math.min(y, startY!) &&
              cellY <= Math.max(y, startY!)
            );
          })
          .map((d) => d.cellId);

        setSelectedCells(selected);

        rect.remove();
        rect = null;

        startX = null;
        startY = null;
      });

      g.selectAll("circle")
        .data(formattedData)
        .join("circle")
        .attr("cx", (d) => xScale(d.pc1))
        .attr("cy", (d) => yScale(d.pc2))
        .attr("r", (d) => 1.5)
        //@ts-ignore
        .style("fill", (d: Datum) => d3.rgb(color(d.cellType)).darker(0.5))
        .on("mousedown", function (event, d) {
          // Prevent the SVG's mousedown event from being triggered
          event.stopPropagation();
          // Reset the highlight for all circles
          g.selectAll("circle")
            //@ts-ignore
            .style("fill", (d: Datum) => d3.rgb(color(d.cellType)).darker(0.5));

          const selectedCellIds = formattedData
            .filter((d2) => d2.cellType === d.cellType)
            .map((d2) => d2.cellId);

          g.selectAll("circle")
            .attr("r", 1.5)
            //@ts-ignore
            .style("fill", (d: Datum) => {
              if (selectedCellIds.includes(d.cellId)) {
                return d3.rgb(color(d.cellType)).brighter(1.5);
              } else {
                return d3.rgb(color(d.cellType)).darker(0.5);
              }
            });

          setSelectedCells(selectedCellIds);
        });

      const legend = d3.select("#legend-container");
      legend.selectAll("*").remove();
      const uniqueCellTypes = Array.from(
        new Set(formattedData.map((d) => d.cellType))
      );

      const legendItems = legend
        .selectAll("div")
        .data(uniqueCellTypes)
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

      legendItems.append("div").text((d) => d);
    }
  }, [formattedData, width, height, theme]);

  return (
    <div>
      <Grid container spacing={4} direction="row" justifyContent="center">
        <Grid item xs={6}>
          <Grid container direction="row">
            <Grid item xs={8}>
              <svg ref={ref} width={width} height={height} />
            </Grid>
            <Grid item xs={3}>
              <div id="legend-container"></div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Embeds;
