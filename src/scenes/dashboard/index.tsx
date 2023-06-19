import React, { useEffect, useState, useRef, useCallback } from "react";

import { Box, useTheme, CircularProgress, Typography } from "@mui/material";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { tokens } from "../../theme";
import HeatMap from "../../components/ContactMap/ContactMap2D";
import {
  useGetDatasetsQuery,
  useFetchSessionQuery,
  useFetchChromLenQuery,
} from "../../redux/apiSlice";
import {
  HeatMapStateType,
  initApiCalls,
  initSelectRect,
  loadConfig,
  updateDashboardUuid,
} from "../../redux/heatmap2DSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { updateAllRes, updateChromLen } from "../../redux/heatmap2DSlice";
import { fetchChromLens } from "../../utils/utils";
import Scatter2D from "../../components/Embeddings/Scatter2D";
import Spatials from "../../components/Embeddings/Spatials";
import GridLayoutCellTopbar from "../../components/GridLayoutCellTopbar";
import {
  layoutStateType,
  updateLayout,
  updateGridLayout,
} from "../../redux/layoutSlice";
import { useParams } from "react-router-dom";
interface Props {
  domElements: any[];
  className?: string;
  rowHeight?: number;
  onLayoutChange?: (layout: any, layouts: any) => void;
  cols?: any;
  breakpoints?: any;
  containerPadding?: number[];
}
interface ConfigMap {
  [key: string]: string;
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const Dashboard: React.FC<Props> = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { uuid } = useParams();
  const { data: allDataset, error: error_getDataSet } = useGetDatasetsQuery();
  const { data: session, error, isLoading } = useFetchSessionQuery(uuid ?? "");

  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const grid_layout = useAppSelector((state) => state.layout.grid);
  const components = useAppSelector((state) => state.layout.component); // the component of the grid layouts
  const dispatch = useAppDispatch();
  const gridRef = useRef();

  const [rowHeight, setRowHeight] = useState(window.innerWidth / 12);

  useEffect(() => {
    if (allDataset) {
      const dataset_name = session?.heatMapState.dataset_name;
      const key = "name";
      const d_index = allDataset.findIndex((obj) => obj[key] === dataset_name);
      if (d_index != -1) {
        dispatch(updateAllRes(allDataset[d_index].resolutions));
      }
    }
  }, [allDataset, session]);

<<<<<<< HEAD
  useEffect(() => {
    const loadConfigAndLayout = async () => {
      try {
        if (uuid != undefined && session != undefined) {
          const { heatMapState, layoutState } = session;
          console.log(heatMapState, layoutState);

          let newMapState: HeatMapStateType = {
            ...heatMapState,
            apiCalls: heatMapState.apiCalls?.length
              ? heatMapState.apiCalls
              : initApiCalls,
            selectRect: heatMapState.selectRect
              ? heatMapState.selectRect
              : initSelectRect,
          };
          let newLayout: layoutStateType = {
            ...layoutState,
          };
          dispatch(updateLayout(newLayout));
          dispatch(loadConfig(newMapState));
          dispatch(updateDashboardUuid(uuid));
        } else {
          console.error("Config file not found for UUID:", uuid);
        }
      } catch (error) {
        console.error("Error loading config:", error);
=======
  const handleResize = () => {
    // console.log("In handleResize init");
    const Resize = () => {
      if (gridRef.current) {
        const width = (gridRef.current as HTMLElement).offsetWidth;
        if (width > 1200) {
          setRowHeight(width / 12);
        } else if (width > 750) {
          setRowHeight(width / 8);
        } else if (width > 480) {
          setRowHeight(width / 4);
        } else {
          setRowHeight(width / 2);
        }
>>>>>>> fix:make grid-layout responsive to different screen size
      }
    };
    if (!isLoading && session) {
      loadConfigAndLayout();
    }
  }, [session, isLoading, dispatch]);

<<<<<<< HEAD
  const handleResize = () => {
    const Resize = () => {
=======
    setTimeout(() => {
      Resize();
    }, 100);
  }; // Re-run effect when window width changes

  useEffect(() => {
    // console.log("In handleResize", heatmap_state.selectedSidebarItem);
    if (heatmap_state.selectedSidebarItem == null) return;

    const handleResize = () => {
>>>>>>> fix:make grid-layout responsive to different screen size
      if (gridRef.current) {
        const width = (gridRef.current as HTMLElement).offsetWidth;
        if (width > 1200) {
          setRowHeight(width / 12);
<<<<<<< HEAD
        } else if (width > 750) {
=======
        } else if (width > 768) {
>>>>>>> fix:make grid-layout responsive to different screen size
          setRowHeight(width / 8);
        } else if (width > 480) {
          setRowHeight(width / 4);
        } else {
          setRowHeight(width / 2);
        }
      }
    };
    setTimeout(() => {
      Resize();
    }, 100);
  }; // Re-run effect when window width changes

  useEffect(() => {
    const getData = async () => {
      const chromLens = await fetchChromLens({
        name: session?.heatMapState.dataset_name!,
        resolution: session?.heatMapState.all_resolution.toString()!,
        cell_id: heatmap_state.apiCalls[0].id.toString(),
      });
      dispatch(updateChromLen(chromLens));
    };
    if (
      session?.heatMapState.all_resolution.length != 0 &&
      session?.heatMapState.dataset_name
    )
      getData();
  }, [session]);

<<<<<<< HEAD
=======
  const [layouts, setLayouts] = useState<{ [index: string]: any[] }>({
    lg: [
      { x: 0, y: 0, w: 3, h: 3, i: "0" },
      { x: 3, y: 0, w: 3, h: 3, i: "1" },
      { x: 0, y: 3, w: 3, h: 3, i: "2" },
      { x: 3, y: 3, w: 3, h: 3, i: "3" },
      { x: 6, y: 0, w: 6, h: 6, i: "4" },
    ],
    md: [
      { x: 0, y: 0, w: 2, h: 2, i: "0" },
      { x: 2, y: 0, w: 2, h: 2, i: "1" },
      { x: 0, y: 2, w: 2, h: 2, i: "2" },
      { x: 2, y: 2, w: 2, h: 2, i: "3" },
      { x: 4, y: 0, w: 4, h: 4, i: "4" },
    ],
    xs: [
      { x: 0, y: 0, w: 2, h: 2, i: "0" },
      { x: 2, y: 0, w: 2, h: 2, i: "1" },
      { x: 0, y: 2, w: 2, h: 2, i: "2" },
      { x: 2, y: 2, w: 2, h: 2, i: "3" },
      { x: 0, y: 4, w: 4, h: 4, i: "4" },
    ],
  });
>>>>>>> fix:make grid-layout responsive to different screen size
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("lg");
  const [compactType, setCompactType] = useState<string | null>("vertical");
  const [mounted, setMounted] = useState(false);
  const [toolbox, setToolbox] = useState<{ [index: string]: any[] }>({
    lg: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onBreakpointChange = useCallback(
    //@ts-ignore
    (breakpoint) => {
      setCurrentBreakpoint(breakpoint);
      setToolbox({
        ...toolbox,
        [breakpoint]: toolbox[breakpoint] || toolbox[currentBreakpoint] || [],
      });
    },
    [currentBreakpoint]
  );

  const onCompactTypeChange = () => {
    let oldCompactType = "";
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    setCompactType(compactType);
  };
  //@ts-ignore
  const onLayoutChange = (layout, layouts) => {
    handleResize();
<<<<<<< HEAD
    dispatch(updateGridLayout({ ...layouts }));
=======
    setLayouts({ ...layouts });
>>>>>>> fix:make grid-layout responsive to different screen size
  };
  //@ts-ignore
  const onResize = (layout, oldLayoutItem, layoutItem, placeholder) => {};

  const generateDOM = React.useMemo(() => {
    return _.map(components, function (comp, idx) {
      return (
        <Box
          sx={{
            background: colors.primary[500],
            display: "flex",
            flexDirection: "column",
          }}
          overflow="hidden"
          key={idx}
        >
          <GridLayoutCellTopbar id={idx} type={comp.type} />
          {comp.type === "cmap" ? (
            <HeatMap map_id={idx} />
          ) : comp.type === "embed" ? (
            <Scatter2D />
          ) : (
            <Spatials />
          )}
        </Box>
      );
    });
  }, [grid_layout, theme]);
  if (isLoading) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          variant="h3"
          sx={{ marginLeft: "16px" }}
          color={colors.text[200]}
          fontWeight={200}
        >
          Loading session data...
        </Typography>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          variant="h3"
          sx={{ marginLeft: "16px" }}
          color={colors.text[200]}
          fontWeight={200}
        >
          No session found for UUID: {uuid}
        </Typography>
      </Box>
    );
  }
  return (
    <Box width="100%" height="100%">
      <Box ref={gridRef} flexGrow={1} mx="10px">
        <ResponsiveReactGridLayout
          {...props}
          rowHeight={rowHeight}
          layouts={grid_layout}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          //@ts-ignore
          compactType={compactType}
          preventCollision={!compactType}
          onLayoutChange={onLayoutChange}
          onBreakpointChange={onBreakpointChange}
          onCompactTypeChange={onCompactTypeChange}
          onResize={onResize}
          // onDrop={onDrop}
          isBounded={true}
          isDroppable
          draggableHandle=".dragHandle"
        >
          {generateDOM}
        </ResponsiveReactGridLayout>
      </Box>
    </Box>
  );
};
Dashboard.defaultProps = {
  className: "layout",
  onLayoutChange: (layout: any, layouts: any) => {},
  cols: { lg: 12, md: 8, sm: 8, xs: 4, xxs: 2 },
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  containerPadding: [0, 0],
};

export default Dashboard;
