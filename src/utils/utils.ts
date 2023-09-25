import axios from "axios";
import { max } from "d3";
import { scaleLinear } from "d3-scale";
import {
  selectAppSize,
  selectPixSize,
  selectAllRes,
  selectChromLen,
} from "../redux/heatmap2DSlice";
import store from "../redux/store";
import { apiEndpoint } from "../redux/apiSlice";

type ChromLenQueryType = {
  name: string;
  resolution: string;
  cell_id: string;
};

type EmbedQueryType = {
  dataset_name: string;
  resolution: string;
  embed_type: string;
};

type MoveType = "left" | "right";

export type tickType = {
  chrom_pos: number;
  pix_pos: number;
};

export const fetchChromLens = async (simpleQuery: ChromLenQueryType) => {
  return axios
    .post(`http://${apiEndpoint}/api/chromlens`, simpleQuery)
    .then((res) => JSON.parse(res.data));
};

export const fetchEmbedding = async (simpleQuery: EmbedQueryType) => {
  return axios
    .post(`http://${apiEndpoint}/api/embed`, simpleQuery)
    .then((res) => JSON.parse(res.data));
};

export const chrom2idx = (chrom: string) => {
  let chrom_name = chrom.substring(5);
  if (chrom_name == "X") return 23;
  if (chrom_name == "Y") return 24;
  return Number(chrom_name) - 1;
};
export const getNbChrom = (range: string): string => {
  var chrom = range.trim().split(":")[0].substring(5);
  //console.log(chrom)
  return "chr" + chrom;
};

export const getChromLen = (chrom: string) => {
  const state = store.getState();
  let chrom_len = selectChromLen(state.heatmap2D).slice();
  return chrom_len[chrom2idx(chrom)];
};
export const validateChrom = (range: string): string => {
  const chrom = range.trim().split(":")[0];
  const raw = range.trim().split(":")[1];
  let lo = Number(raw.split("-")[0]);
  let hi = Number(raw.split("-")[1]);
  let chrom_len = getChromLen(chrom);

  lo = Math.max(0, lo);

  hi = Math.min(chrom_len, hi);
  //console.log(chrom+':'+lo.toString()+'-'+hi.toString())
  return chrom + ":" + lo.toString() + "-" + hi.toString();
};

export const getStartPositionAndRange = (range: string) => {
  var rawr1 = range.trim().split(":")[1];
  return [
    Number(rawr1.split("-")[0]),
    Number(rawr1.split("-")[1]) - Number(rawr1.split("-")[0]),
  ];
};

export const getChromLenFromPos = (
  range: string,
  map_size: number,
  pos: number
) => {
  const raw = range.trim().split(":")[1];
  const lo = Number(raw.split("-")[0]);
  const hi = Number(raw.split("-")[1]);

  const xScale = scaleLinear().domain([0, map_size]).range([lo, hi]);
  return Math.min(Math.max(lo, Math.ceil(xScale(pos))), hi);
};
export const calculateRange = (start: number, end: number) => end - start;

export const adjustChromValues = (
  chrom1_start: number,
  chrom1_end: number,
  chrom2_start: number,
  chrom2_end: number
) => {
  const chrom1_range = calculateRange(chrom1_start, chrom1_end);
  const chrom2_range = calculateRange(chrom2_start, chrom2_end);

  if (chrom1_range > chrom2_range) {
    chrom2_end = chrom2_start + chrom1_range;
  } else if (chrom2_range > chrom1_range) {
    chrom1_end = chrom1_start + chrom2_range;
  }

  return { chrom1_start, chrom1_end, chrom2_start, chrom2_end };
};
export const getScaleFromRange = (range1: string, range2: string) => {
  const raw1 = range1.trim().split(":")[1];
  const lo1 = Number(raw1.split("-")[0]);
  const hi1 = Number(raw1.split("-")[1]);

  const raw2 = range2.trim().split(":")[1];
  const lo2 = Number(raw2.split("-")[0]);
  const hi2 = Number(raw2.split("-")[1]);

  const scale1 = hi1 - lo1 > hi2 - lo2 ? 1 : (hi1 - lo1) / (hi2 - lo2);
  const scale2 = hi1 - lo1 > hi2 - lo2 ? (hi2 - lo2) / (hi1 - lo1) : 1;

  return [scale1, scale2];
};

export const getTicksAndPosFromRange = (
  range: string,
  start_pos: number,
  end_pos: number,
  scale: number
) => {
  const ticks: tickType[] = [];
  let numTicks;
  const raw = range.trim().split(":")[1];
  const lo = Number(raw.split("-")[0]);
  const hi = Number(raw.split("-")[1]);
  if (scale === 1) numTicks = 4;
  else numTicks = 3;

  const xScale = scaleLinear().domain([lo, hi]).range([start_pos, end_pos]);
  const tick = xScale.ticks(5).filter((tick) => Number.isInteger(tick));

  for (let i = 0; i < tick.length; i++) {
    if (tick[i] == 0) continue;
    ticks.push({
      chrom_pos: tick[i],
      pix_pos: Math.ceil(xScale(tick[i])),
    });
  }

  return ticks;
};
export const getResFromRange = (range1: string, range2: string) => {
  //range input: 0-40000000

  const state = store.getState();
  var rawr1 = range1.trim().split(":")[1];
  var rawr2 = range2.trim().split(":")[1];
  var res = selectAllRes(state.heatmap2D).slice();
  console.log(res);

  res = res.sort((a, b) => a - b);

  try {
    var app_size = selectAppSize(state.heatmap2D);
    var pix_size = selectPixSize(state.heatmap2D);

    var r1 = Number(rawr1.split("-")[1]) - Number(rawr1.split("-")[0]);
    var r2 = Number(rawr2.split("-")[1]) - Number(rawr2.split("-")[0]);
    if (r1 <= 0 || r2 <= 0 || isNaN(r1) || isNaN(r2)) throw "range not valid";
    var maxrange = Math.max(r1, r2);

    const bindex = binary_search(
      res,
      Math.floor((maxrange / app_size) * pix_size)
    );
    console.log(bindex, res[bindex]);
    return res[bindex];
  } catch (err) {
    console.log(err);
    return 500000;
  }
};

export const getNewChromFromNewPos = (
  range1: string,
  newStart: number,
  newEnd: number
) => {
  var chrom = range1.trim().split(":")[0];
  return chrom + ":" + newStart.toString() + "-" + newEnd.toString();
};
export const getNewChromZoomIn = (range1: string, a: number) => {
  //range input: 0-40000000
  var chrom = range1.trim().split(":")[0];
  var rawrange = range1.trim().split(":")[1];
  try {
    const lo = Number(rawrange.split("-")[0]);
    const hi = Number(rawrange.split("-")[1]);
    const mid = (hi - lo) / 2 + lo;
    const new_range = (hi - lo) / (2 * a);
    if (mid <= 0 || isNaN(mid)) throw "range not valid";

    return (
      chrom +
      ":" +
      Math.floor(mid - new_range).toString() +
      "-" +
      Math.floor(mid + new_range).toString()
    );
  } catch (err) {
    console.log(err);
    return range1;
  }
};
export const getNewChromZoomOut = (range1: string, a: number) => {
  //range input: 0-40000000
  var chrom = range1.trim().split(":")[0];
  var rawrange = range1.trim().split(":")[1];
  try {
    const lo = Number(rawrange.split("-")[0]);
    const hi = Number(rawrange.split("-")[1]);
    const mid = (hi - lo) / 2 + lo;
    const range = ((hi - lo) * a) / 2;
    if (mid <= 0 || isNaN(mid)) throw "range not valid";

    let chrom_str = "";
    if (mid - range <= 0)
      chrom_str = chrom + ":0-" + Math.floor(range * 2).toString();
    else
      chrom_str =
        chrom +
        ":" +
        Math.floor(mid - range).toString() +
        "-" +
        Math.floor(mid + range).toString();

    return chrom_str;
  } catch (err) {
    console.log(err);
    return range1;
  }
};

export const getNewChromeMove = (range1: string, type: MoveType) => {
  var chrom = range1.trim().split(":")[0];
  var rawrange = range1.trim().split(":")[1];
  try {
    const lo = Number(rawrange.split("-")[0]);
    const hi = Number(rawrange.split("-")[1]);
    const move_size = 1 / 4;
    const range = (hi - lo) * move_size;
    let chrom_len = getChromLen(chrom);
    let chrom_str = "";
    if ((lo === 0 && type === "left") || (hi >= chrom_len && type === "right"))
      return range1;

    if (type === "left") {
      if (lo - range <= 0) {
        chrom_str = chrom + ":0-" + Math.floor(range / move_size).toString();
      } else {
        chrom_str =
          chrom +
          ":" +
          Math.floor(lo - range).toString() +
          "-" +
          Math.floor(lo + 3 * range).toString();
      }
    } else {
      if (hi + range >= chrom_len) {
        chrom_str =
          chrom +
          ":" +
          Math.floor(chrom_len - range / move_size).toString() +
          "-" +
          chrom_len.toString();
      } else {
        chrom_str =
          chrom +
          ":" +
          Math.floor(hi - 3 * range).toString() +
          "-" +
          Math.floor(hi + range).toString();
      }
    }

    return validateChrom(chrom_str);
  } catch (err) {
    console.log(err);
    return range1;
  }
};

export function euclideanDistance(
  [x1, y1]: [number, number],
  [x2, y2]: [number, number]
) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

const binary_search = (arr: number[], val: number) => {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);

    if (arr[mid] === val) {
      return mid;
    }

    if (val < arr[mid]) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  if (start > arr.length - 1) return arr.length - 1;
  return start;
};
