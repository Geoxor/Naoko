import fs from "fs";
// @ts-ignore gotta use this garbage npm package cus built-in
// three.js shit doesn't work (good job cunts)
// and import the actual shit for types cus FUCK YOU THREE.JS
import { OBJLoader } from "three-obj-mtl-loader";
import _types from "three/examples/jsm/loaders/OBJLoader";

// This is so we cache the template files in RAM, performance++;
class Cache {
  public files: {
    [key: string] : Buffer 
  };
  public objects: {
    [key: string] : THREE.Group; 
  }

  constructor(){
    this.files = {
      cart: fs.readFileSync("./src/assets/models/cart.obj"),
      car: fs.readFileSync("./src/assets/models/car.obj"),
      amogus: fs.readFileSync("./src/assets/models/amogus.obj"),
      miku: fs.readFileSync("./src/assets/models/miku.obj"),
      trackmania: fs.readFileSync("./src/assets/models/trackmania.obj"),
    }
    this.objects = {
      cart: (new OBJLoader() as _types.OBJLoader).parse(this.files.cart.toString()),
      car: (new OBJLoader() as _types.OBJLoader).parse(this.files.car.toString()),
      miku: (new OBJLoader() as _types.OBJLoader).parse(this.files.amogus.toString()),
      amogus: (new OBJLoader() as _types.OBJLoader).parse(this.files.miku.toString()),
      trackmania: (new OBJLoader() as _types.OBJLoader).parse(this.files.trackmania.toString()),
    }
  }
}

export default new Cache;
