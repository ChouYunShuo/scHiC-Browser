import * as PIXI from "pixi.js";
import { scaleLinear } from "d3-scale";
type PointType = {
  x: number;
  y: number;
};

export const drawLinePlot = (container: PIXI.Container) => {
  const raw_xpoints = generateData(20);
  const points = normalizeAndMapPoints(raw_xpoints, 450, 500, 50, 500);
  console.log(points);
  const line = new PIXI.Graphics();
  line.lineStyle(2, 0x000000); // 2px width, black color
  line.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    line.lineTo(points[i].x, points[i].y);
  }
  container.addChild(line);
};

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateYData = (numPoints: number): PointType[] => {
  let previousX = generateRandomNumber(0, 500);
  return Array.from({ length: numPoints })
    .map(() => {
      const y = generateRandomNumber(0, 500);
      const x = previousX + generateRandomNumber(-20, 20); // Introducing a change (could be positive or negative) from the previous y-value.
      previousX = y;
      return { x, y };
    })
    .sort((a, b) => a.y - b.y); // Sort by x values to make it look like a line plot.
};
const generateXData = (numPoints: number): PointType[] => {
  let previousX = generateRandomNumber(0, 500);
  return Array.from({ length: numPoints })
    .map(() => {
      const y = generateRandomNumber(0, 500);
      const x = previousX + generateRandomNumber(-20, 20); // Introducing a change (could be positive or negative) from the previous y-value.
      previousX = y;
      return { x, y };
    })
    .sort((a, b) => a.x - b.x); // Sort by x values to make it look like a line plot.
};
const normalizeAndMapPoints = (
  data: PointType[],
  minXRect: number,
  maxXRect: number,
  minYRect: number,
  maxYRect: number
): PointType[] => {
  const xScale = scaleLinear().domain([0, 500]).range([minXRect, maxXRect]);
  const yScale = scaleLinear().domain([0, 500]).range([minYRect, maxYRect]);

  return data.map((point) => ({
    x: xScale(point.x),
    y: yScale(point.y),
  }));
};
