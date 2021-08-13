import * as THREE from "three";
import GIFEncoder from "gifencoder";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { createCanvas } from "node-canvas-webgl";
import Jimp from "jimp";
import logger from "../sakuria/Logger.sakuria";

export class ProcessorScene {
  public width: number;
  public height: number;
  public fps: number;
  public camera: THREE.Camera;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public encoder: GIFEncoder;
  public canvas: HTMLCanvasElement;

  constructor(width: number = 256, height: number = 256, fps: number = 25) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(this.width, this.height);

    this.encoder = new GIFEncoder(width, height);
    this.encoder.start();
    this.encoder.setRepeat(0);
    this.encoder.setDelay(~~(1000 / fps));
    this.encoder.setQuality(10);
    this.encoder.setTransparent(0x00000000);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 1.5;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.setSize(this.width, this.height);
  }

  /**
   * Updates the scene to the new positions
   */
  public update() {
    throw new Error("update must be implemented");
  }

  /**
   * Adds geometry to a scene
   * @param mesh the geometry to add to the scene
   */
  public addGeometry(mesh: THREE.Mesh) {
    this.scene.add(mesh);
  }

  /**
   * Creates a RGBA texture from an image buffer
   * @param buffer the buffer image to read
   */
  public async createTextureFromBuffer(buffer: Buffer): Promise<THREE.DataTexture> {
    const texels = 4; /** Red Green Blue and Alpha */
    const image = await Jimp.read(buffer);
    const data = new Uint8Array(texels * image.bitmap.width * image.bitmap.height);

    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        let color = image.getPixelColor(x, y);
        let r = (color >> 24) & 255;
        let g = (color >> 16) & 255;
        let b = (color >> 8) & 255;
        let a = (color >> 0) & 255;
        const stride = texels * (x + y * image.bitmap.width);
        data[stride] = r;
        data[stride + 1] = g;
        data[stride + 2] = b;
        data[stride + 3] = a;
      }
    }
    return new THREE.DataTexture(data, image.bitmap.width, image.bitmap.height, THREE.RGBAFormat);
  }

  /**
   * Renders a webgl scene
   * @author Geoxor
   */
  public render() {
    const frameCount = 5 * this.fps;
    // @ts-ignore

    for (let i = 0; i < frameCount; i++) {
      this.update();
      this.renderer.render(this.scene, this.camera);
      logger.command.print(`Rendering frame ${i + 1}`);
      // @ts-ignore
      this.encoder.addFrame(this.canvas.__ctx__);
    }
    this.encoder.finish();
    const result = this.encoder.out.getData();
    return result;
  }
}

export class CubeScene extends ProcessorScene {
  public cube: THREE.Mesh | null;

  constructor() {
    super();
    this.cube = null;
  }
 
  public update() {
    if (!this.cube) return;
    this.cube.rotation.x += 0.05;
    this.cube.rotation.y += 0.01;
  }

  public async prepare(textureBuffer: Buffer) {
    const texture = await this.createTextureFromBuffer(textureBuffer);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture, side: THREE.DoubleSide });
    this.cube = new THREE.Mesh(geometry, material);
    this.addGeometry(this.cube);
  }
}

export class WTFScene extends ProcessorScene {
  public wtf: THREE.Mesh | null;
  private rotationSpeed: number;

  constructor() {
    super();
    this.rotationSpeed = Math.random() / 3;
    this.wtf = null;
  }

  public update() {
    if (!this.wtf) return;
    this.wtf.rotation.x += this.rotationSpeed;
    this.wtf.rotation.y += 0.03;
  }

  public async prepare(textureBuffer: Buffer) {
    this.camera.position.z = 3;
    const texture = await this.createTextureFromBuffer(textureBuffer);
    const geometry = new THREE.TorusKnotGeometry(1);
    const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture, side: THREE.DoubleSide });
    this.wtf = new THREE.Mesh(geometry, material);
    this.addGeometry(this.wtf);
  }
}


export class DonutScene extends ProcessorScene {
  public donut: THREE.Mesh | null;

  constructor() {
    super();
    this.donut = null;
  }

  public update() {
    if (!this.donut) return;
    this.donut.rotation.x += 0.05;
    this.donut.rotation.y += 0.05;
  }

  public async prepare(textureBuffer: Buffer) {
    this.camera.position.z = 3;
    const texture = await this.createTextureFromBuffer(textureBuffer);
    const geometry = new THREE.TorusGeometry( 1, 0.5, 16, 100 );
    const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture, side: THREE.DoubleSide });
    this.donut = new THREE.Mesh(geometry, material);
    this.addGeometry(this.donut);
  }
}

export class PrismScene extends ProcessorScene {
  public prism: THREE.Mesh | null;

  constructor() {
    super();
    this.prism = null;
  }

  public update() {
    if (!this.prism) return;
    this.prism.rotation.x += 0.0;
    this.prism.rotation.y += 0.05;
  }

  public async prepare(textureBuffer: Buffer) {
    this.camera.position.z = 7;
    this.camera.position.y = -1;
    const texture = await this.createTextureFromBuffer(textureBuffer);
    texture.flipY = true;
    const radius = 4;
    const height = 4.5;
    const faces = 4;
    const geometry = new THREE.ConeGeometry(radius, height, faces);
    const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture, side: THREE.DoubleSide });
    this.prism = new THREE.Mesh(geometry, material);
    this.addGeometry(this.prism);
  }
}

export class SphereScene extends ProcessorScene {
  public sphere: THREE.Mesh | null;

  constructor() {
    super();
    this.sphere = null;
  }

  public update() {
    if (!this.sphere) return;
    this.sphere.rotation.x = 135;
    this.sphere.rotation.y += 0.05;
  }

  public async prepare(textureBuffer: Buffer) {
    const texture = await this.createTextureFromBuffer(textureBuffer);
    const geometry = new THREE.SphereGeometry( .75 , 32 ,16 );
    const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture, side: THREE.DoubleSide });
    this.sphere = new THREE.Mesh(geometry, material);
    this.addGeometry(this.sphere);
  }
}

export class CylinderScene extends ProcessorScene {
  public cylinder: THREE.Mesh | null;

  constructor() {
    super();
    this.cylinder = null;
  }

  public update() {
    if (!this.cylinder) return;
    this.cylinder.rotation.x -= 0.01;
    this.cylinder.rotation.y += 0.07;
  }

  public async prepare(textureBuffer: Buffer) {
    const texture = await this.createTextureFromBuffer(textureBuffer);
    const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32 );
    const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture, side: THREE.DoubleSide });
    this.cylinder = new THREE.Mesh(geometry, material);
    this.cylinder.rotation.x = 45;
    this.camera.position.z = 2;
    this.addGeometry(this.cylinder);
  }
}