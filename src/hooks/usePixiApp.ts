import * as PIXI from "pixi.js";
import { useRef, useEffect, useState } from "react";
import { pixiAppType } from "../types";

export const usePixiApp = (appSize: number, bgcolor: string, res: number) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapInstance, setMapInstance] = useState<
    PIXI.Application<PIXI.ICanvas>
  >(new PIXI.Application());

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const map = new PIXI.Application({
      view: canvasRef.current,
      width: appSize,
      height: appSize,
      backgroundColor: bgcolor,
      resolution: res,
    });
    setMapInstance(map);

    return () => {
      map.stage.removeChildren();
      //map.destroy(true);
      //canvasRef.current?.removeChild(map.view as HTMLCanvasElement);
    };
  }, [appSize, bgcolor, res]);

  return { canvasRef, mapInstance };
};
