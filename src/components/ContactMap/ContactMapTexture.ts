import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { ScaleSequential } from "d3-scale";

export const createHeatMapFromTexture = (
  data: number[][],
  container: PIXI.Container,
  app_size: number,
  contact_map_size: number,
  colorScaleMemo: ScaleSequential<string>,
  bgcolor: string
) => {
  const transform_xy = (app_size - contact_map_size) / 2;
  const heatmapCanvas = document.createElement("canvas");
  const xsize = data.length;
  const ysize = data[0].length;
  const scaleX = xsize > ysize ? 1 : xsize / ysize;
  const scaleY = xsize > ysize ? ysize / xsize : 1;
  heatmapCanvas.width = contact_map_size * scaleX;
  heatmapCanvas.height = contact_map_size * scaleY;
  const ctx = heatmapCanvas.getContext("2d");

  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    const maxsize = Math.max(xsize, ysize);
    const s_psize = contact_map_size / maxsize;
    for (let i = 0; i < xsize; i++) {
      for (let j = 0; j < ysize; j++) {
        if (data[i][j]) {
          const color = d3.color(colorScaleMemo(data[i][j]));
          if (color) {
            const fillColor = color.formatHex();
            ctx.fillStyle = fillColor;
            ctx.fillRect(i * s_psize, j * s_psize, s_psize, s_psize);
          }
        } else {
          ctx.fillStyle = bgcolor;
          ctx.fillRect(i * s_psize, j * s_psize, s_psize, s_psize);
        }
      }
    }

    const heatmapTexture = PIXI.Texture.from(heatmapCanvas);
    const heatmapSprite = new PIXI.Sprite(heatmapTexture);
    heatmapSprite.position.set(transform_xy, transform_xy);
    container.addChild(heatmapSprite as unknown as PIXI.DisplayObject);
  } else {
    console.error("Could not get 2D context from canvas");
  }
};

export default createHeatMapFromTexture;
