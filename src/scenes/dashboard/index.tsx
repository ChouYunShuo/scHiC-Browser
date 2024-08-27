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
      const dataset_name = heatmap_state.dataset_name;
      const key = "name";
      const d_index = allDataset.findIndex((obj) => obj[key] === dataset_name);
      if (d_index != -1) {
        dispatch(updateAllRes(allDataset[d_index].resolutions));
      }
    }
  }, [allDataset]);

  useEffect(() => {
    const loadConfigAndLayout = async () => {
      try {
        if (uuid != undefined && session != undefined) {
          const { heatMapState, layoutState } = session;
          console.log(heatMapState, layoutState);

          let newMapState: HeatMapStateType = {
            ...heatMapState,
            all_resolution: [],
            chrom_lengths: [],
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
      }
    };
    if (!isLoading && session) {
      loadConfigAndLayout();
    }
  }, [session, isLoading, dispatch]);

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
      }
    };
    setTimeout(() => {
      Resize();
    }, 100);
  }; // Re-run effect when window width changes

  useEffect(() => {
    const getData = async () => {
      const chromLens = await fetchChromLens({
        name: heatmap_state.dataset_name,
        resolution: heatmap_state.all_resolution[0].toString(),
        cell_id: heatmap_state.apiCalls[0].id.toString(),
      });
      dispatch(updateChromLen(chromLens));
    };

    if (heatmap_state.all_resolution.length != 0) getData();
  }, [heatmap_state.all_resolution, heatmap_state.dataset_name]);

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
    dispatch(updateGridLayout({ ...layouts }));
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
