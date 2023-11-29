import { Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import DataPage from "./scenes/datasets";
import Home from "./scenes/home";

function App() {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Box position="fixed" top={0} width="100%" zIndex={10}>
            <Topbar />
          </Box>
          <Box className="content" marginTop="60px">
            <Routes>
              {/* @ts-ignore */}
              <Route path="/" element={<Home />} />
              <Route
                path="/dashboard"
                element={
                  <>
                    <Sidebar />
                    {/* @ts-ignore */}
                    <Dashboard />
                  </>
                }
              />
              <Route path="/datasets" element={<DataPage />} />
              {/* <Route path="/heatmaps" element={<Heapmaps />} /> */}
              {/* <Route path="/embed" element={<Embeds />} /> */}
            </Routes>
          </Box>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
