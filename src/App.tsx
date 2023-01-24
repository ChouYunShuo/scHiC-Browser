import { useEffect, useState } from "react";
import Axios from "axios";
import { TextField, Button, Grid } from "@material-ui/core";
import HeatMap from "./components/ContactMap2D";
type queryType = {
  chrom1: string;
  chrom2: string;
  dataset_name: string;
  resolution: string;
  cell_id: string;
};

function App() {
  const [simpleQuery, setSimpleQuery] = useState<queryType>({
    chrom1: "",
    chrom2: "",
    dataset_name: "scHiC5",
    resolution: "50000",
    cell_id: "0",
  });
  const [matrixData, setmatrixData] = useState<number[][]>([]);

  const [imgString, setImgString] = useState<string>();

  const fetchContactMap = () => {
    Axios.post("http://127.0.0.1:8000/api/query", simpleQuery).then((res) => {
      const array2D = JSON.parse(res.data);
      setmatrixData(array2D);
      console.log(array2D);
    });
  };

  const fetchAllDataset = () => {
    Axios.get("http://127.0.0.1:8000/api/datasets").then((res) => {
      console.log(res.data);
    });
  };

  useEffect(() => {
    fetchAllDataset();
  }, []);

  return (
    <div>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <TextField
            id="standard-basic"
            label="Chrom1"
            variant="standard"
            onChange={(e) =>
              setSimpleQuery({ ...simpleQuery, chrom1: e.target.value })
            }
          />
        </Grid>
        <Grid item>
          <TextField
            id="standard-basic"
            label="Chrom2"
            variant="standard"
            onChange={(e) =>
              setSimpleQuery({ ...simpleQuery, chrom2: e.target.value })
            }
          />
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => fetchContactMap()}
            style={{ position: "relative", top: "10px" }}
          >
            Send
          </Button>
        </Grid>
        <Grid container justifyContent="center">
          <Grid item>
            {" "}
            <HeatMap data={matrixData} psize={2} app_size={600}></HeatMap>{" "}
          </Grid>
        </Grid>
      </Grid>
    </div>
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
