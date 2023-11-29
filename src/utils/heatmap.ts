import * as PIXI from "pixi.js";
export const initRect = (rect: PIXI.Graphics) => {
  rect.lineStyle(2, 0xff0000, 1);
  rect.drawRect(0, 0, 0, 0);
  rect.visible = false;
};

export const drawSelectRect = (
  rect: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  rect
    .clear()
    .lineStyle(2, 0xeeeeee, 1)
    //@ts-ignore
    .beginFill(new PIXI.Color(color))
    .drawRect(x, y, width, height)
    .endFill();

  rect.alpha = 0.3;
  rect.visible = true;
};

export const createGraphics = (
  color: string,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const point = new PIXI.Graphics();
  //@ts-ignore
  point.beginFill(new PIXI.Color(color));
  point.drawRect(x, y, width, height);
  point.endFill();
  return point;
};
