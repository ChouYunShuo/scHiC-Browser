import { useRef, useState, useEffect } from "react";
import { Typography, Paper } from "@material-ui/core";
import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchMap,
  getTicksAndPosFromRange,
  getStartPositionAndRange,
} from "../utils";
import { useGetDatasetQuery, useGetDatasetsQuery } from "../redux/apiSlice";
import { updateApiCalls } from "../redux/heatmap2DSlice";
import {
  addHorizontalTicksText,
  addVerticalTicksText,
  formatPrecision,
} from "./ChromTickTrack";
const simpleQuery = {
  chrom1: "chrom2:0-100000000",
  chrom2: "chrom2:0-100000000",
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
  const contact_map_size = heatMapState.contact_map_size;
  const psize = heatMapState.pix_size;
  const apiCall = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id].call
  );

  const dispatch = useAppDispatch();

  const [color, setColor] = useState(0xff0000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contact2d_container, setContainer] = useState<PIXI.Container>(
    new PIXI.Container()
  );
  const [chrom_dist_container, setChrom_dist_container] =
    useState<PIXI.Container>(new PIXI.Container());

  const [text, setText] = useState<string>("Scaled value: ");
  const [chrom1pos, setChrom1Pos] = useState<string>("Chrom1 pos: ");
  const [chrom2pos, setChrom2Pos] = useState<string>("Chrom2 pos: ");
  const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]); //interpolateViridis, interpolateReds

  /*const colorScale = d3
    .scaleLog()
    .domain([0.001, 0.01, 0.1, 1])
    //@ts-ignore
    .range(["yellow", "orange", "red", "black"]); //"white", "yellow", "orange", "red", "black"
    */
  const { data: DatasetInfo, error, isLoading } = useGetDatasetQuery(1);
  const transform_xy = app_size - contact_map_size;
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

    map.stage.addChild(contact2d_container);
    map.stage.addChild(chrom_dist_container);
    contact2d_container.removeChildren();
    chrom_dist_container.removeChild();
  }, []);

  useEffect(() => {
    contact2d_container.removeChildren();
    chrom_dist_container.removeChildren();

    //add container background =
    const point = new PIXI.Graphics();
    point.beginFill(PIXI.utils.string2hex("#eeeeee"));
    point.drawRect(
      transform_xy,
      transform_xy,
      contact_map_size,
      contact_map_size
    );
    point.endFill();
    contact2d_container.addChild(point);

    const horizontal_ticks = getTicksAndPosFromRange(range1, contact_map_size);
    const vertical_ticks = getTicksAndPosFromRange(range2, contact_map_size);

    let xsize = 0;
    let ysize = 0;
    if (heatMapData) {
      if (heatMapData[0]) {
        xsize = Math.min(
          heatMapData.length,
          Math.floor(contact_map_size / psize)
        );
        ysize = Math.min(
          heatMapData[0].length,
          Math.floor(contact_map_size / psize)
        );
      }
      // using the long side to fit scale
      const maxsize = Math.max(xsize, ysize);
      const s_psize = contact_map_size / maxsize;

      console.log("s_psize: " + s_psize.toString());
      for (let i = 0; i < xsize; i++) {
        for (let j = 0; j < ysize; j++) {
          if (heatMapData[i][j]) {
            const point = new PIXI.Graphics();
            //@ts-ignore
            let color = d3.color(colorScale(heatMapData[i][j]))!.formatHex();
            point.beginFill(PIXI.utils.string2hex(color));
            point.drawRect(
              transform_xy + i * s_psize,
              transform_xy + j * s_psize,
              s_psize,
              s_psize
            );
            point.endFill();
            point.name = heatMapData[i][j].toString();
            point.interactive = true;
            createValueText(point);
            let [start1, dist1] = getStartPositionAndRange(range1);
            let [start2, dist2] = getStartPositionAndRange(range2);

            let chrom1_pos = start1 + (i * dist1) / xsize;
            let chrom2_pos = start2 + (j * dist2) / ysize;
            pix2Dist(chrom1_pos, chrom2_pos, point);

            contact2d_container.addChild(point);
          } else {
            const point = new PIXI.Graphics();
            point.beginFill(PIXI.utils.string2hex("#eeeeee"));
            point.drawRect(
              transform_xy + i * s_psize,
              transform_xy + j * s_psize,
              s_psize,
              s_psize
            );
            point.endFill();
            contact2d_container.addChild(point);
          }
        }
      }
      addHorizontalTicksText(horizontal_ticks, chrom_dist_container);
      addVerticalTicksText(vertical_ticks, chrom_dist_container);
    }
  }, [heatMapData, color, psize]);

  function createValueText(rectangle: PIXI.Graphics) {
    rectangle.interactive = true;
    // create a text object to display the value

    rectangle.on("mouseover", () => {
      setText("Scaled value: " + rectangle.name.substring(0, 5));
    });

    rectangle.on("mouseout", () => {
      setText("Scaled value: ");
    });
  }

  function pix2Dist(
    chrom1_pos: number,
    chrom2_pos: number,
    rectangle: PIXI.Graphics
  ) {
    rectangle.on("mouseover", () => {
      setChrom1Pos("Chrom1 pos: " + formatPrecision(Math.trunc(chrom1_pos)));
      setChrom2Pos("Chrom2 pos: " + formatPrecision(Math.trunc(chrom2_pos)));
    });

    rectangle.on("mouseout", () => {
      setChrom1Pos("Chrom1 pos: ");
      setChrom2Pos("Chrom2 pos: ");
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
          width: "50%",
        }}
      >
        <Typography variant="body1" gutterBottom>
          {text}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {chrom1pos}
        </Typography>
        <Typography variant="body1">{chrom2pos}</Typography>
      </Paper>
    </div>
  );
};

export default HeatMap;
