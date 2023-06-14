import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../theme";
import { Box, useTheme } from "@mui/material";
import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  getTicksAndPosFromRange,
  getStartPositionAndRange,
  getChromLenFromPos,
  getNbChrom,
  getScaleFromRange,
} from "../utils";
import { useFetchContactMapDataQuery } from "../redux/apiSlice";
import { addHorizontalTicksText, addVerticalTicksText } from "./ChromTickTrack";
import { drawRectWithText } from "./PixiChromText";
import createHeatMapFromTexture from "./ContactMapTexture";
import LoadingSpinner from "./LoadingPage";
// @ts-ignore
import { dispatch as nb_dispatch } from "@nucleome/nb-dispatch";
import Error404 from "./ErrorPage";
import ErrorAPI from "./ErrorComponent";

interface HeatMapProps {
  map_id: number;
  selected?: string[];
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

const drawSelectRect = (
  rect: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  rect
    .clear()
    .lineStyle(2, 0xeeeeee, 1)
    .beginFill(0xe5e4e2)
    .drawRect(x, y, width, height)
    .endFill();

  rect.alpha = 0.3;
  rect.visible = true;
};

const HeatMap: React.FC<HeatMapProps> = ({ map_id, selected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  //const [heatMapData, setHeatMapData] = useState<number[][]>([]);
  const range1 = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id]?.query.chrom1
  );
  const range2 = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id]?.query.chrom2
  );
  const app_size = useAppSelector((state) => state.heatmap2D.app_size);
  const contact_map_size = useAppSelector(
    (state) => state.heatmap2D.contact_map_size
  );
  const psize = useAppSelector((state) => state.heatmap2D.pix_size);
  const apiCall = useAppSelector((state) => state.heatmap2D.apiCalls[map_id]);
  const dataset_name = useAppSelector((state) => state.heatmap2D.dataset_name);
  const resolution = useAppSelector((state) => state.heatmap2D.resolution);
  const showChromPos = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id].showChromPos
  );

  // Create canvasRef using custome hook
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [contact2d_container, setContainer] = useState<PIXI.Container>(
    new PIXI.Container()
  );
  const [bg_container, setBgContainer] = useState<PIXI.Container>(
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

  const colorScale =
    theme.palette.mode === "dark"
      ? d3.scaleSequentialLog(d3.interpolateViridis).domain([0.1, 1]) // adjust domain for log scale
      : d3.scaleSequentialLog(d3.interpolateReds).domain([0.1, 1]); // adjust domain for log scale
  const colorScaleMemo = useMemo(() => colorScale, [theme.palette.mode]);
  const cleanupCanvas = useCallback(() => {
    contact2d_container.removeChildren();
    contact2d_container.removeAllListeners();
    chrom_dist_container.removeChildren();
  }, []);

  // Connect to nb-dispatch
  // var nb_hub = nb_dispatch("update", "brush");
  // nb_hub.connect(function (status: any) {});

  const {
    data: heatMapData,
    error,
    isFetching,
    isLoading,
  } = useFetchContactMapDataQuery({
    chrom1: range1,
    chrom2: range2,
    dataset_name: dataset_name,
    resolution: resolution,
    cell_id: apiCall.selectedCells,
  });

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const app = new PIXI.Application({
      view: canvasRef.current,
      width: app_size,
      height: app_size,
      resolution: 2,
    });

    initRect(sltRect);
    initRect(symRect);
    initRect(posRect);
    app.stage.addChild(bg_container);
    app.stage.addChild(contact2d_container);
    app.stage.addChild(chrom_dist_container);
    app.stage.addChild(sltRect);
    app.stage.addChild(symRect);
    app.stage.addChild(posRect);

    // Clean up side effect when the component unmounts
    return () => {
      app.stage.removeChildren();
    };
  }, []);

  useEffect(() => {
    //add container background
    const point1 = new PIXI.Graphics();
    point1.beginFill(new PIXI.Color(colors.primary[400]));
    point1.drawRect(0, 0, app_size, app_size);
    point1.endFill();
    bg_container.addChild(point1);

    const [scaleX, scaleY] = getScaleFromRange(range1, range2);
    const horizontal_ticks = getTicksAndPosFromRange(
      range1,
      contact_map_size,
      scaleX
    );
    const vertical_ticks = getTicksAndPosFromRange(
      range2,
      contact_map_size,
      scaleY
    );
    handleContainerEvent(contact2d_container);
    // add heatmap, Text data
    if (heatMapData) {
      if (heatMapData[0]) {
        createHeatMapFromTexture(
          heatMapData,
          contact2d_container,
          app_size,
          contact_map_size,
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
  }, [heatMapData, psize, theme.palette.mode, showChromPos]);

  function handleContainerEvent(container: PIXI.Container) {
    container.eventMode = "dynamic";
    container.on("pointermove", (event: PIXI.FederatedMouseEvent) => {
      if (!showChromPos) {
        posRect.visible = false;
        return;
      }
      const endX = event.globalX; //- dimensions.diff_x * resize_ratio;
      const endY = event.globalY; //- dimensions.diff_y * resize_ratio;
      const [scaleX, scaleY] = getScaleFromRange(range1, range2);
      const chrom1_len = getChromLenFromPos(
        range1,
        contact_map_size * scaleX,
        event.globalX - transform_xy
      );
      const chrom2_len = getChromLenFromPos(
        range2,
        contact_map_size * scaleY,
        event.globalY - transform_xy
      );
      //console.log(dimensions.offsetX, dimensions.offsetY);
      const { textChrom1, textChrom2 } = drawRectWithText(
        colors.grey[500],
        posRect,
        endX,
        endY,
        chrom1_len,
        chrom2_len
      );
      posRect.addChild(textChrom1);
      posRect.addChild(textChrom2);
    });
    container.on("pointerleave", (event: PIXI.FederatedMouseEvent) => {
      posRect.visible = false;
    });
    container.on("mousedown", (event: PIXI.FederatedMouseEvent) => {
      isDragging.current = true;
      sltRect.visible = false;
      symRect.visible = false;

      (mousePos.current.x_pos = event.globalX),
        (mousePos.current.y_pos = event.globalY);
      // console.log(mousePos.current.x_pos, mousePos.current.y_pos);
      // console.log(event.globalX, event.globalY);
    });
    container.on("mousemove", (event: PIXI.FederatedMouseEvent) => {
      if (isDragging.current) {
        posRect.visible = false;
        const endX = event.globalX; //- dimensions.diff_x * resize_ratio;
        const endY = event.globalY; //- dimensions.diff_y * resize_ratio;
        const width = Math.abs(endX - mousePos.current.x_pos);
        const height = Math.abs(endY - mousePos.current.y_pos);
        const x = Math.min(mousePos.current.x_pos, endX);
        const y = Math.min(mousePos.current.y_pos, endY);
        drawSelectRect(sltRect, x, y, width, height);
        drawSelectRect(symRect, y, x, height, width);
      }
    });
    container.on("mouseup", (event: PIXI.FederatedMouseEvent) => {
      isDragging.current = false;

      const endX = event.globalX; //- dimensions.diff_x * resize_ratio;
      const endY = event.globalY; //- dimensions.diff_y * resize_ratio;
      const x = Math.min(mousePos.current.x_pos, endX);
      const y = Math.min(mousePos.current.y_pos, endY);

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

      //callNbQuery(chrom1_start, chrom2_start, chrom1_len, chrom2_len);
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
  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.2)",
      }}
    >
      <Box
        style={{
          position: "relative",
          width: "100%",
          height: "0",
          paddingBottom: "100%",
          display: isLoading || error ? "none" : "block", // Hide canvas when loading
        }}
      >
        <canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          ref={canvasRef}
        />
      </Box>
      {error ? <ErrorAPI /> : (isFetching || isLoading) && <LoadingSpinner />}
    </Box>
  );
};

export default HeatMap;
