import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import {
  Box,
  IconButton,
  useTheme,
  Typography,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import { ColorModeContext, tokens } from "../../theme";
import logoDark from "../../assets/scViz_logo.png";
import logoLight from "../../assets/scViz_logo_light.png";
import { selectDashboardUuid } from "../../redux/heatmap2DSlice";
import { useUploadSessionMutation } from "../../redux/apiSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { v4 as uuidv4 } from "uuid";

const TopBarTypography = styled(Typography)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    color: tokens(theme.palette.mode).text[100], // choose a lighter color on hover
    cursor: "pointer",
  },
}));

type ItemType = "Dashboard" | "Datasets" | "Documentation" | "Session" | "";
interface ItemProps {
  title: ItemType;
  to: string;
  selected: string;
  handleSelect: (title: ItemType) => void;
}

const UnderLine: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "2px",
        bgcolor: colors.text[100],
        zIndex: 100,
      }}
    ></Box>
  );
};

const Item: React.FC<ItemProps> = ({ title, to, selected, handleSelect }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Link
      to={to}
      onClick={() => handleSelect(title)}
      style={{
        textDecoration: "none",
        position: "relative",
      }}
    >
      <TopBarTypography
        variant="h5"
        color={
          selected.toLowerCase() === title.toLowerCase()
            ? colors.text[100]
            : colors.text[200]
        }
      >
        {title}
      </TopBarTypography>

      {selected.toLowerCase() === title.toLowerCase() && <UnderLine />}
    </Link>
  );
};

const validateHeatMapState = (heatMapState: any): boolean => {
  return (
    typeof heatMapState.dataset_name === "string" &&
    Array.isArray(heatMapState.apiCalls) &&
    typeof heatMapState.app_size === "number" &&
    typeof heatMapState.contact_map_size === "number" &&
    typeof heatMapState.pix_size === "number" &&
    typeof heatMapState.map_cnts === "number" &&
    typeof heatMapState.track_type === "string"
  );
};

const validateLayoutState = (layoutState: any): boolean => {
  return (
    Array.isArray(layoutState.grid?.lg) && Array.isArray(layoutState.component)
  );
};

const validateConfigStructure = (parsedConfig: any): boolean => {
  return (
    parsedConfig.hasOwnProperty("heatMapState") &&
    parsedConfig.hasOwnProperty("layoutState") &&
    validateHeatMapState(parsedConfig.heatMapState) &&
    validateLayoutState(parsedConfig.layoutState)
  );
};

const Topbar: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const location = useLocation();
  const [selected, setSelected] = useState<ItemType>("");
  const dashboardId = useAppSelector(selectDashboardUuid);
  const heatMapState = useAppSelector((state) => state.heatmap2D); // Get current heatmap2D state
  const layoutState = useAppSelector((state) => state.layout); // Get current layout state
  const navigate = useNavigate();
  const [uploadSession] = useUploadSessionMutation();
  const [sessionName, setSessionName] = useState("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    let currentPath = window.location.pathname.split("/")[1]; // Remove the initial '/'
    if (currentPath == "doc") {
      currentPath = "Documentation";
    }
    setSelected(currentPath as ItemType);
  }, [location]);

  const handleSelect = (title: ItemType) => {
    setSelected(title);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleSave = async () => {
    const fileName = prompt(
      "Enter the file name for saving the session (without extension):",
      `session_${heatMapState.uuid}`
    );

    if (!fileName) {
      console.error("No file name provided. Save operation canceled.");
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ heatMapState, layoutState }, null, 2)],
      {
        type: "application/json",
      }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`; // Use the user-provided file name
    a.click();
    URL.revokeObjectURL(url); // Clean up the object URL
    handleMenuClose();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      // Check if the file extension is 'json'
      if (fileExtension !== "json") {
        console.error("Uploaded file is not a JSON file");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const parsedConfig = JSON.parse(content);
          if (validateConfigStructure(parsedConfig)) {
            console.log("Valid configuration file:", parsedConfig);
            console.log("Uploaded file name:", fileName);
            // Prepare data to be sent to the server
            const requestData = {
              config: parsedConfig,
              file_name: fileName,
            };
            try {
              const response = await uploadSession(requestData).unwrap();
              const newUuid = response.session_uuid;
              console.log("New session UUID:", newUuid);
              //redirect to the new session or update state
              try {
                navigate(`/dashboard/${newUuid}`);
              } catch (error) {
                console.error("Failed to navigate to new session:", error);
              }
            } catch (error) {
              console.error("Failed to upload session:", error);
            }
          } else {
            console.error("Invalid configuration structure");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
    handleMenuClose();
  };

  const handleShare = () => {
    const state = useAppSelector((state) => state.heatmap2D); // Get current redux state
    const sessionId = uuidv4();
    const configFileName = `session_${sessionId}.json`;

    // Assume a function to save the file locally or to a backend.
    // saveConfigFileLocallyOrBackend(configFileName, state);

    const url = `${window.location.origin}/dashboard/${sessionId}`;
    navigator.clipboard.writeText(url); // Copy the URL to clipboard
    alert(`Session URL copied to clipboard!`);
    handleMenuClose();
  };

  return (
    <Box
      height="60px"
      display="flex"
      bgcolor={colors.primary[500]}
      p={1}
      sx={{ borderBottom: 2, borderColor: colors.border[100] }}
    >
      <Box width="30%" display="flex" alignItems="center" ml={1}>
        <img
          src={theme.palette.mode === "dark" ? logoDark : logoLight}
          alt="Logo"
          style={{ height: "2em", marginRight: "1em" }}
        />
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              position: "relative",
            }}
            onClick={() => handleSelect("")}
          >
            <Typography
              variant="h4"
              marginRight={2}
              color={colors.text[100]}
              fontWeight={600}
            >
              CellScope
            </Typography>
          </Link>

          <Item
            title="Dashboard"
            to={`/dashboard/${dashboardId}`}
            selected={selected}
            handleSelect={handleSelect}
          ></Item>
          <Item
            title="Datasets"
            to="/datasets"
            selected={selected}
            handleSelect={handleSelect}
          ></Item>
          <Item
            title="Documentation"
            to="/doc"
            selected={selected}
            handleSelect={handleSelect}
          ></Item>
          <Button
            sx={{
              padding: 0,
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
            onClick={handleMenuOpen}
          >
            <TopBarTypography
              variant="h5"
              color={
                selected.toLowerCase() === "session"
                  ? colors.text[100]
                  : colors.text[200]
              }
            >
              Session
            </TopBarTypography>
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={handleSave}>Save</MenuItem>
            <MenuItem>
              <input
                type="file"
                accept="application/json"
                onChange={handleUpload}
                style={{ display: "none" }}
                id="upload-config"
              />
              <label htmlFor="upload-config" style={{ cursor: "pointer" }}>
                Upload
              </label>
            </MenuItem>
            <MenuItem onClick={handleShare}>Share</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* ICONS */}
      <Box display="flex" justifyContent="flex-end" flexGrow={1}>
        <IconButton
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: colors.border[100],
            },
          }}
          onClick={colorMode.toggleColorMode}
        >
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: colors.border[100],
            },
          }}
        >
          <GitHubIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
