import * as PIXI from "pixi.js";
import store from "../../redux/store";
import { tickType } from "../../utils/utils";
import { format, precisionPrefix, formatPrefix } from "d3-format";

const formatText = (pos: number) => {
  const contact_map_size = store.getState().heatmap2D.contact_map_size;
  const p = precisionPrefix(pos, contact_map_size);
  const fPrecision = formatPrefix(`,.${p}`, contact_map_size);
  return format("~s")(pos);
};

export const formatPrecision = (pos: number) => {
  const contact_map_size = store.getState().heatmap2D.contact_map_size;
  const p = precisionPrefix(pos, contact_map_size);
  const fPrecision = formatPrefix(`,.${p}`, contact_map_size);
  return fPrecision(pos);
};
const pixi_text_config = {
  fontFamily: "Arial",
  fontSize: 4,
  fill: 0xff0000,
};
export const addHorizontalTicksText = (
  ticks: tickType[],
  container: PIXI.Container,
  textColor: string
) => {
  const padding_x = 38;
  const padding_y = 27;
  const start_x = 50;
  const start_y = 45;
  const end_y = 50;

  // Create a line to mark chromosome distance
  for (let i = 0; i < ticks.length; i++) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, parseInt(textColor.slice(1), 16));
    line.moveTo(start_x + ticks[i].pix_pos, start_y);
    line.lineTo(start_x + ticks[i].pix_pos, end_y);

    //Create a text label to mark chromosome distance

    const text = new PIXI.Text(formatText(ticks[i].chrom_pos), {
      fontFamily: "Arial",
      fontSize: 10,
      fill: textColor,
    });
    text.x = padding_x + ticks[i].pix_pos;
    text.y = padding_y;
    if (text.x > start_x) {
      container.addChild(line);
      container.addChild(text);
    }
  }
};

export const addVerticalTicksText = (
  ticks: tickType[],
  container: PIXI.Container,
  textColor: string
) => {
  const padding_x = 30;
  const padding_y = 30;
  const start_x = 45;
  const end_x = 50;
  const start_y = 50;

  // Create a line to mark chromosome distance
  for (let i = 0; i < ticks.length; i++) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, parseInt(textColor.slice(1), 16));
    line.moveTo(start_x, start_y + ticks[i].pix_pos);
    line.lineTo(end_x, start_y + ticks[i].pix_pos);

    //Create a text label to mark chromosome distance

    const text = new PIXI.Text(formatText(ticks[i].chrom_pos), {
      fontFamily: "Arial",
      fontSize: 12,
      fill: textColor,
    });
    text.x = padding_x;
    text.y = padding_y + ticks[i].pix_pos;
    text.anchor.set(1.2, 0);
    text.rotation = -Math.PI / 2;
    if (text.y > start_y) {
      container.addChild(line);
      container.addChild(text);
    }
  }
};
