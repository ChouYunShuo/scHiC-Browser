import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updateMapSelectCells } from "../redux/heatmap2DSlice";
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  useTheme,
  InputLabel,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/system";
import shouldForwardProp from "@styled-system/should-forward-prop";
import { tokens } from "../theme";
const CenteredBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
});

const InnerBox = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "calc(min(60%, 40vw))", // Set to desired width
  height: "calc(min(40%, 30vh))", // Set to desired height
  backgroundColor: tokens(theme.palette.mode).primary[400],
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
}));

const TitleContainer = styled(Box)({
  marginTop: 2,
});
const CellCntContainer = styled(Box)({});
interface ButtonContainerProps {
  isMd: boolean;
}
const ButtonContainer = styled(Box, {
  shouldForwardProp,
})<ButtonContainerProps>(({ theme, isMd }) => ({
  display: isMd ? "initial" : "flex",
  ...(isMd && {
    position: "absolute",
    right: "2%",
    bottom: "5%",
  }),
}));

type UmapPopUpProps = {
  isVisible: boolean;
  handleVisToggle: () => void;
  handleMapToggle: (selectedMap: number) => void;
  selectedUmapCells: string[];
  pWidth: number;
};

const UmapPopUp: React.FC<UmapPopUpProps> = ({
  isVisible,
  handleVisToggle,
  handleMapToggle,
  selectedUmapCells,
  pWidth,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedMap, setSelectedMap] = useState("");
  const dispatch = useAppDispatch();
  const isMd = pWidth > theme.breakpoints.values.md;
  const isSm = pWidth > theme.breakpoints.values.sm;

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedMap(event.target.value as string);
  };

  const handleConfirm = () => {
    dispatch(
      updateMapSelectCells({
        id: parseInt(selectedMap),
        selectedCells: selectedUmapCells,
      })
    );
    handleMapToggle(parseInt(selectedMap) + 1);
    handleVisToggle();
  };

  return (
    <>
      {isVisible && (
        <CenteredBox>
          <InnerBox>
            <TitleContainer>
              <Typography
                variant={isSm ? "h3" : "body1"}
                color={colors.grey[100]}
                fontWeight="bold"
                sx={{ m: "0 0 5px 0" }}
              >
                Select Map to visualize cells
              </Typography>
            </TitleContainer>
            <FormControl
              sx={{
                width: "40%",
                margin: "auto 0",
              }}
            >
              <InputLabel id="demo-simple-select-label">Select Map</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                value={selectedMap}
                onChange={handleSelectChange}
                label="Select Map"
              >
                <MenuItem value={0}>Contact Map 1</MenuItem>
                <MenuItem value={1}>Contact Map 2</MenuItem>
                <MenuItem value={2}>Contact Map 3</MenuItem>
                <MenuItem value={3}>Contact Map 4</MenuItem>
              </Select>
            </FormControl>
            <CellCntContainer>
              <Typography
                variant="body1"
                color={colors.grey[200]}
                sx={{ m: "0 0 5px 0" }}
              >
                You selected {selectedUmapCells.length} cells
              </Typography>
            </CellCntContainer>
            <ButtonContainer isMd={isMd}>
              <Button
                variant="outlined"
                color="error"
                style={{ marginRight: "10px" }}
                onClick={handleVisToggle}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </ButtonContainer>
          </InnerBox>
        </CenteredBox>
      )}
    </>
  );
};

export default UmapPopUp;
