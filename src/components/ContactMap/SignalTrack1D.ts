import * as PIXI from "pixi.js";
import { scaleLinear } from "d3-scale";
import { useFetchTrackDataQuery } from "../../redux/apiSlice";

type PointType = {
  x: number;
  y: number;
};

export const drawVerticalTrack = (
  data: number[],
  app_size: number,
  tramsform_xy: number,
  container: PIXI.Container,
  colorMode: string
) => {
  // 1. Normalize & Scale Data:
  // Create y scale
  const yScale = scaleLinear().domain([0, data.length]).range([0, app_size]);

  // Create x scale
  const xScale = scaleLinear().domain([0, 1]).range([tramsform_xy, 0]); // reverse as y is from top to bottom in canvas

  // Map data points to scaled values
  const points = data.map((d, i) => ({
    x: xScale(d),
    y: yScale(i),
  }));
  // 2. Draw with PIXI:
  const graphics = new PIXI.Graphics();
  if (colorMode === "dark") {
    graphics.lineStyle(1, 0xffffff); // 2px width, white color
  } else {
    graphics.lineStyle(1, 0x000000); // 2px width, black color
  }

  graphics.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.position.set(430, 50);
  container.addChild(graphics);
};
export const drawHorizontalTrack = (
  data: number[],
  app_size: number,
  tramsform_xy: number,
  container: PIXI.Container,
  colorMode: string
) => {
  // 1. Normalize & Scale Data:
  // Create x scale
  const xScale = scaleLinear().domain([0, data.length]).range([0, app_size]);
  // Create y scale
  const yScale = scaleLinear().domain([0, 1]).range([tramsform_xy, 0]); // reverse as y is from top to bottom in canvas

  // Map data points to scaled values
  const points = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(d),
  }));
  // 2. Draw with PIXI:
  const graphics = new PIXI.Graphics();
  if (colorMode === "dark") {
    graphics.lineStyle(1, 0xffffff); // 2px width, white color
  } else {
    graphics.lineStyle(1, 0x000000); // 2px width, black color
  }

  graphics.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.position.set(50, 430);

  container.addChild(graphics);
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
