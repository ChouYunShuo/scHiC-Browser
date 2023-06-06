import { Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Datasets from "./scenes/datasets";
import Heapmaps from "./scenes/Heatmaps";
import Embeds from "./scenes/Embeds";
function App() {
  const [theme, colorMode] = useMode();
  //const [isSidebar, setIsSidebar] = useState<boolean>(true);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Topbar />

          <main className="content">
            <Sidebar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datasets" element={<Datasets />} />
              <Route path="/heatmaps" element={<Heapmaps />} />
              <Route path="/embed" element={<Embeds />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
/*
function App() {
  const dispatch = useAppDispatch();
  const heatmap_state = useAppSelector((state) => state.heatmap2D);
  const map_cnts = heatmap_state.map_cnts;
  const [skipChromLenFetch, setskipChromLenFetch] = useState(true);

  const fetchContactMap = async (new_chrom1: string, new_chrom2: string) => {
    const new_res = getResFromRange(new_chrom1, new_chrom1);
    console.log(new_chrom1, new_chrom1, new_res);
    if (new_res) dispatch(updateResolution(new_res.toString()));
    for (let i = 0; i < map_cnts; i++)
      dispatch(
        updateApiCalls({
          call: true,
          id: i,
        })
      );
    console.log("fetched!");
  };

  const zoomIn = () => {
    const new_chrom1 = getNewChromZoomIn(
      validateChrom(heatmap_state.chrom1),
      2
    );
    const new_chrom2 = getNewChromZoomIn(
      validateChrom(heatmap_state.chrom2),
      2
    );
    if (new_chrom1 && new_chrom2) {
      dispatch(updateChrom1(new_chrom1));
      dispatch(updateChrom2(new_chrom2));
      fetchContactMap(new_chrom1, new_chrom2);
    }
  };
  const zoomOut = () => {
    const new_chrom1 = getNewChromZoomOut(
      validateChrom(heatmap_state.chrom1),
      2
    );
    const new_chrom2 = getNewChromZoomOut(
      validateChrom(heatmap_state.chrom2),
      2
    );
    console.log(new_chrom1);
    if (new_chrom1 && new_chrom2) {
      dispatch(updateChrom1(new_chrom1));
      dispatch(updateChrom2(new_chrom2));
      fetchContactMap(new_chrom1, new_chrom2);
    }
  };

  const { data: allDataset, error: error_getDataSet } = useGetDatasetsQuery();

  useEffect(() => {
    const getData = async () => {
      const chromLens = await fetchChromLens({
        name: heatmap_state.dataset_name,
        resolution: heatmap_state.all_resolution[0].toString(),
        cell_id: heatmap_state.apiCalls[0].id.toString(),
      });
      //console.log(chromLens);
      dispatch(updateChromLen(chromLens));
    };

    if (heatmap_state.all_resolution.length != 0) getData();
  }, [heatmap_state.all_resolution, heatmap_state.dataset_name]);

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

  //console.log(allDataset);

  return (
    <div>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <TextField
            id="standard-basic"
            label="Chrom1"
            variant="standard"
            value={heatmap_state.chrom1}
            onChange={(e) => dispatch(updateChrom1(e.target.value))}
          />
        </Grid>
        <Grid item>
          <TextField
            id="standard-basic"
            label="Chrom2"
            variant="standard"
            value={heatmap_state.chrom2}
            onChange={(e) => dispatch(updateChrom2(e.target.value))}
          />
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              fetchContactMap(heatmap_state.chrom1, heatmap_state.chrom2)
            }
            style={{ position: "relative", top: "10px" }}
          >
            Send
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => zoomOut()}
            style={{
              position: "relative",
              top: "10px",
              minWidth: "36px",
              minHeight: "36px",
            }}
          >
            -
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => zoomIn()}
            style={{
              position: "relative",
              top: "10px",
              minWidth: "36px",
              minHeight: "36px",
            }}
          >
            +
          </Button>
        </Grid>
        <Grid container justifyContent="center">
          <Grid>
            <HeatMap map_id={0}></HeatMap>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
*/
export default App;

//{
//"file_path": "data/scHiC.h5",
//"grp_path": "resolutions/100000/cells/cell_id0",
//"range1": "chrom2:0-40000000",
//"range2": "chrom2:0-40000000"
//}
/*
{
"chrom1": "chrom2:0-40000000",
"chrom2": "chrom2:0-40000000"
}*/
