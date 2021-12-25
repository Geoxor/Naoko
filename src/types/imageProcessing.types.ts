export type ImageProcessorFn = (buffer: Buffer, ...args: any) => Promise<Buffer>;
export interface ImageProcessors {
  [key: string]: ImageProcessorFn;
}

export type Coords = {
  x?: number;
  y?: number;
  z?: number;
};

export interface GeometrySceneOptions {
  texture: Buffer;
  geometry: THREE.BufferGeometry | THREE.Object3D;
  rotation: Coords;
  camera?: Coords;
  shading?: boolean;
  width?: number;
  height?: number;
  fps?: number;
}