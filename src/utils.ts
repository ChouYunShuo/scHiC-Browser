import axios from "axios";
import { max } from "d3";
import {selectAppSize, selectPixSize} from './redux/heatmap2DSlice'
import store from './redux/store';
type queryType = {
    chrom1: string;
    chrom2: string;
    dataset_name: string;
    resolution: string;
    cell_id: string;
};

export const fetchMap = async (simpleQuery:queryType)=>{
    return axios.post("http://127.0.0.1:8000/api/test", simpleQuery).then((res) =>
      JSON.parse(res.data)
    )
}

export const getResFromRange = (range1: string, range2:string)=>{
    //range input: 0-40000000
    
    const state = store.getState();
    var rawr1 = range1.trim().split(':')[1]
    var rawr2 = range2.trim().split(':')[1]
    var res = [2500000, 1000000, 500000, 250000, 100000, 50000, 25000, 10000, 5000]
    res = res.sort((a, b) => a-b)
    //console.log(res)
    
    try{
        var app_size = selectAppSize(state.heatmap2D)
        var pix_size = selectPixSize(state.heatmap2D)
        
        
        var r1 = Number(rawr1.split('-')[1]) - Number(rawr1.split('-')[0])
        var r2 = Number(rawr2.split('-')[1]) - Number(rawr2.split('-')[0])
        if (r1<=0 || r2<=0 || isNaN(r1) || isNaN(r2)) throw "range not valid"
        var maxrange = Math.max(r1,r2)

        const bindex = binary_search(res, Math.floor(maxrange/app_size*pix_size))
        
        return res[bindex]

    }
    catch(err) {
        console.log(err)
    }
    
}

const binary_search = (arr: number[], val: number)=>{
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
  return start;
}