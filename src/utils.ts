import axios from "axios";
import { max } from "d3";
import { scaleLinear } from "d3-scale";
import {
  selectAppSize,
  selectPixSize,
  selectAllRes,
  selectChromLen,
} from "./redux/heatmap2DSlice";
import store from "./redux/store";
import { useGetDatasetsQuery } from "./redux/apiSlice";

type queryType = {
  chrom1: string;
  chrom2: string;
  dataset_name: string;
  resolution: string;
  cell_id: string;
};
type ChromLenQueryType = {
  name: string;
  resolution: string;
  cell_id: string;
};

export type tickType = {
  chrom_pos: number;
  pix_pos: number;
};

export const fetchMap = async (simpleQuery: queryType) => {
  return axios.post("http://128.2.220.67:8000/api/query", simpleQuery).then(
    (
      res //genome-dev.compbio.cs.cmu.edu
    ) => JSON.parse(res.data)
  );
};
export const fetchChromLens = async (simpleQuery: ChromLenQueryType) => {
  return axios
    .post("http://128.2.220.67:8000/api/chromlens", simpleQuery)
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
export const validateChrom = (range: string): string => {
  const state = store.getState();
  const chrom = range.trim().split(":")[0];
  const raw = range.trim().split(":")[1];
  let lo = Number(raw.split("-")[0]);
  let hi = Number(raw.split("-")[1]);
  let chrom_len = selectChromLen(state.heatmap2D).slice();

  lo = Math.max(0, lo);

  hi = Math.min(chrom_len[chrom2idx(chrom)], hi);
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

export const getTicksAndPosFromRange = (range: string, map_size: number) => {
  const ticks: tickType[] = [];
  const numTicks = 4;
  const raw = range.trim().split(":")[1];
  const lo = Number(raw.split("-")[0]);
  const hi = Number(raw.split("-")[1]);

  const xScale = scaleLinear().domain([lo, hi]).range([0, map_size]);
  const tick = xScale.ticks(numTicks).filter((tick) => Number.isInteger(tick));

  for (let i = 0; i < tick.length; i++) {
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
  }
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
    return validateChrom(chrom_str);
  } catch (err) {
    console.log(err);
  }
};

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
