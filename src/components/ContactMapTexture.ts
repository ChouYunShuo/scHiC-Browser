import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { useTheme, Theme } from "@mui/material";
import { ScaleSequential } from "d3-scale";
import React, { useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";

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
  heatmapCanvas.width = contact_map_size;
  heatmapCanvas.height = contact_map_size;
  const ctx = heatmapCanvas.getContext("2d");

  if (ctx) {
    const maxsize = Math.max(xsize, ysize);
    const s_psize = contact_map_size / maxsize;
    for (let i = 0; i < xsize; i++) {
      for (let j = 0; j < ysize; j++) {
        let fillColor;
        if (data[i][j]) {
          fillColor = d3.color(colorScaleMemo(data[i][j]))!.formatHex();
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
