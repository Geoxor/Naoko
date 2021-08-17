import * as THREE from "three";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { NodeCanvasElement, createCanvas } from "node-canvas-webgl";
import Jimp from "jimp";
import logger from "../sakuria/Logger.sakuria";
import { GifUtil, GifFrame } from "gifwrap";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { Coords, GeometrySceneOptions } from "src/types";
import { getRGBAUintArray, encodeFramesToGif } from "./imageProcessors.sakuria";

/**
 *
 */
export class SceneProcessor {
  public width: number;
  public height: number;
  public fps: number;
  public camera: THREE.Camera;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public canvas: NodeCanvasElement;
  public light: THREE.AmbientLight;
  public sun: THREE.DirectionalLight;

  protected constructor(width: number = 256, height: number = 256, fps: number = 25) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(this.width, this.height);
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
  protected async update() {
    throw new Error("update must be implemented");
  }

  /**
   * Renders a webgl scene
   * @author Geoxor
   */
  public async render() {
    const frameCount = 5 * this.fps;
    const renderedFrames: ImageData[] = [];
    const bar = logger.sakuria.progress("Rendering - ", frameCount);

    for (let i = 0; i < frameCount; i++) {
      await this.update();
      this.renderer.render(this.scene, this.camera);
      renderedFrames.push(
        (this.canvas.__ctx__ as CanvasRenderingContext2D).getImageData(0, 0, this.width, this.height)
      );
      logger.sakuria.setProgressValue(bar, i / frameCount);
    }

    return await encodeFramesToGif(renderedFrames, ~~(1000 / this.fps));
  }
}

/**
 * Creates a texture that can also be animated
 * @author Bluskript & Geoxor
 */
export class MediaMaterial {
  public texture: THREE.Texture | undefined;
  public material: THREE.MeshStandardMaterial | undefined;
  public idx: number = 0;
  public animated: boolean = false;
  public frames: GifFrame[] = [];

  /**
   * Creates a RGBA texture from an image buffer
   * @param texture the buffer image to read
   * @author Geoxor, Bluskript
   */
  public async createTextureFromBuffer(texture: Buffer): Promise<THREE.DataTexture> {
    const image = await Jimp.read(texture);
    const dataTexture = new THREE.DataTexture(
      await getRGBAUintArray(image),
      image.bitmap.width,
      image.bitmap.height,
      THREE.RGBAFormat
    );
    dataTexture.wrapS = THREE.ClampToEdgeWrapping;
    dataTexture.wrapT = THREE.ClampToEdgeWrapping;
    dataTexture.flipY = true;
    return dataTexture;
  }

  public getBufferFromGifFrame(frame: GifFrame) {
    return GifUtil.shareAsJimp(Jimp, frame).getBufferAsync("image/png");
  }

  /**
   * Basically it's an async constructor to create a material and shit
   * @param texture the buffer image to use as a texture
   * @author Bluskript, Geoxor, N1kO23
   */
  public async prepare(texture: Buffer) {
    this.material = new THREE.MeshStandardMaterial({
      roughness: 0,
      transparent: true,
      side: THREE.DoubleSide,
      map: await this.createTextureFromBuffer(texture),
    });

    const type = await fileType(texture);
    this.animated = type.mime === "image/gif";

    if (this.animated) {
      this.frames = (await GifUtil.read(texture)).frames;
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
  public sceneObject: THREE.Mesh | THREE.Object3D | undefined;
  public rotation: Coords;
  public geometry: THREE.BufferGeometry | THREE.Object3D;
  public media: MediaMaterial | undefined;

  private constructor(
    geometry: THREE.BufferGeometry | THREE.Object3D,
    rotation: Coords,
    width?: number,
    height?: number,
    fps?: number
  ) {
    super(width, height, fps);
    this.geometry = geometry;
    this.rotation = rotation;
  }

  /**
   * Updates the scene for the next tick
   */
  protected async update() {
    if (!this.sceneObject) return console.log("returning");
    this.sceneObject.rotation.x += this.rotation.x ?? 0.05;
    this.sceneObject.rotation.y += this.rotation.y ?? 0.05;
    this.sceneObject.rotation.z += this.rotation.z ?? 0.0;
    await this.media?.next();
  }

  /**
   * Assures that the class gets instantiated properly
   */
  public static async create(options: GeometrySceneOptions) {
    const { geometry, rotation, width, height, fps, texture, camera } = options;
    let geometryScene = new GeometryScene(geometry, rotation, width, height, fps);
    await geometryScene.prepare(texture, camera);
    return geometryScene;
  }

  /**
   * Prepares the scene asyncronously
   * @param {Coords} [camera] The camera XYZ position
   * @param {Buffer} texture The texture buffer to use
   * @author Geoxor, Bluskript
   */
  private async prepare(texture: Buffer, camera?: Coords) {
    // Create texture
    this.media = new MediaMaterial();
    await this.media.prepare(texture);

    // Set camera positions
    this.camera.position.x = camera?.x || 0;
    this.camera.position.y = camera?.y || 0;
    this.camera.position.z = camera?.z || 1.5;

    // Generate the sceneObject
    if (this.geometry instanceof THREE.BufferGeometry) {
      this.sceneObject = new THREE.Mesh(this.geometry, this.media.material);
      this.scene.add(this.sceneObject);
    }
    // If the sceneObject is a 3D object with children
    else {
      this.sceneObject = this.geometry;

      // Apply the texture to each child
      this.sceneObject.children.map((child) => ((child as THREE.Mesh).material = this.media?.material!));

      // Add the entire group as the sceneObject
      this.scene.add(this.sceneObject);
    }
  }
}
