import React, { useEffect, useState, useRef, useCallback } from "react";

import { Box, useTheme } from "@mui/material";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { tokens } from "../../theme";
import HeatMap from "../../components/ContactMap2D";
import { useGetDatasetsQuery } from "../../redux/apiSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { updateAllRes, updateChromLen } from "../../redux/heatmap2DSlice";
import { fetchChromLens } from "../../utils/utils";
import Embeds from "../../components/Embeddings";
import Spatials from "../../components/Spatials";
import GridLayoutCellTopbar from "../../components/GridLayoutCellTopbar";

interface Props {
  domElements: any[];
  className?: string;
  rowHeight?: number;
  onLayoutChange?: (layout: any, layouts: any) => void;
  cols?: any;
  breakpoints?: any;
  containerPadding?: number[];
}
const ResponsiveReactGridLayout = WidthProvider(Responsive);

const Dashboard: React.FC<Props> = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data: allDataset, error: error_getDataSet } = useGetDatasetsQuery();

  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const dispatch = useAppDispatch();
  const gridRef = useRef();

  const [rowHeight, setRowHeight] = useState(window.innerWidth / 12);
  // console.log("In Dashboard", rowHeight);

  useEffect(() => {
    //console.log("In allDataset");
    if (allDataset) {
      const dataset_name = heatmap_state.dataset_name;
      const key = "name";
      const d_index = allDataset.findIndex((obj) => obj[key] === dataset_name);
      if (d_index != -1) {
        dispatch(updateAllRes(allDataset[d_index].resolutions));
      }
    }
  }, [allDataset]);

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
    // console.log("In handleResize", heatmap_state.selectedSidebarItem);
    if (heatmap_state.selectedSidebarItem == null) return;

    const handleResize = () => {
      if (gridRef.current) {
        const width = (gridRef.current as HTMLElement).offsetWidth;
        if (width > 1200) {
          setRowHeight(width / 12);
        } else if (width > 768) {
          setRowHeight(width / 8);
        } else if (width > 480) {
          setRowHeight(width / 4);
        } else {
          setRowHeight(width / 2);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      // console.log("In dispatchEvent");
    }, 100);
    return () => window.removeEventListener("resize", handleResize);
  }, [heatmap_state.selectedSidebarItem]); // Re-run effect when window width changes

  useEffect(() => {
    // console.log("In getData");
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

  const [layouts, setLayouts] = useState<{ [index: string]: any[] }>({
    lg: [
      { x: 0, y: 0, w: 3, h: 3, i: "0" },
      { x: 3, y: 0, w: 3, h: 3, i: "1" },
      { x: 0, y: 3, w: 3, h: 3, i: "2" },
      { x: 3, y: 3, w: 3, h: 3, i: "3" },
      { x: 6, y: 0, w: 6, h: 3, i: "4" },
      { x: 6, y: 3, w: 6, h: 3, i: "5" },
    ],
    md: [
      { x: 0, y: 0, w: 2, h: 2, i: "0" },
      { x: 2, y: 0, w: 2, h: 2, i: "1" },
      { x: 0, y: 2, w: 2, h: 2, i: "2" },
      { x: 2, y: 2, w: 2, h: 2, i: "3" },
      { x: 4, y: 0, w: 4, h: 2, i: "4" },
      { x: 4, y: 2, w: 4, h: 2, i: "5" },
    ],
    xs: [
      { x: 0, y: 0, w: 2, h: 2, i: "0" },
      { x: 2, y: 0, w: 2, h: 2, i: "1" },
      { x: 0, y: 2, w: 2, h: 2, i: "2" },
      { x: 2, y: 2, w: 2, h: 2, i: "3" },
      { x: 0, y: 4, w: 4, h: 4, i: "4" },
      { x: 0, y: 8, w: 4, h: 4, i: "5" },
    ],
  });
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("lg");
  const [compactType, setCompactType] = useState<string | null>("vertical");
  const [mounted, setMounted] = useState(false);
  const [toolbox, setToolbox] = useState<{ [index: string]: any[] }>({
    lg: [],
  });

  useEffect(() => {
    // console.log("In setMounted");
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
    [currentBreakpoint, toolbox]
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
    setLayouts({ ...layouts });
  };
  //@ts-ignore
  const onResize = (layout, oldLayoutItem, layoutItem, placeholder) => {
    if (parseInt(layoutItem.i) < 4) {
      const maxDimension = Math.max(layoutItem.w, layoutItem.h);
      layoutItem.w = maxDimension;
      layoutItem.h = maxDimension;
      placeholder.w = maxDimension;
      placeholder.h = maxDimension;
    }
  };
  const onDrop = (layout: any, layoutItem: any, _ev: any) => {
    alert(
      `Element parameters:\n${JSON.stringify(
        layoutItem,
        ["x", "y", "w", "h"],
        2
      )}`
    );
  };

  const generateDOM = React.useMemo(() => {
    // console.log("in generateDOM");
    return _.map(layouts.lg, function (l, i) {
      return (
        <Box
          sx={{
            background: colors.primary[500],
            display: "flex",
            flexDirection: "column",
          }}
          overflow="hidden"
          key={i}
        >
          <GridLayoutCellTopbar
            id={i}
            type={i === 4 ? "scatter" : i === 5 ? "spatial" : "cmap"}
          />

          {i === 4 ? (
            <Embeds />
          ) : i === 5 ? (
            <Spatials />
          ) : (
            <HeatMap map_id={i} />
          )}
        </Box>
      );
    });
  }, [layouts, theme]);
  return (
    <Box width="100%" height="100%">
      <Box ref={gridRef} flexGrow={1} m="20px">
        <ResponsiveReactGridLayout
          {...props}
          rowHeight={rowHeight}
          //style={{ background: "#f0f0f0" }}
          layouts={layouts}
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
