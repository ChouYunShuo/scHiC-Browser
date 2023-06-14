import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { useTheme, Theme } from "@mui/material";
import { ScaleSequential } from "d3-scale";
import React, { useMemo, useRef } from "react";

export const createHeatMapFromTexture = (
  data: number[][],
  container: PIXI.Container,
  app_size: number,
  contact_map_size: number,
  colorScaleMemo: ScaleSequential<string>
) => {
  const transform_xy = app_size - contact_map_size;
  const heatmapCanvas = document.createElement("canvas");
  const xsize = data.length;
  const ysize = data[0].length;
  const scaleX = xsize > ysize ? 1 : xsize / ysize;
  const scaleY = xsize > ysize ? ysize / xsize : 1;
  heatmapCanvas.width = contact_map_size * scaleX;
  heatmapCanvas.height = contact_map_size * scaleY;
  const ctx = heatmapCanvas.getContext("2d");

  if (ctx) {
    const maxsize = Math.max(xsize, ysize);
    const s_psize = contact_map_size / maxsize;
    for (let i = 0; i < xsize; i++) {
      for (let j = 0; j < ysize; j++) {
        if (data[i][j]) {
          let fillColor = d3.color(colorScaleMemo(data[i][j]))!.formatHex();
          ctx.fillStyle = fillColor;
          ctx.fillRect(i * s_psize, j * s_psize, s_psize, s_psize);
        } else if (i == j) {
          let neighbors = [
            data[i - 1]?.[j],
            data[i + 1]?.[j],
            data[i]?.[j - 1],
            data[i]?.[j + 1],
          ].filter((value) => value !== undefined && value !== null && value);
          if (neighbors.length == 0) continue;
          let average = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
          let fillColor = d3.color(colorScaleMemo(average))!.formatHex();
          ctx.fillStyle = fillColor;
          ctx.fillRect(i * s_psize, j * s_psize, s_psize, s_psize);
        }
      }
    }

    const heatmapTexture = PIXI.Texture.from(heatmapCanvas);
    const heatmapSprite = new PIXI.Sprite(heatmapTexture);
    heatmapSprite.position.set(transform_xy, transform_xy);
    container.addChild(heatmapSprite);
  }
};

export default createHeatMapFromTexture;
