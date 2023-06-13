import fs from "fs";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { fileURLToPath } from "node:url";

// This is so we cache the template files in RAM, performance++;
class Cache {
  public files: string[] = [];
  public objects: { [key: string]: THREE.Group } = {};

  constructor() {
    this.loadFiles().catch(console.error);
  }

  async loadFiles(): Promise<void> {
    const absolutePath = fileURLToPath(new URL("../assets/models", import.meta.url));
    this.files = fs.readdirSync(absolutePath);

    // Load 3D Objects
    for (let i = 0; i < this.files.length; i++) {
      const { name, buffer } = this.loadFile(this.files[i]);
      this.objects[name] = new OBJLoader().parse(buffer.toString());
    }
  }

  loadFile(path: string) {
    const name = path.split("/")[path.split("/").length - 1].replace(".obj", "");
    const absolutePath = fileURLToPath(new URL("../assets/models", import.meta.url));
    const buffer = fs.readFileSync(`${absolutePath}/${path}`);
    return { name, buffer };
  }
}

export default new Cache();
