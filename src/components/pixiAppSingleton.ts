import * as PIXI from 'pixi.js';

class PixiAppSingleton {
  private static instance: PIXI.Application | null = null;

  private constructor() {}

  public static getInstance(): PIXI.Application {
    if (!PixiAppSingleton.instance) {
      PixiAppSingleton.instance = new PIXI.Application({
        backgroundColor: 0xffffff,
      });
    }
    return PixiAppSingleton.instance;
  }
}

export default PixiAppSingleton;