import { useRef, useState, useEffect } from "react";
import { Typography, Paper } from "@material-ui/core";
import * as PIXI from "pixi.js";
import * as d3 from "d3";
import Clampy from "../assets/clampy.png";

interface HeatMapProps {
  data: number[][];
  psize: number;
  app_size: number;
}
const HeatMap: React.FC<HeatMapProps> = ({ data, psize, app_size }) => {
  const [color, setColor] = useState(0xff0000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [container, setContainer] = useState<PIXI.Container>(
    new PIXI.Container()
  );
  const [text, setText] = useState<string>("scaled value: ");
  const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]); //interpolateViridis, interpolateReds

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const map = new PIXI.Application({
      view: canvasRef.current,
      width: app_size,
      height: app_size,
      backgroundColor: 0xffffff,
    });

    map.stage.addChild(container);
    container.removeChildren();
  }, []);

  useEffect(() => {
    container.removeChildren();
    let xsize = 0;
    let ysize = 0;
    if (data[0]) {
      xsize = Math.min(data.length, Math.floor(app_size / psize));
      ysize = Math.min(data[0].length, Math.floor(app_size / psize));
    }

    for (let i = 0; i < xsize; i++) {
      for (let j = 0; j < ysize; j++) {
        if (data[i][j]) {
          const point = new PIXI.Graphics();

          let color = d3.color(colorScale(data[i][j]))!.formatHex();

          point.beginFill(PIXI.utils.string2hex(color));
          point.drawRect(i * psize, j * psize, psize, psize);
          point.endFill();
          point.name = data[i][j].toString();
          point.interactive = true;
          createValueText(point);

          container.addChild(point);
        }
      }
    }
  }, [data, color, psize]);

  function createValueText(rectangle: PIXI.Graphics) {
    rectangle.interactive = true;
    // create a text object to display the value

    rectangle.on("mouseover", () => {
      setText("scaled value: " + rectangle.name.substr(0, 5));
    });

    rectangle.on("mouseout", () => {
      setText("scaled value: ");
    });
  }

  return (
    <div>
      <canvas
        style={{
          padding: "2px",
          border: "1px solid rgba(0, 0, 0, 0.2)",
        }}
        ref={canvasRef}
      />
      <Paper
        style={{
          padding: 8,
          width: "30%",
        }}
      >
        <Typography variant="h6">{text}</Typography>
      </Paper>
    </div>
  );
};

export default HeatMap;
