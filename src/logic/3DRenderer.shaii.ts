import * as THREE from "three";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { NodeCanvasElement, createCanvas } from "node-canvas-webgl";
import Jimp from "jimp";
import logger from "../shaii/Logger.shaii";
import { GifUtil, GifFrame } from "gifwrap";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { Coords, GeometrySceneOptions } from "../types";
import { getRGBAUintArray, encodeFramesToGif } from "./logic.shaii";

import comicSans from "../assets/comic_sans_font.json";
import cache from "../shaii/Cache.shaii";

export const commands3D = {
  async prism(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0 },
      camera: { y: -1, z: 7 },
      geometry: new THREE.ConeGeometry(4, 4.5, 4),
      texture,
    });
    return scene.render();
  },

  async wtf(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: Math.random() / 3 },
      camera: { z: 3 },
      shading: true,
      geometry: new THREE.TorusKnotGeometry(1),
      texture,
    });
    return scene.render();
  },

  async cube(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.05, y: 0.0125 },
      camera: { z: 1.3 },
      geometry: new THREE.BoxGeometry(1, 1, 1),
      texture,
    });
    return scene.render();
  },

  async donut(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.05, y: 0.0125 },
      shading: true,
      camera: { z: 2.5 },
      geometry: new THREE.TorusGeometry(1, 0.5, 16, 100),
      texture,
    });
    return scene.render();
  },

  async sphere(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0 },
      camera: { z: 1.25 },
      geometry: new THREE.SphereGeometry(0.75, 32, 16),
      texture,
    });
    return scene.render();
  },

  async cylinder(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.01, y: 0.07 },
      camera: { z: 2 },
      geometry: new THREE.CylinderGeometry(1, 1, 1, 32),
      texture,
    });
    return scene.render();
  },

  async text(texture: Buffer, text?: string) {
    const loader = new THREE.FontLoader();
    const font = loader.parse(comicSans);
    const geometry = new THREE.TextGeometry(text || "your mom", {
      font: font,
      size: 12,
      height: 4,
      curveSegments: 12,
      bevelEnabled: false,
    });
    geometry.center();
    const scene = await GeometryScene.create({
      rotation: { x: 0 },
      shading: true,
      camera: { z: 16 + (text?.length || 0) * Math.PI },
      geometry,
      texture,
    });
    return scene.render();
  },

  async cart(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.05, y: 0.05 },
      camera: { z: 10 },
      shading: true,
      geometry: cache.objects.cart,
      texture,
    });
    return scene.render();
  },

  async car(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.0, y: 0.05 },
      camera: { z: 6 },
      shading: true,
      geometry: cache.objects.car,
      texture,
    });
    return scene.render();
  },

  async miku(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.0, y: 0.05 },
      camera: { y: 10, z: 16 },
      shading: true,
      geometry: cache.objects.miku,
      texture,
    });
    return scene.render();
  },

  async amogus(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.025, y: 0.05 },
      camera: { z: 4 },
      shading: true,
      geometry: cache.objects.amogus,
      texture,
    });
    return scene.render();
  },

  async trackmania(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.05, y: 0.05 },
      camera: { z: 4 },
      shading: true,
      geometry: cache.objects.trackmania,
      texture,
    });
    return scene.render();
  },

  async troll(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.0, y: 0.05 },
      camera: { z: 3, y: 1 },
      shading: true,
      geometry: cache.objects.troll,
      texture,
    });
    return scene.render();
  },

  async trollcart(texture: Buffer) {
    const scene = await GeometryScene.create({
      rotation: { x: 0.0, y: 0.05 },
      camera: { z: 6 },
      shading: true,
      geometry: cache.objects.trolley,
      texture,
    });
    return scene.render();
  },

  async geoxor(texture: Buffer) {
	  const scene = await GeometryScene.create({
		rotation: { x: Math.random() / 3 },
		camera: { z: 1.5 },
		shading: true,
		geometry: cache.objects.geoxor,
		texture,
	  });
	  (scene.geometry instanceof THREE.BufferGeometry)
	    ? scene.geometry.center()
		: logger.shaii.error("geometry cannot be centered (THREE.Object3D does not have a center property)");
		;
	  return scene.render();
  }
};

export class SceneProcessor {
  public width: number;
  public height: number;
  public fps: number;
  public camera: THREE.Camera;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public canvas: NodeCanvasElement;
  public light: THREE.AmbientLight;
  public sun?: THREE.DirectionalLight;

  protected constructor(width: number = 256, height: number = 256, fps: number = 25, shading: boolean = false) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(this.width, this.height);
    this.scene = new THREE.Scene();
    this.light = new THREE.AmbientLight(shading ? 0xaaaaaa : 0xffffff);
    if (shading) {
      this.sun = new THREE.DirectionalLight(0xffffff);
      this.scene.add(this.light, this.sun);
    }
    this.scene.add(this.light);
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
    const bar = logger.shaii.progress("Rendering - ", frameCount);

    for (let i = 0; i < frameCount; i++) {
      await this.update();
      this.renderer.render(this.scene, this.camera);
      renderedFrames.push(
        (this.canvas.__ctx__ as CanvasRenderingContext2D).getImageData(0, 0, this.width, this.height)
      );
      logger.shaii.setProgressValue(bar, i / frameCount);
    }

    return await encodeFramesToGif(
      renderedFrames.map((frame) => frame.data),
      renderedFrames[0].width,
      renderedFrames[0].height,
      ~~(1000 / this.fps)
    );
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
    fps?: number,
    shading: boolean = false
  ) {
    super(width, height, fps, shading);
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
    const { geometry, rotation, width, height, fps, texture, camera, shading } = options;
    let geometryScene = new GeometryScene(geometry, rotation, width, height, fps, shading);
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
