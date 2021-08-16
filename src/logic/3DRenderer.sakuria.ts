import * as THREE from "three";
import GIFEncoder from "gifencoder";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { createCanvas } from "node-canvas-webgl";
import Jimp from "jimp";
import logger from "../sakuria/Logger.sakuria";
import { GifUtil, GifFrame } from "gifwrap";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";

type Coords = {
  x?: number;
  y?: number;
  z?: number;
};

export class SceneProcessor {
  public width: number;
  public height: number;
  public fps: number;
  public camera: THREE.Camera;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public encoder: GIFEncoder;
  public canvas: HTMLCanvasElement;
  public light: THREE.AmbientLight;
  public sun: THREE.DirectionalLight;

  constructor(width: number = 256, height: number = 256, fps: number = 25) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(this.width, this.height);

    this.encoder = new GIFEncoder(this.width, this.height);
    this.encoder.start();
    this.encoder.setRepeat(0);
    this.encoder.setDelay(~~(1000 / fps));
    this.encoder.setQuality(10);
    this.encoder.setTransparent(0x00000000);

    this.scene = new THREE.Scene();
    this.light = new THREE.AmbientLight(0xaaaaaa);
    this.sun = new THREE.DirectionalLight(0xffffff);
    this.scene.add(this.light, this.sun);
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.setSize(this.width, this.height);
  }

  /**
   * Updates the scene to the new positions
   * @author Geoxor, Bluskript
   */
  public async update() {
    throw new Error("update must be implemented");
  }

  /**
   * Renders a webgl scene
   * @author Geoxor
   */
  public async render() {
    const frameCount = 5 * this.fps;

    for (let i = 0; i < frameCount; i++) {
      await this.update();
      let renderTimeStart = Date.now();
      this.renderer.render(this.scene, this.camera);
      let renderTimeEnd = Date.now();
      const renderTime = renderTimeEnd - renderTimeStart;

      let encoderTimeStart = Date.now();
      // @ts-ignore
      this.encoder.addFrame(this.canvas.__ctx__);
      let encoderTimeEnd = Date.now();
      const encoderTime = encoderTimeEnd - encoderTimeStart;

      logger.command.print(`Rendered frame ${i + 1} - Render: ${renderTime}ms - Encoder: ${encoderTime}ms`);
    }
    this.encoder.finish();
    const result = this.encoder.out.getData();
    return result;
  }
}

export class MediaMaterial {
  public texture: THREE.Texture | undefined;
  public material: THREE.MeshStandardMaterial | undefined;
  public idx: number = 0;
  public animated: boolean = false;
  public frames: GifFrame[] = [];

  /**
   * Creates a RGBA texture from an image buffer
   * @param buffer the buffer image to read
   * @author Geoxor, Bluskript
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

    const texture = new THREE.DataTexture(data, image.bitmap.width, image.bitmap.height, THREE.RGBAFormat);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.flipY = true;
    return texture;
  }

  public getBufferFromGifFrame(frame: GifFrame) {
    return GifUtil.shareAsJimp(Jimp, frame).getBufferAsync("image/png");
  }

  /**
   * Basically it's an async constructor to create a material and shit
   * @param textureBuffer the buffer image to use as a texture
   * @author Bluskript, Geoxor, N1kO23
   */
  public async prepare(textureBuffer: Buffer) {
    this.material = new THREE.MeshStandardMaterial({
      roughness: 0,
      transparent: true,
      side: THREE.DoubleSide,
      map: await this.createTextureFromBuffer(textureBuffer),
    });

    const type = await fileType(textureBuffer);
    this.animated = type.mime === "image/gif";

    if (this.animated) {
      this.frames = (await GifUtil.read(textureBuffer)).frames;
      return this.next();
    }

    this.material.needsUpdate = true;
    return this.next();
  }

  /**
   * Used to render the next frame for animated textures
   * @author Bluskript, Geoxor, N1kO23
   */
  public async next() {
    if (!this.material || !this.animated) return;
    this.texture = await this.createTextureFromBuffer(
      await this.getBufferFromGifFrame(this.frames[this.idx % this.frames.length])
    );
    this.material.map = this.texture;
    this.material.needsUpdate = true;
    this.idx++;
  }
}

export class GeometryScene extends SceneProcessor {
  public sceneObject: THREE.Mesh | undefined;
  public rotation: Coords;
  public geometry: THREE.BufferGeometry;
  public media: MediaMaterial | undefined;

  constructor(geometry: THREE.BufferGeometry, rotation: Coords, width?: number, height?: number, fps?: number) {
    super(width, height, fps);
    this.geometry = geometry;
    this.rotation = rotation;
  }

  public async update() {
    if (!this.sceneObject) return;
    // This is some stupid shit because apparently 0 || 0.05 = 0.05
    this.sceneObject.rotation.x += this.rotation.x !== undefined ? this.rotation.x : 0.05;
    this.sceneObject.rotation.y += this.rotation.y !== undefined ? this.rotation.y : 0.05;
    this.sceneObject.rotation.z += this.rotation.z !== undefined ? this.rotation.z : 0.0;
    await this.media?.next();
  }

  /**
   * Prepares the scene asyncronously
   * @author Geoxor, Bluskript
   */
  public async prepare(textureBuffer: Buffer, cameraPosition?: Coords) {
    this.media = new MediaMaterial();
    await this.media.prepare(textureBuffer);
    this.camera.position.x = cameraPosition?.x || 0;
    this.camera.position.y = cameraPosition?.y || 0;
    this.camera.position.z = cameraPosition?.z || 1.5;
    this.sceneObject = new THREE.Mesh(this.geometry, this.media.material);
    this.scene.add(this.sceneObject);
  }
}