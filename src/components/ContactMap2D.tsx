import { useRef, useState, useEffect } from "react";
import { Typography, Paper } from "@material-ui/core";
import * as PIXI from "pixi.js";
import * as d3 from "d3";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchMap, getResFromRange } from "../utils";
import { useGetDatasetQuery, useGetDatasetsQuery } from "../redux/apiSlice";
import { updateApiCalls } from "../redux/heatmap2DSlice";
const simpleQuery = {
  chrom1: "chrom2:1000-100000000",
  chrom2: "chrom2:1000-100000000",
  dataset_name: "scHiC5",
  resolution: "50000",
  cell_id: "0",
};
interface HeatMapProps {
  map_id: number;
}
const HeatMap: React.FC<HeatMapProps> = ({ map_id }) => {
  const [heatMapData, setHeatMapData] = useState<number[][]>([]);
  const heatMapState = useAppSelector((state) => state.heatmap2D);
  const range1 = heatMapState.chrom1;
  const range2 = heatMapState.chrom2;
  const app_size = heatMapState.app_size;
  const psize = heatMapState.pix_size;
  const apiCall = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id].call
  );

  const dispatch = useAppDispatch();

  const [color, setColor] = useState(0xff0000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [container, setContainer] = useState<PIXI.Container>(
    new PIXI.Container()
  );
  const [text, setText] = useState<string>("scaled value: ");
  const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]); //interpolateViridis, interpolateReds

  const { data: DatasetInfo, error, isLoading } = useGetDatasetQuery(1);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchMap({
        chrom1: range1,
        chrom2: range2,
        dataset_name: heatMapState.dataset_name,
        resolution: heatMapState.resolution,
        cell_id: map_id.toString(),
      });

      setHeatMapData(data);
    };
    if (apiCall === true) getData();
    dispatch(updateApiCalls({ call: false, id: map_id }));
  }, [apiCall]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const map = new PIXI.Application({
      view: canvasRef.current,
      width: app_size,
      height: app_size,
      backgroundColor: 0xffffff,
      resolution: 1,
    });

    map.stage.addChild(container);
    container.removeChildren();
  }, []);

  useEffect(() => {
    container.removeChildren();
    let xsize = 0;
    let ysize = 0;
    if (heatMapData) {
      if (heatMapData[0]) {
        xsize = Math.min(heatMapData.length, Math.floor(app_size / psize));
        ysize = Math.min(heatMapData[0].length, Math.floor(app_size / psize));
      }
      const maxsize = Math.max(xsize, ysize);
      //console.log(heatMapData.length, Math.floor(app_size / psize));
      const s_psize = app_size / maxsize;
      console.log("s_psize: " + s_psize.toString());
      for (let i = 0; i < xsize; i++) {
        for (let j = 0; j < ysize; j++) {
          if (heatMapData[i][j]) {
            const point = new PIXI.Graphics();

            let color = d3.color(colorScale(heatMapData[i][j]))!.formatHex();
            point.beginFill(PIXI.utils.string2hex(color));
            point.drawRect(i * s_psize, j * s_psize, s_psize, s_psize);
            point.endFill();
            point.name = heatMapData[i][j].toString();
            point.interactive = true;
            createValueText(point);

            container.addChild(point);
          }
        }
      }
    }
  }, [heatMapData, color, psize]);

  function createValueText(rectangle: PIXI.Graphics) {
    rectangle.interactive = true;
    // create a text object to display the value

    rectangle.on("mouseover", () => {
      setText("scaled value: " + rectangle.name.substr(0, 5));
    });

    rectangle.on("mouseout", () => {
      setText("scaled value: ");
    });
  }

  return (
    <div>
      <canvas
        style={{
          padding: "2px",
          border: "1px solid rgba(0, 0, 0, 0.2)",
        }}
        ref={canvasRef}
      />
      <Paper
        style={{
          padding: 8,
          width: "30%",
        }}
      >
        <Typography variant="h6">{text}</Typography>
      </Paper>
    </div>
  );
};

export default HeatMap;
