import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../theme";
import { Box, useTheme } from "@mui/material";
import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchMap,
  getTicksAndPosFromRange,
  getStartPositionAndRange,
  getChromLenFromPos,
  getNbChrom,
} from "../utils";

import { updateApiCalls } from "../redux/heatmap2DSlice";
import {
  addHorizontalTicksText,
  addVerticalTicksText,
  formatPrecision,
} from "./ChromTickTrack";
import createHeatMapFromTexture from "./ContactMapTexture";
// @ts-ignore
import { dispatch as nb_dispatch } from "@nucleome/nb-dispatch";

interface HeatMapProps {
  map_id: number;
}

interface NBQuery {
  chr: string;
  start: number;
  end: number;
  color: string | null;
}
const initRect = (rect: PIXI.Graphics) => {
  rect.lineStyle(2, 0xff0000, 1);
  rect.drawRect(0, 0, 0, 0);
  rect.visible = false;
};
const HeatMap: React.FC<HeatMapProps> = ({ map_id }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [heatMapData, setHeatMapData] = useState<number[][]>([]);
  const heatMapState = useAppSelector((state) => state.heatmap2D);
  let range1 = heatMapState.chrom1;
  let range2 = heatMapState.chrom2;
  const app_size = heatMapState.app_size;
  const contact_map_size = heatMapState.contact_map_size;
  const psize = heatMapState.pix_size;
  const apiCall = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id].call
  );

  const dispatch = useAppDispatch();

  //const [color, setColor] = useState(0xff0000);

  // Create canvasRef using custome hook
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [contact2d_container, setContainer] = useState<PIXI.Container>(
    new PIXI.Container()
  );
  const [chrom_dist_container, setChrom_dist_container] =
    useState<PIXI.Container>(new PIXI.Container());

  const [sltRect, setSltRect] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [symRect, setSymRect] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [posRect, setPosRect] = useState<PIXI.Graphics>(new PIXI.Graphics());

  const isDragging = useRef(false);
  const mousePos = useRef({
    x_pos: 0,
    y_pos: 0,
  });
  const transform_xy = app_size - contact_map_size;

  //const [text, setText] = useState<string>("Scaled value: ");
  const [chrom1pos, setChrom1Pos] = useState<string>("Chrom1 pos: ");
  const [chrom2pos, setChrom2Pos] = useState<string>("Chrom2 pos: ");
  const colorScale =
    theme.palette.mode === "dark"
      ? d3.scaleSequential(d3.interpolateViridis).domain([0, 1])
      : d3.scaleSequential(d3.interpolateReds).domain([0, 1]); //interpolateViridis, interpolateReds
  const colorScaleMemo = useMemo(() => colorScale, [theme.palette.mode]);
  const cleanupCanvas = useCallback(() => {
    contact2d_container.removeChildren();
    chrom_dist_container.removeChildren();
  }, []);

  /*const colorScale = d3
    .scaleLog()
    .domain([0.001, 0.01, 0.1, 1])
    //@ts-ignore
    .range(["yellow", "orange", "red", "black"]); //"white", "yellow", "orange", "red", "black"
    */

  //const { data: DatasetInfo, error, isLoading } = useGetDatasetQuery(1);

  // Connect to nb-dispatch
  var nb_hub = nb_dispatch("update", "brush");
  nb_hub.connect(function (status: any) {});

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
    const app = new PIXI.Application({
      view: canvasRef.current,
      width: app_size,
      height: app_size,
      backgroundColor: colors.primary[400],
      resolution: 1,
    });

    initRect(sltRect);
    initRect(symRect);
    initRect(posRect);

    app.stage.addChild(contact2d_container);
    app.stage.addChild(chrom_dist_container);
    app.stage.addChild(sltRect);
    app.stage.addChild(symRect);
    app.stage.addChild(posRect);

    // Clean up side effect when the component unmounts
    return () => {
      app.stage.removeChildren();
      //map.destroy(true);
      //canvasRef.current?.removeChild(map.view as HTMLCanvasElement);
    };
  }, []); //theme.palette.mode
  useEffect(() => {
    //add container background
    const point = new PIXI.Graphics();
    point.beginFill(PIXI.utils.string2hex(colors.primary[300]));
    point.drawRect(
      transform_xy,
      transform_xy,
      contact_map_size,
      contact_map_size
    );
    point.endFill();
    const point1 = new PIXI.Graphics();
    point1.beginFill(PIXI.utils.string2hex(colors.primary[400]));
    point1.drawRect(0, 0, app_size, app_size);
    point.endFill();
    point1.endFill();
    contact2d_container.addChild(point);
    contact2d_container.addChild(point1);
    handleContainerEvent(contact2d_container);

    const horizontal_ticks = getTicksAndPosFromRange(range1, contact_map_size);
    const vertical_ticks = getTicksAndPosFromRange(range2, contact_map_size);

    if (heatMapData) {
      if (heatMapData[0]) {
        createHeatMapFromTexture(
          heatMapData,
          contact2d_container,
          heatMapState.app_size,
          heatMapState.contact_map_size,
          colorScaleMemo
        );
        addHorizontalTicksText(
          horizontal_ticks,
          chrom_dist_container,
          colors.grey[100]
        );
        addVerticalTicksText(
          vertical_ticks,
          chrom_dist_container,
          colors.grey[100]
        );
      }
      return cleanupCanvas;
    }
  }, [heatMapData, psize, theme.palette.mode]);

  function handleContainerEvent(container: PIXI.Container) {
    container.interactive = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    container.on("pointermove", (event: PIXI.FederatedMouseEvent) => {
      const endX = event.clientX - rect!.left;
      const endY = event.clientY - rect!.top;

      const chrom1_len = getChromLenFromPos(
        range1,
        contact_map_size,
        event.clientX - rect!.left - transform_xy - 3
      );
      const chrom2_len = getChromLenFromPos(
        range2,
        contact_map_size,
        event.clientY - rect!.top - transform_xy - 3
      );
      const textChrom1 = new PIXI.Text(
        "Chr1:" + formatPrecision(Math.trunc(chrom1_len)),
        {
          fontFamily: "Arial",
          fontSize: 10,
          fill: colors.grey[500],
        }
      );
      const textChrom2 = new PIXI.Text(
        "Chr2:" + formatPrecision(Math.trunc(chrom2_len)),
        {
          fontFamily: "Arial",
          fontSize: 10,
          fill: colors.grey[500],
        }
      );

      posRect.visible = true;
      posRect.clear();
      posRect.removeChildren();
      posRect.lineStyle(2, 0xeeeeee, 1);
      posRect.beginFill(0xe5e4e2);

      // if (app_size - endX < 100 || app_size - endY < 100) {
      //   posRect.drawRect(endX - 85, endY - 35, 85, 35);
      //   textChrom1.x = 5 + endX - 85;
      //   textChrom1.y = 5 + endY - 35;
      //   textChrom2.x = 5 + endX - 85;
      //   textChrom2.y = 20 + endY - 35;
      // } else {

      posRect.drawRect(endX, endY, 85, 35);
      textChrom1.x = 5 + endX;
      textChrom1.y = 5 + endY;
      textChrom2.x = 5 + endX;
      textChrom2.y = 20 + endY;
      // }
      posRect.alpha = 0.8;
      posRect.endFill();

      posRect.addChild(textChrom1);
      posRect.addChild(textChrom2);
      //setChrom1Pos("Chrom1 pos: " + formatPrecision(Math.trunc(chrom1_len)));
      //setChrom2Pos("Chrom2 pos: " + formatPrecision(Math.trunc(chrom2_len)));
    });
    container.on("pointerleave", (event: PIXI.FederatedMouseEvent) => {
      posRect.visible = false;
    });
    container.on("mousedown", (event: PIXI.FederatedMouseEvent) => {
      isDragging.current = true;
      sltRect.visible = false;
      symRect.visible = false;

      (mousePos.current.x_pos = event.clientX - rect!.left - 3),
        (mousePos.current.y_pos = event.clientY - rect!.top - 3);

      //console.log(event.clientX - transform_xy - 3);
    });
    container.on("mousemove", (event: PIXI.FederatedMouseEvent) => {
      if (isDragging.current) {
        posRect.visible = false;
        const endX = event.clientX - rect!.left;
        const endY = event.clientY - rect!.top;
        const x = Math.min(mousePos.current.x_pos, endX);
        const y = Math.min(mousePos.current.y_pos, endY);

        //console.log(mousePos.current.x_pos, endX);
        const width = Math.abs(endX - mousePos.current.x_pos);
        const height = Math.abs(endY - mousePos.current.y_pos);
        sltRect.clear();
        symRect.clear();
        sltRect.lineStyle(2, 0xeeeeee, 1);
        sltRect.beginFill(0xe5e4e2);
        sltRect.drawRect(x, y, width, height);
        sltRect.alpha = 0.3;
        sltRect.endFill();
        sltRect.visible = true;

        symRect.lineStyle(2, 0xeeeeee, 1);
        symRect.beginFill(0xe5e4e2);
        symRect.drawRect(y, x, height, width);
        symRect.alpha = 0.3;
        symRect.endFill();
        symRect.visible = true;
      }
    });
    container.on("mouseup", (event: PIXI.FederatedMouseEvent) => {
      isDragging.current = false;

      // setTimeout(() => {
      //   sltRect.visible = false;
      //   symRect.visible = false;
      // }, 5000);
      const endX = event.clientX - rect!.left;
      const endY = event.clientY - rect!.top;
      const x = Math.min(mousePos.current.x_pos, endX);
      const y = Math.min(mousePos.current.y_pos, endY);

      //console.log(mousePos.current.x_pos, endX);
      const width = Math.abs(endX - mousePos.current.x_pos);
      const height = Math.abs(endY - mousePos.current.y_pos);
      const chrom1_start = getChromLenFromPos(
        range1,
        contact_map_size,
        x - transform_xy
      );
      const chrom2_start = getChromLenFromPos(
        range2,
        contact_map_size,
        y - transform_xy
      );
      const chrom1_len =
        getChromLenFromPos(range1, contact_map_size, x - transform_xy + width) -
        chrom1_start;
      const chrom2_len =
        getChromLenFromPos(
          range2,
          contact_map_size,
          y - transform_xy + height
        ) - chrom2_start;

      callNbQuery(chrom1_start, chrom2_start, chrom1_len, chrom2_len);
      event.stopImmediatePropagation();
    });
  }
  const callNbQuery = useCallback(
    (
      chrom1_start: number,
      chrom2_start: number,
      chrom1_len: number,
      chrom2_len: number
    ) => {
      console.log("Call" + chrom1_start + " " + chrom2_start);
      let [start1, dist1] = getStartPositionAndRange(range1);
      let [start2, dist2] = getStartPositionAndRange(range2);
      let chr1 = getNbChrom(range1);
      let chr2 = getNbChrom(range2);

      var q_regions: NBQuery[] = [];
      var h_regions: NBQuery[] = [];
      if (range1 == range2) {
        q_regions = [
          {
            chr: chr1,
            start: start1,
            end: start1 + dist1,
            color: "",
          },
        ];
      } else {
        q_regions = [
          {
            chr: chr1,
            start: start1,
            end: start1 + dist1,
            color: "",
          },
          {
            chr: chr2,
            start: start2,
            end: start2 + dist2,
            color: "",
          },
        ];
      }
      h_regions = [
        {
          chr: chr1,
          start: chrom1_start,
          end: chrom1_start + chrom1_len,
          color: "",
        },
        {
          chr: chr2,
          start: chrom2_start,
          end: chrom2_start + chrom2_len,
          color: "",
        },
      ];
      if (chrom2_start < chrom1_start) h_regions.reverse();
      h_regions[0].color = "yellow";
      h_regions[1].color = "purple";
      // navigate to specific regions
      //console.log(h_regions);
      // @ts-ignore
      nb_hub.call("update", this, q_regions);
      // highlgith some regions
      // @ts-ignore
      nb_hub.call("brush", this, h_regions);
    },
    [range1, range2]
  );
  /*
  function createValueText(rectangle: PIXI.Graphics) {
    rectangle.interactive = true;
    // create a text object to display the value

    rectangle.on("mouseover", () => {
      setText("Scaled value: " + rectangle.name.substring(0, 5));
    });

    rectangle.on("mouseout", () => {
      setText("Scaled value: ");
    });
  }*/

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
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {heatMapData && (
        <canvas
          style={{
            padding: "2px",
            border: "1px solid rgba(0, 0, 0, 0.2)",
          }}
          ref={canvasRef}
        />
      )}
      {/* <Paper
        style={{
          padding: 8,
          width: "50%",
        }}
      >
        <Typography variant="body1" gutterBottom>
          {chrom1pos}
        </Typography>
        <Typography variant="body1">{chrom2pos}</Typography>
      </Paper> */}
    </Box>
  );
};

export default HeatMap;
