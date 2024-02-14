import * as PIXI from "pixi.js";
import { scaleLinear, scaleLog } from "d3-scale";
import { min, max } from "d3";
import { useFetchTrackDataQuery } from "../../redux/apiSlice";

type PointType = {
  x: number;
  y: number;
};
function normalizeArray(data: number[]): number[] {
  const scale = scaleLinear()
    .domain([min(data)!, max(data)!])
    .range([0, 1]);

  return data.map((d) => scale(d));
}

const z_tranArray = (data: number[]): number[] => {
  const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
  const standardDeviation = Math.sqrt(
    data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length
  );

  return data.map((d) => (d - mean) / standardDeviation);
};
export const drawVerticalABTrack = (
  data: number[],
  app_size: number,
  tramsform_xy: number,
  container: PIXI.Container,
  posColor: string,
  negColor: string
) => {
  const arr = z_tranArray(data);
  const yScale = scaleLinear().domain([0, arr.length]).range([0, app_size]);
  const xScale = scaleLinear()
    .domain([min(arr)!, max(arr)!])
    .range([-tramsform_xy / 3, tramsform_xy / 3]);

  const points = arr.map((d, i) => ({
    x: xScale(d),
    y: yScale(i),
  }));

  let currentGraphics = new PIXI.Graphics();
  let lastSign = points[0].x > 0;
  let curColor = parseInt(
    lastSign === false ? posColor.slice(1) : negColor.slice(1),
    16
  );
  currentGraphics.beginFill(curColor, 0.6);

  let start_pt = points[0];
  let last_pt = points[0];
  points.forEach((point, index) => {
    const currentSign = point.x > 0;

    if (currentSign !== lastSign) {
      // Close the current path
      closeVPath(currentGraphics, start_pt, last_pt);
      container.addChild(currentGraphics as PIXI.DisplayObject);

      // Start a new graphics path
      currentGraphics = new PIXI.Graphics();
      let curColor = parseInt(
        lastSign === true ? posColor.slice(1) : negColor.slice(1),
        16
      );
      currentGraphics.beginFill(curColor, 0.6);

      currentGraphics.moveTo(point.x, point.y);
      lastSign = currentSign;
      start_pt = point;
    } else {
      currentGraphics.lineTo(point.x, point.y);
      last_pt = point;
    }
  });

  //Close the last path if needed
  closeVPath(currentGraphics, start_pt, last_pt);
  container.addChild(currentGraphics as PIXI.DisplayObject);
};
export const drawHorizontalABTrack = (
  data: number[],
  app_size: number,
  tramsform_xy: number,
  container: PIXI.Container,
  posColor: string,
  negColor: string
) => {
  const arr = z_tranArray(data);
  const xScale = scaleLinear().domain([0, arr.length]).range([0, app_size]);
  const yScale = scaleLinear()
    .domain([min(arr)!, max(arr)!])
    .range([-tramsform_xy / 3, tramsform_xy / 3]);

  const points = arr.map((d, i) => ({
    x: xScale(i),
    y: yScale(d),
  }));

  let currentGraphics = new PIXI.Graphics();
  let lastSign = points[0].y >= 0;
  let curColor = parseInt(
    lastSign === false ? posColor.slice(1) : negColor.slice(1),
    16
  );
  currentGraphics.beginFill(curColor, 0.6);

  let start_pt = points[0];
  let last_pt = points[0];

  points.forEach((point, index) => {
    const currentSign = point.y >= 0;

    if (currentSign !== lastSign) {
      // Close the current path
      closeHPath(currentGraphics, start_pt, last_pt);
      container.addChild(currentGraphics as PIXI.DisplayObject);

      // Start a new graphics path
      currentGraphics = new PIXI.Graphics();
      let curColor = parseInt(
        lastSign === true ? posColor.slice(1) : negColor.slice(1),
        16
      );
      currentGraphics.beginFill(curColor, 0.6);

      currentGraphics.moveTo(point.x, point.y);
      lastSign = currentSign;
      start_pt = point;
    } else {
      currentGraphics.lineTo(point.x, point.y);
      last_pt = point;
    }
  });

  //Close the last path if needed
  closeHPath(currentGraphics, start_pt, last_pt);
  container.addChild(currentGraphics as PIXI.DisplayObject);
};

function closeVPath(graphics: PIXI.Graphics, sp: PointType, ep: PointType) {
  graphics.lineTo(0, ep.y);
  graphics.lineTo(0, sp.y);
  graphics.closePath();
  graphics.endFill();
  graphics.position.set(475, 50);
}

function closeHPath(graphics: PIXI.Graphics, sp: PointType, ep: PointType) {
  graphics.lineTo(ep.x, 0);
  graphics.lineTo(sp.x, 0);
  graphics.closePath();
  graphics.endFill();
  graphics.position.set(50, 475);
}

export const drawVerticalTrack = (
  data: number[],
  app_size: number,
  tramsform_xy: number,
  container: PIXI.Container,
  textColor: string
) => {
  // 1. Normalize & Scale Data:
  // Create y scale
  //const arr = z_tranArray(data);
  const arr = normalizeArray(data);
  const yScale = scaleLinear().domain([0, arr.length]).range([0, app_size]);

  // Create x scale
  const xScale = scaleLinear()
    .domain([0, 1])
    .range([tramsform_xy / 2, 0]); // reverse as y is from top to bottom in canvas

  // Map data points to scaled values
  const points = arr.map((d, i) => ({
    x: xScale(d),
    y: yScale(i),
  }));
  //console.log(points)
  // 2. Draw with PIXI:
  const graphics = new PIXI.Graphics();

  //graphics.lineStyle(1, parseInt(textColor.slice(1), 16));
  graphics.beginFill(parseInt(textColor.slice(1), 16), 0.6); // semi-transparent white fill

  graphics.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.lineTo(tramsform_xy / 2, points[points.length - 1].y);
  graphics.lineTo(tramsform_xy / 2, points[0].y);
  graphics.closePath();

  // Apply fill to the shape
  graphics.endFill();
  graphics.position.set(460, 50);
  container.addChild(graphics as PIXI.DisplayObject);
};
export const drawHorizontalTrack = (
  data: number[],
  app_size: number,
  tramsform_xy: number,
  container: PIXI.Container,
  textColor: string
) => {
  // 1. Normalize & Scale Data:
  // Create x scale
  const arr = normalizeArray(data);
  const xScale = scaleLinear().domain([0, arr.length]).range([0, app_size]);
  // Create y scale
  const yScale = scaleLinear()
    .domain([0, 1])
    .range([tramsform_xy / 2, 0]); // reverse as y is from top to bottom in canvas

  // Map data points to scaled values
  const points = arr.map((d, i) => ({
    x: xScale(i),
    y: yScale(d),
  }));
  // 2. Draw with PIXI:
  const graphics = new PIXI.Graphics();

  //graphics.lineStyle(1, parseInt(textColor.slice(1), 16));
  graphics.beginFill(parseInt(textColor.slice(1), 16), 0.6); // semi-transparent white fill

  // Start the line and shape
  graphics.moveTo(points[0].x, points[0].y);

  // Draw the line
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }

  // Close the shape by drawing a line back to the start along the bottom
  graphics.lineTo(points[points.length - 1].x, tramsform_xy / 2);
  graphics.lineTo(points[0].x, tramsform_xy / 2);
  graphics.closePath();

  // Apply fill to the shape
  graphics.endFill();
  graphics.position.set(50, 460);

  container.addChild(graphics as PIXI.DisplayObject);
};

export const drawHorizontalScale = (
  container: PIXI.Container,
  textColor: string
) => {
  const testConfig = {
    fontFamily: "Arial",
    fontSize: 10,
    fill: textColor,
  };
  const text = new PIXI.Text("1", testConfig);
  text.x = 465;
  text.y = 455;
  const text1 = new PIXI.Text("0", testConfig);
  text1.x = 465;
  text1.y = 480;

  const start_x = 460;
  const start_y = 460;
  const line_len = 4;

  const line = new PIXI.Graphics();
  line.lineStyle(1, parseInt(textColor.slice(1), 16));
  line.moveTo(start_x, start_y);
  line.lineTo(start_x, start_y + 6 * line_len + 1);

  const line1 = new PIXI.Graphics();
  line1.lineStyle(1, parseInt(textColor.slice(1), 16));
  line1.moveTo(start_x, start_y);
  line1.lineTo(start_x + line_len, start_y);

  const line2 = new PIXI.Graphics();
  line1.lineStyle(1, parseInt(textColor.slice(1), 16));
  line1.moveTo(start_x, start_y + 6 * line_len);
  line1.lineTo(start_x + line_len, start_y + 6 * line_len);

  container.addChild(text as PIXI.DisplayObject);
  container.addChild(text1 as PIXI.DisplayObject);
  container.addChild(line as PIXI.DisplayObject);
  container.addChild(line1 as PIXI.DisplayObject);
  container.addChild(line2 as PIXI.DisplayObject);
};

// Functions for generating fake data when testing

// const generateRandomNumber = (min: number, max: number) => {
//   return Math.floor(Math.random() * (max - min + 1) + min);
// };

// const normalizeAndMapPoints = (
//   data: PointType[],
//   minXRect: number,
//   maxXRect: number,
//   minYRect: number,
//   maxYRect: number
// ): PointType[] => {
//   const xScale = scaleLinear().domain([0, 500]).range([minXRect, maxXRect]);
//   const yScale = scaleLinear().domain([0, 500]).range([minYRect, maxYRect]);

//   return data.map((point) => ({
//     x: xScale(point.x),
//     y: yScale(point.y),
//   }));
// };

// const generateYData = (numPoints: number): PointType[] => {
//   let previousX = generateRandomNumber(0, 500);
//   return Array.from({ length: numPoints })
//     .map(() => {
//       const y = generateRandomNumber(0, 500);
//       const x = previousX + generateRandomNumber(-20, 20); // Introducing a change (could be positive or negative) from the previous y-value.
//       previousX = y;
//       return { x, y };
//     })
//     .sort((a, b) => a.y - b.y); // Sort by x values to make it look like a line plot.
// };
// const generateXData = (numPoints: number): PointType[] => {
//   let previousX = generateRandomNumber(0, 500);
//   return Array.from({ length: numPoints })
//     .map(() => {
//       const y = generateRandomNumber(0, 500);
//       const x = previousX + generateRandomNumber(-20, 20); // Introducing a change (could be positive or negative) from the previous y-value.
//       previousX = y;
//       return { x, y };
//     })
//     .sort((a, b) => a.x - b.x); // Sort by x values to make it look like a line plot.
//};
