import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { Box, useTheme } from "@mui/material";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import * as d3 from "d3";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  getTicksAndPosFromRange,
  getStartPositionAndRange,
  getChromLenFromPos,
  getNbChrom,
  getScaleFromRange,
  getNewChromFromNewPos,
  getNewChromZoomOut,
  adjustChromValues,
} from "../../utils/utils";
import {
  useFetchContactMapDataQuery,
  useFetchTrackDataQuery,
} from "../../redux/apiSlice";
import {
  updateSelectRect,
  updateApiChromQuery,
} from "../../redux/heatmap2DSlice";
import { addHorizontalTicksText, addVerticalTicksText } from "./ChromTickTrack";
import {
  drawVerticalTrack,
  drawHorizontalTrack,
  drawHorizontalScale,
  drawHorizontalTrackType,
} from "./SignalTrack1D";
import { drawRectWithText } from "./PixiChromText";
import createHeatMapFromTexture from "./ContactMapTexture";
import LoadingSpinner from "../LoadingPage";
// @ts-ignore
import { dispatch as nb_dispatch } from "@nucleome/nb-dispatch";
import ErrorAPI from "../ErrorComponent";
import { DragEvent } from "pixi-viewport/dist/types";
import debounce from "lodash.debounce";
import { initRect, drawSelectRect, createGraphics } from "../../utils/heatmap";

// load config
import config from "../../config.json";

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

type BreakPoint = {
  value: number;
  color: string;
};

const breakpoints_light = [
  { value: 0, color: "white" },
  { value: 0.6, color: "yellow" },
  { value: 0.7, color: "orange" },
  { value: 0.88, color: "red" },
  { value: 1, color: "black" },
];
const breakpoints_dark = [
  { value: 0, color: "#440154" },
  { value: 0.6, color: "#2a788e" },
  { value: 0.7, color: "#22a884" },
  { value: 0.88, color: "#7ad151" },
  { value: 1, color: "#fde725" },
];
//["#440154","#482475","#414487","#355f8d","#2a788e","#21918c","#22a884","#44bf70","#7ad151","#bddf26","#fde725"]
// Custom interpolator
function customInterpolator(t: number, breakpoints: BreakPoint[]) {
  for (let i = 1; i < breakpoints.length; i++) {
    if (t <= breakpoints[i].value) {
      const t0 = breakpoints[i - 1].value;
      const t1 = breakpoints[i].value;
      const f = (t - t0) / (t1 - t0);
      return d3.interpolate(breakpoints[i - 1].color, breakpoints[i].color)(f);
    }
  }
  return breakpoints[breakpoints.length - 1].color;
}
const HeatMap: React.FC<HeatMapProps> = ({ map_id, selected }) => {
  //The color theme of the project

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  // load data from redux slice
  const range1 = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id]?.query.chrom1
  );
  const range2 = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id]?.query.chrom2
  );
  console.log(range1);
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
  const isSelectRegionEvent = useAppSelector(
    (state) => state.heatmap2D.apiCalls[map_id].selectRegion
  );
  const selectRect = useAppSelector((state) => state.heatmap2D.selectRect);
  const dispatch = useAppDispatch();

  // pixi related variables
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contact2d_container, setContainer] = useState<PIXI.Container>(
    new PIXI.Container()
  );
  const [bg_container, setBgContainer] = useState<PIXI.Container>(
    new PIXI.Container()
  );
  const [chrom_dist_container, setChrom_dist_container] =
    useState<PIXI.Container>(new PIXI.Container());
  const [horizontal_track_container, setHorizontal_track_container] =
    useState<PIXI.Container>(new PIXI.Container());
  const [vertical_track_container, setVertical_track_container] =
    useState<PIXI.Container>(new PIXI.Container());

  const [sltRect, setSltRect] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [symRect, setSymRect] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [posRect, setPosRect] = useState<PIXI.Graphics>(new PIXI.Graphics());

  //pixi event
  const viewportRef = useRef<Viewport | null>(null);

  const isDragging = useRef(false);
  const mousePos = useRef({
    x_pos: 0,
    y_pos: 0,
  });
  // contact map panning/zooming related
  const transform_xy = (app_size - contact_map_size) / 2;
  const range1Ref = useRef<string>(range1);
  const range2Ref = useRef<string>(range2);
  const topCornerRef = useRef<PIXI.Point>(new PIXI.Point(0, 0));
  const bottomCornerRef = useRef<PIXI.Point>(
    new PIXI.Point(contact_map_size, contact_map_size)
  );

  const [mapTopCorner, setMapTopCorner] = useState(new PIXI.Point(0, 0));
  const [mapbottomCorner, setMapBottomCorner] = useState(
    new PIXI.Point(contact_map_size, contact_map_size)
  );

  // pixi contact map color scale
  const logScale = d3
    .scaleLog()
    .domain([0.0001, 1]) // Starting from 0.0001 to avoid -Infinity with log(0)
    .range([0, 1]);

  // Combine with sequential scale using the custom interpolator
  const colorScale =
    theme.palette.mode === "dark"
      ? d3
          .scaleSequential((t) =>
            customInterpolator(logScale(t), breakpoints_dark)
          )
          .domain([0, 1]) // adjust domain for log scale
      : d3
          .scaleSequential((t) =>
            customInterpolator(logScale(t), breakpoints_light)
          )
          .domain([0, 1]);

  // const colorScale =
  // theme.palette.mode === "dark"
  //   ? d3.scaleSequentialLog(d3.interpolateViridis).domain([0, 1]) // adjust domain for log scale
  //   : d3.scaleSequentialLog(d3.interpolateReds).domain([0, 1]); // adjust domain for log scale

  const colorScaleMemo = useMemo(() => colorScale, [theme.palette.mode]);
  const cleanupCanvas = useCallback(() => {
    contact2d_container.removeChildren();
    contact2d_container.removeAllListeners();
    chrom_dist_container.removeChildren();
  }, []);
  const cleanupTicks = useCallback(() => {
    chrom_dist_container.removeChildren();
  }, []);

  // Connect to nb-dispatch
  // var nb_hub = nb_dispatch("update", "brush");
  // nb_hub.connect(function (status: any) {});

  // fetch data from rtk apis
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
  const {
    data: sig1Data,
    error: sig1Error,
    isFetching: sig1IsFetching,
    isLoading: sig1IsLoading,
  } = useFetchTrackDataQuery({
    type: config.init_state.track_type, // ab_score, gene_score, insul_score
    chrom1: range1,
    dataset_name: dataset_name,
    resolution: resolution,
    cell_id: apiCall.selectedCells,
  });
  const {
    data: sig2Data,
    error: sig2Error,
    isFetching: sig2IsFetching,
    isLoading: sig2IsLoading,
  } = useFetchTrackDataQuery({
    type: config.init_state.track_type,
    chrom1: range2,
    dataset_name: dataset_name,
    resolution: resolution,
    cell_id: apiCall.selectedCells,
  });

  useEffect(() => {
    range1Ref.current = range1;
    range2Ref.current = range2;
  }, [range1, range2]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // Initialize PIXI application and viewport
    const { app, mapViewport } = initializePixiAppAndViewport();
    viewportRef.current = mapViewport;

    // Initialize rectangles and add them to the stage
    initializeRectsAndAddToStage(app);

    // Add event listeners to the viewport
    addMapViewportEventListeners(mapViewport);

    function initializePixiAppAndViewport() {
      const app = new PIXI.Application({
        view: canvasRef.current!,
        width: app_size,
        height: app_size,
        resolution: 1,
      });

      const mapViewport = new Viewport({
        screenWidth: app_size,
        screenHeight: app_size,
        worldWidth: contact_map_size,
        worldHeight: contact_map_size,
        passiveWheel: false,
        events: app.renderer.events,
      });

      return { app, mapViewport };
    }

    function initializeRectsAndAddToStage(app: PIXI.Application) {
      [sltRect, symRect, posRect].forEach(initRect);

      app.stage.addChild(bg_container);
      app.stage.addChild(mapViewport);
      mapViewport.addChild(contact2d_container);
      app.stage.addChild(horizontal_track_container);
      app.stage.addChild(vertical_track_container);
      app.stage.addChild(chrom_dist_container);
      app.stage.addChild(sltRect);
      app.stage.addChild(symRect);
      app.stage.addChild(posRect);
    }

    function addMapViewportEventListeners(viewport: Viewport) {
      viewport.drag().wheel();

      viewport.on("zoomed-end", (e: Viewport) => {
        const mapTLCorner = new PIXI.Point(0, 0);
        const mapBRCorner = new PIXI.Point(contact_map_size, contact_map_size);
        const worldTLPosition = e.toGlobal(mapTLCorner);
        const worldBRPosition = e.toGlobal(mapBRCorner);
        topCornerRef.current = worldTLPosition;
        bottomCornerRef.current = worldBRPosition;
        setMapTopCorner(worldTLPosition);
        setMapBottomCorner(worldBRPosition);
        horizontal_track_container.scale.x = e.scale.x;
        horizontal_track_container.position.x = worldTLPosition.x;
        vertical_track_container.scale.y = e.scale.y;
        vertical_track_container.position.y = worldTLPosition.y;
        handleZoomedEnd(e);
      });
      viewport.on("drag-end", (e: DragEvent) => {
        const mapTLCorner = new PIXI.Point(0, 0);
        const mapBRCorner = new PIXI.Point(contact_map_size, contact_map_size);

        const worldTLPosition = e.viewport.toGlobal(mapTLCorner);
        const worldBRPosition = e.viewport.toGlobal(mapBRCorner);
        topCornerRef.current = worldTLPosition;
        bottomCornerRef.current = worldBRPosition;

        setMapTopCorner(worldTLPosition);
        setMapBottomCorner(worldBRPosition);
        horizontal_track_container.position.x = worldTLPosition.x;
        vertical_track_container.position.y = worldTLPosition.y;
      });
      return () => {
        viewport.off("zoomed-end");
        viewport.off("drag-end");
      };
    }

    function handleZoomedEnd(e: Viewport) {
      if (e.x === 0 && e.y === 0) {
        console.log("Viewport is at (0, 0), returning early.");
        return;
      }
      if (e.scale.x < 1) {
        debouncedhandleZoomOut(e);
        return;
      } else if (e.scale.x > 1) {
        debouncedHandleZoomIn(e);
        return;
      }
    }
    const debouncedhandleZoomOut = debounce((e: Viewport) => {
      const newChrom1 = getNewChromZoomOut(range1Ref.current, 1 / e.scale.x);
      const newChrom2 = getNewChromZoomOut(range2Ref.current, 1 / e.scale.y);
      range1Ref.current = newChrom1;
      range2Ref.current = newChrom2;
      dispatch(
        updateApiChromQuery({
          id: map_id,
          query: { chrom1: newChrom1, chrom2: newChrom2 },
        })
      );
    }, 2000);

    const debouncedHandleZoomIn = debounce((e: Viewport) => {
      const { worldPoint, worldPoint1 } = getCornerPoints(e);

      let chrom1_start = getChromLenFromPos(
        range1Ref.current,
        contact_map_size,
        worldPoint.x - transform_xy
      );
      let chrom2_start = getChromLenFromPos(
        range2Ref.current,
        contact_map_size,
        worldPoint.y - transform_xy
      );
      let chrom1_end = getChromLenFromPos(
        range1Ref.current,
        contact_map_size,
        worldPoint1.x - transform_xy
      );
      let chrom2_end = getChromLenFromPos(
        range2Ref.current,
        contact_map_size,
        worldPoint1.y - transform_xy
      );

      const adjustedChromValues = adjustChromValues(
        chrom1_start,
        chrom1_end,
        chrom2_start,
        chrom2_end
      );

      const newChrom1 = getNewChromFromNewPos(
        range1Ref.current,
        adjustedChromValues.chrom1_start,
        adjustedChromValues.chrom1_end
      );
      const newChrom2 = getNewChromFromNewPos(
        range2Ref.current,
        adjustedChromValues.chrom2_start,
        adjustedChromValues.chrom2_end
      );

      range1Ref.current = newChrom1;
      range2Ref.current = newChrom2;

      dispatch(
        updateApiChromQuery({
          id: map_id,
          query: { chrom1: newChrom1, chrom2: newChrom2 },
        })
      );
    }, 1000);

    function getCornerPoints(e: Viewport) {
      const devicePoint = new PIXI.Point(transform_xy, transform_xy);
      const devicePoint1 = new PIXI.Point(
        contact_map_size + transform_xy,
        contact_map_size + transform_xy
      );

      const worldPoint = e.toLocal(devicePoint);
      const worldPoint1 = e.toLocal(devicePoint1);

      return { worldPoint, worldPoint1 };
    }

    // Cleanup function to remove all children from the stage
    return () => {
      app.stage.removeChildren();
    };
  }, []);

  useEffect(() => {
    const point1 = createGraphics(
      colors.primary[400],
      0,
      0,
      app_size,
      app_size
    );
    bg_container.addChild(point1);

    // add heatmap, Text data
    handleTickUpdate();
    handleSignal1dUpdate();
    if (heatMapData) {
      if (heatMapData[0]) {
        createHeatMapFromTexture(
          heatMapData,
          contact2d_container,
          app_size,
          contact_map_size,
          colorScaleMemo,
          colors.primary[400]
        );
      }
      if (viewportRef.current) {
        viewportRef.current.setZoom(1); // Reset zoom to 1
        viewportRef.current.moveCorner(0, 0);
      }
      return cleanupCanvas;
    }
  }, [heatMapData, psize, theme.palette.mode]);

  //update ticks in real-time
  useEffect(() => {
    handleTickUpdate();
    handleSignal1dUpdate();
    return cleanupTicks;
  }, [mapTopCorner, mapbottomCorner, theme.palette.mode]);

  const handleSignal1dUpdate = () => {
    const cornerRect = createGraphics(
      colors.primary[400],
      transform_xy + contact_map_size,
      transform_xy + contact_map_size,
      transform_xy,
      transform_xy
    );
    const signal1Rect = createGraphics(
      colors.primary[400],
      transform_xy,
      transform_xy + contact_map_size,
      contact_map_size,
      transform_xy
    );
    const signal2Rect = createGraphics(
      colors.primary[400],
      transform_xy + contact_map_size,
      transform_xy,
      transform_xy,
      contact_map_size
    );
    chrom_dist_container.addChild(cornerRect);
    horizontal_track_container.addChild(signal1Rect);
    vertical_track_container.addChild(signal2Rect);

    if (heatMapData) {
      if (!sig1IsLoading && sig1Data) {
        drawHorizontalTrack(
          sig1Data,
          contact_map_size,
          transform_xy,
          horizontal_track_container,
          theme.palette.mode == "dark"
            ? colors.redAccent[300]
            : colors.greenAccent[300]
        );
        drawHorizontalScale(chrom_dist_container, colors.grey[100]);
      }
      if (!sig2IsLoading && sig2Data) {
        drawVerticalTrack(
          sig2Data,
          contact_map_size,
          transform_xy,
          vertical_track_container,
          theme.palette.mode == "dark"
            ? colors.redAccent[300]
            : colors.greenAccent[300]
        );
      }
    }
  };

  const handleTickUpdate = () => {
    const chrom1Rect = createGraphics(
      colors.primary[400],
      0,
      0,
      transform_xy,
      app_size
    );
    const chrom2Rect = createGraphics(
      colors.primary[400],
      0,
      0,
      app_size,
      transform_xy
    );

    chrom_dist_container.addChild(chrom1Rect);
    chrom_dist_container.addChild(chrom2Rect);

    const [scaleX, scaleY] = getScaleFromRange(
      range1Ref.current,
      range2Ref.current
    );
    const hStart = topCornerRef.current.x;
    const hEnd = bottomCornerRef.current.x;
    const vStart = topCornerRef.current.y;
    const vEnd = bottomCornerRef.current.y;

    const horizontal_ticks = getTicksAndPosFromRange(
      range1Ref.current,
      hStart,
      hEnd,
      1
    );
    const vertical_ticks = getTicksAndPosFromRange(
      range2Ref.current,
      vStart,
      vEnd,
      1
    );

    // Add Text data

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
  };

  useEffect(() => {
    handleContainerEvent(contact2d_container);
    if (viewportRef.current) {
      if (isSelectRegionEvent || showChromPos) {
        viewportRef.current.plugins.pause("drag");
        viewportRef.current.plugins.pause("wheel");
      } else {
        viewportRef.current.plugins.resume("drag");
        viewportRef.current.plugins.resume("wheel");
      }
    }
  }, [showChromPos, isSelectRegionEvent]);

  useEffect(() => {
    if (selectRect.isVisible) {
      const x = selectRect.startX;
      const y = selectRect.startY;
      const width = selectRect.width;
      const height = selectRect.height;
      drawSelectRect(sltRect, x, y, width, height, colors.grey[100]);
      drawSelectRect(symRect, y, x, height, width, colors.grey[100]);
    } else {
      sltRect.visible = false;
      symRect.visible = false;
    }
  }, [selectRect]);

  function handleContainerEvent(container: PIXI.Container) {
    //@ts-ignore
    container.removeAllListeners();

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
    if (!isSelectRegionEvent) return;
    container.on("mousedown", (event: PIXI.FederatedMouseEvent) => {
      isDragging.current = true;
      dispatch(
        updateSelectRect({
          isVisible: false,
          startX: 0,
          startY: 0,
          width: 0,
          height: 0,
        })
      );

      (mousePos.current.x_pos = event.globalX),
        (mousePos.current.y_pos = event.globalY);
    });
    container.on("mousemove", (event: PIXI.FederatedMouseEvent) => {
      if (isDragging.current) {
        posRect.visible = false;
        const endX = event.globalX; //- dimensions.diff_x * resize_ratio;
        const endY = event.globalY; //- dimensions.diff_y * resize_ratio;
        const width = Math.abs(endX - mousePos.current.x_pos);
        const height = Math.abs(endY - mousePos.current.y_pos);
        const startX = Math.min(mousePos.current.x_pos, endX);
        const startY = Math.min(mousePos.current.y_pos, endY);
        dispatch(
          updateSelectRect({ isVisible: true, startX, startY, width, height })
        );
      }
    });
    container.on("mouseup", (event: PIXI.FederatedMouseEvent) => {
      isDragging.current = false;
      dispatch(
        updateSelectRect({
          isVisible: false,
          startX: 0,
          startY: 0,
          width: 0,
          height: 0,
        })
      );

      // const endX = event.globalX; //- dimensions.diff_x * resize_ratio;
      // const endY = event.globalY; //- dimensions.diff_y * resize_ratio;
      // const x = Math.min(mousePos.current.x_pos, endX);
      // const y = Math.min(mousePos.current.y_pos, endY);

      // const width = Math.abs(endX - mousePos.current.x_pos);
      // const height = Math.abs(endY - mousePos.current.y_pos);
      // const chrom1_start = getChromLenFromPos(
      //   range1,
      //   contact_map_size,
      //   x - transform_xy
      // );
      // const chrom2_start = getChromLenFromPos(
      //   range2,
      //   contact_map_size,
      //   y - transform_xy
      // );
      // const chrom1_len =
      //   getChromLenFromPos(range1, contact_map_size, x - transform_xy + width) -
      //   chrom1_start;
      // const chrom2_len =
      //   getChromLenFromPos(
      //     range2,
      //     contact_map_size,
      //     y - transform_xy + height
      //   ) - chrom2_start;

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
