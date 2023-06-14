import { Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Datasets from "./scenes/datasets";
import Embeds from "./scenes/Embeds";
function App() {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Topbar />
          <main className="content">
            <Sidebar />
            <Routes>
              {/* @ts-ignore */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/datasets" element={<Datasets />} />
              {/* <Route path="/heatmaps" element={<Heapmaps />} /> */}
              <Route path="/embed" element={<Embeds />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

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
