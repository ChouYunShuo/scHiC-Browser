import * as PIXI from "pixi.js";
import { formatPrecision } from "./ChromTickTrack";
export function drawRectWithText(
  color: string,
  posRect: PIXI.Graphics,
  rect_width: number,
  rect_height: number,
  chrom1_len: number,
  chrom2_len: number
): { textChrom1: PIXI.Text; textChrom2: PIXI.Text } {
  const createText = (text: string) =>
    new PIXI.Text(text, {
      fontFamily: "Arial",
      fontSize: 10,
      fill: color,
    });

  const [textChrom1, textChrom2] = [
    createText("Chr1:" + formatPrecision(Math.trunc(chrom1_len))),
    createText("Chr2:" + formatPrecision(Math.trunc(chrom2_len))),
  ];

  posRect
    .clear()
    .lineStyle(2, 0xeeeeee, 1)
    .beginFill(0xe5e4e2)
    .drawRect(rect_width, rect_height, 85, 35)
    .endFill();

  posRect.visible = true;
  posRect.removeChildren();
  posRect.alpha = 0.8;

  [textChrom1, textChrom2].forEach((text, i) => {
    text.x = 5 + rect_width;
    text.y = 5 + i * 15 + rect_height;
  });

  return { textChrom1, textChrom2 };
}
