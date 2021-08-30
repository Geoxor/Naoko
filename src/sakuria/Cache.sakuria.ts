import fs from "fs";
import { walkDirectory } from "../logic/logic.sakuria";
// @ts-ignore gotta use this garbage npm package cus built-in
// three.js shit doesn't work (good job cunts)
// and import the actual shit for types cus FUCK YOU THREE.JS
import { OBJLoader } from "three-obj-mtl-loader";
import _types from "three/examples/jsm/loaders/OBJLoader";
import logger from "./Logger.sakuria";

// This is so we cache the template files in RAM, performance++;
class Cache {
  public files: string[] = [];
  public objects: { [key: string]: THREE.Group } = {};
  public CACHE_PATH = "./src/cache";

  constructor() {
    this.clearCache();

    this.files = fs.readdirSync("./src/assets/models/");

    // Load 3D Objects
    for (let i = 0; i < this.files.length; i++) {
      const { name, buffer } = this.loadFile(this.files[i]);
      this.objects[name] = (new OBJLoader() as _types.OBJLoader).parse(buffer.toString());
      logger.sakuria.print(`Loaded ${name}.obj`);
    }
  }

  loadFile(path: string) {
    const name = path.split("/")[path.split("/").length - 1].replace(".obj", "");
    const buffer = fs.readFileSync(`./src/assets/models/${path}`);
    return { name, buffer };
  }

  clearCache(){
    logger.config.print(`Deleting reminent cache files`);
    if (fs.existsSync(this.CACHE_PATH)) {
      fs.rmSync(this.CACHE_PATH, {recursive: true, force: true});
    }
    fs.mkdirSync(this.CACHE_PATH);
  }
}

export default new Cache();
