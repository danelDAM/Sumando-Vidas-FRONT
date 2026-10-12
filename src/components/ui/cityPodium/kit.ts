import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Palette taken from the original city illustrations: sage hills, cream walls, teal roofs and ink lines.
export const palette = {
  ink: "#3f5f58",
  sageLight: "#b9d3c7",
  sage: "#a3c4b6",
  sageMid: "#93b9aa",
  sageDark: "#7ea596",
  teal: "#5f8f84",
  tealDark: "#46685f",
  slate: "#4f6a73",
  cream: "#f2e8cc",
  creamDark: "#e6d7b2",
  sand: "#ecdcb8",
  stone: "#dccba3",
  white: "#f8f5ec",
  salmon: "#efd2b4",
  street: "#ebe2ca",
  glass: "#d5e9ee",
  trunk: "#a08967",
  leaf: "#73a07f",
  leafDark: "#5d8a6c",
  pine: "#557f66",
  brick: "#bf6f50",
  gold: "#e3b94f",
  orange: "#e79a3a",
  water: "#bcdbe0",
};

export type TextureKind = "windows" | "arches" | "slits" | "glass" | "stone" | "brick" | "plain";

// Size in scene units of one repeat of each facade texture.
const textureCell: Record<Exclude<TextureKind, "plain">, [number, number]> = {
  windows: [0.062, 0.072],
  arches: [0.078, 0.1],
  slits: [0.05, 0.1],
  glass: [0.08, 0.04],
  stone: [0.09, 0.045],
  brick: [0.05, 0.026],
};

function drawTile(kind: Exclude<TextureKind, "plain">) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 64);
  const ink = "rgba(63, 95, 88, 0.88)";
  const soft = "rgba(63, 95, 88, 0.28)";

  switch (kind) {
    case "windows":
      context.fillStyle = ink;
      context.fillRect(20, 14, 24, 32);
      context.fillStyle = "rgba(255, 255, 255, 0.35)";
      context.fillRect(31, 14, 2, 32);
      context.fillStyle = soft;
      context.fillRect(15, 48, 34, 4);
      break;
    case "arches":
      context.fillStyle = ink;
      context.beginPath();
      context.moveTo(20, 60);
      context.lineTo(20, 30);
      context.arc(32, 30, 12, Math.PI, 0);
      context.lineTo(44, 60);
      context.closePath();
      context.fill();
      context.fillStyle = soft;
      context.fillRect(0, 0, 64, 4);
      break;
    case "slits":
      context.fillStyle = ink;
      context.fillRect(28, 16, 8, 34);
      context.fillStyle = soft;
      context.fillRect(0, 60, 64, 4);
      break;
    case "glass":
      context.fillStyle = "rgba(255, 255, 255, 0.0)";
      context.fillRect(0, 0, 64, 64);
      context.fillStyle = "rgba(63, 95, 88, 0.42)";
      context.fillRect(0, 58, 64, 6);
      context.fillRect(0, 0, 4, 64);
      break;
    case "stone":
      context.strokeStyle = soft;
      context.lineWidth = 3;
      context.strokeRect(0, 0, 64, 32);
      context.strokeRect(-32, 32, 64, 32);
      context.strokeRect(32, 32, 64, 32);
      break;
    case "brick":
      context.fillStyle = "rgba(255, 255, 255, 1)";
      context.fillRect(0, 0, 64, 64);
      context.strokeStyle = "rgba(90, 40, 25, 0.35)";
      context.lineWidth = 4;
      context.strokeRect(0, 0, 64, 32);
      context.strokeRect(-32, 32, 64, 32);
      context.strokeRect(32, 32, 64, 32);
      break;
  }

  return canvas;
}

type MaterialExtras = {
  transparent?: boolean;
  opacity?: number;
  roughness?: number;
  metalness?: number;
  doubleSide?: boolean;
  vertexColors?: boolean;
  emissive?: string;
  smooth?: boolean;
};

// Shared materials, textures and helpers for every city model.
export class Kit {
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private tiles = new Map<string, HTMLCanvasElement>();
  private textures: THREE.Texture[] = [];
  readonly edgeMaterial = new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.5 });
  private tracked: { dispose(): void }[] = [];

  track<T extends { dispose(): void }>(resource: T) {
    this.tracked.push(resource);
    return resource;
  }

  private texture(kind: Exclude<TextureKind, "plain">, repeatX: number, repeatY: number) {
    let tile = this.tiles.get(kind);
    if (!tile) {
      tile = drawTile(kind);
      this.tiles.set(kind, tile);
    }
    const texture = new THREE.CanvasTexture(tile);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    texture.repeat.set(repeatX, repeatY);
    this.textures.push(texture);
    return texture;
  }

  material(color: string, kind: TextureKind = "plain", repeatX = 1, repeatY = 1, extras: MaterialExtras = {}) {
    const key = `${color}|${kind}|${repeatX}|${repeatY}|${JSON.stringify(extras)}`;
    const cached = this.materials.get(key);
    if (cached) {
      return cached;
    }

    const material = new THREE.MeshStandardMaterial({
      color: extras.vertexColors ? "#ffffff" : color,
      roughness: extras.roughness ?? 0.92,
      metalness: extras.metalness ?? 0,
      flatShading: !extras.smooth,
      transparent: extras.transparent ?? false,
      opacity: extras.opacity ?? 1,
      side: extras.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
      vertexColors: extras.vertexColors ?? false,
      envMapIntensity: 0.18,
    });
    if (extras.emissive) {
      material.emissive = new THREE.Color(extras.emissive);
    }
    if (kind !== "plain") {
      material.map = this.texture(kind, repeatX, repeatY);
    }
    // Lets mergeModel swap a tiled material for the shared untiled one.
    material.userData.recipe = { color, kind, extras };
    this.materials.set(key, material);
    return material;
  }

  private repeats(kind: TextureKind, width: number, height: number): [number, number] {
    if (kind === "plain") {
      return [1, 1];
    }
    const [cellWidth, cellHeight] = textureCell[kind];
    return [Math.max(1, Math.round(width / cellWidth)), Math.max(1, Math.round(height / cellHeight))];
  }

  // Box face materials ordered +x, -x, +y, -y, +z, -z with textures scaled to each face.
  boxMaterials(color: string, kind: TextureKind, width: number, height: number, depth: number, roofColor?: string, extras: MaterialExtras = {}) {
    const front = this.material(color, kind, ...this.repeats(kind, width, height), extras);
    const side = this.material(color, kind, ...this.repeats(kind, depth, height), extras);
    const top = this.material(roofColor ?? color, "plain", 1, 1, extras);
    return [side, side, top, top, front, front];
  }

  cylinderMaterials(color: string, kind: TextureKind, radius: number, height: number, capColor?: string, extras: MaterialExtras = {}) {
    const side = this.material(color, kind, ...this.repeats(kind, Math.PI * 2 * radius, height), extras);
    const cap = this.material(capColor ?? color, "plain", 1, 1, extras);
    return [side, cap, cap];
  }

  add(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[],
    position: [number, number, number],
    options: { rotation?: [number, number, number]; scale?: [number, number, number]; edges?: boolean; edgeAngle?: number; shadow?: boolean } = {},
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (options.rotation) {
      mesh.rotation.set(...options.rotation);
    }
    if (options.scale) {
      mesh.scale.set(...options.scale);
    }
    mesh.castShadow = options.shadow !== false;
    mesh.receiveShadow = true;
    if (options.edges !== false) {
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, options.edgeAngle ?? 28), this.edgeMaterial));
    }
    parent.add(mesh);
    return mesh;
  }

  dispose() {
    this.materials.forEach((material) => material.dispose());
    this.textures.forEach((texture) => texture.dispose());
    this.tracked.forEach((resource) => resource.dispose());
    this.edgeMaterial.dispose();
  }
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const amount = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
};

export type Bump = { x: number; z: number; h: number; rx: number; rz: number; power?: number; terrace?: boolean };

export type TerrainOptions = {
  width: number;
  depth: number;
  bumps: Bump[];
  step: number;
  seed: number;
  grass?: string[];
  // Coastal cities: negative offset that carves the sea, water level and the floor of the diorama base.
  carve?: (x: number, z: number) => number;
  water?: number;
  floor?: number;
  // false for wooded hills: every terrace bank stays green instead of some cream walls.
  walls?: boolean;
};

function waterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#93cbd6";
  context.fillRect(0, 0, 128, 128);
  context.strokeStyle = "rgba(255, 255, 255, 0.55)";
  context.lineWidth = 3;
  for (const [x, y] of [[20, 30], [84, 18], [52, 70], [104, 92], [14, 104]]) {
    context.beginPath();
    context.arc(x, y, 9, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 4);
  return texture;
}

// Terraced hill: flat sage terraces separated by cream retaining walls, flat streets around the base.
export class Terrain {
  readonly mesh: THREE.Mesh;

  constructor(private readonly options: TerrainOptions, kit: Kit) {
    const { width, depth, step } = options;
    const geometry = new THREE.PlaneGeometry(width, depth, 150, 124);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      positions.setY(index, this.heightAt(positions.getX(index), positions.getZ(index)));
    }

    // Colours are set per vertex and blended by slope, so terraces and their banks read as clean bands.
    geometry.computeVertexNormals();
    const vertices = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const colors = new Float32Array(vertices.count * 3);
    const grass = (options.grass ?? ["#a3c5b5", "#94bba9", "#acccbe", "#8bb3a1"]).map((hex) => new THREE.Color(hex));
    const banks = ["#86a99a", "#8eb0a1", "#7fa293"].map((hex) => new THREE.Color(hex));
    const street = new THREE.Color(palette.street);
    const wall = new THREE.Color(palette.cream);
    const sand = new THREE.Color("#efe0ba");
    const seabed = new THREE.Color("#a9cfc8");
    const color = new THREE.Color();
    const bank = new THREE.Color();
    for (let index = 0; index < vertices.count; index += 1) {
      const height = vertices.getY(index);
      if (height < -0.002) {
        color.copy(options.water !== undefined && height < options.water ? seabed : sand);
      } else if (height < 0.004) {
        color.copy(street);
      } else {
        const level = Math.floor(height / step + 0.02);
        bank.copy(level % 3 === 1 && options.walls !== false ? wall : banks[level % banks.length]);
        color.copy(bank).lerp(grass[Math.round(height / step) % grass.length], smoothstep(0.6, 0.92, normals.getY(index)));
      }
      colors.set([color.r, color.g, color.b], index * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.mesh = new THREE.Mesh(geometry, kit.material("#ffffff", "plain", 1, 1, { vertexColors: true, roughness: 0.96, smooth: true }));
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.mesh.add(new THREE.LineSegments(this.contours((maxHeight) => {
      const levels = [0.004];
      for (let level = step; level <= maxHeight + 0.001; level += step) {
        levels.push(level - 0.006);
      }
      return levels;
    }, 0.008), kit.edgeMaterial));

    if (options.water !== undefined) {
      const foam = kit.track(new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.9 }));
      this.mesh.add(new THREE.LineSegments(this.contours(() => [options.water!], 0.003), foam));
      this.mesh.add(this.waterBody(kit, options.water, options.floor ?? options.water - 0.06));
    }
    if (options.floor !== undefined) {
      this.mesh.add(this.skirt(kit, options.floor));
    }
  }

  // Translucent water filling the carved sea; its front face shows the water like a diorama cut.
  private waterBody(kit: Kit, level: number, floor: number) {
    const { width, depth } = this.options;
    const height = level - floor - 0.004;
    const surface = kit.track(waterTexture());
    const top = kit.track(new THREE.MeshStandardMaterial({ map: surface, transparent: true, opacity: 0.86, roughness: 0.22, metalness: 0.05, envMapIntensity: 0.6 }));
    const side = kit.track(new THREE.MeshStandardMaterial({ color: "#86c2cf", transparent: true, opacity: 0.72, roughness: 0.3, envMapIntensity: 0.4 }));
    const water = new THREE.Mesh(kit.track(new THREE.BoxGeometry(width - 0.006, height, depth - 0.006)), [side, side, top, side, side, side]);
    water.position.y = floor + 0.004 + height / 2;
    water.receiveShadow = true;
    return water;
  }

  // Side walls of the diorama base, following the terrain profile down to the floor.
  private skirt(kit: Kit, floor: number) {
    const { width, depth, water } = this.options;
    const positions: number[] = [];
    const colors: number[] = [];
    const outline: number[] = [];
    const earth = new THREE.Color("#e2d2ab");
    const earthDark = new THREE.Color("#cdb991");
    const sand = new THREE.Color("#ead9b0");
    const seabed = new THREE.Color("#9fc6bf");
    const corners: [number, number][] = [[-width / 2, depth / 2], [width / 2, depth / 2], [width / 2, -depth / 2], [-width / 2, -depth / 2]];
    const samples = 96;
    corners.forEach(([startX, startZ], index) => {
      const [endX, endZ] = corners[(index + 1) % corners.length];
      for (let sample = 0; sample < samples; sample += 1) {
        const x0 = startX + ((endX - startX) * sample) / samples;
        const z0 = startZ + ((endZ - startZ) * sample) / samples;
        const x1 = startX + ((endX - startX) * (sample + 1)) / samples;
        const z1 = startZ + ((endZ - startZ) * (sample + 1)) / samples;
        const h0 = this.heightAt(x0, z0);
        const h1 = this.heightAt(x1, z1);
        positions.push(x0, h0, z0, x0, floor, z0, x1, h1, z1, x1, h1, z1, x0, floor, z0, x1, floor, z1);
        const topColor = (height: number) => (height < -0.002 ? (water !== undefined && height < water ? seabed : sand) : earth);
        for (const vertexColor of [topColor(h0), earthDark, topColor(h1), topColor(h1), earthDark, earthDark]) {
          colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
        }
        outline.push(x0, h0, z0, x1, h1, z1, x0, floor, z0, x1, floor, z1);
      }
      outline.push(startX, floor, startZ, startX, this.heightAt(startX, startZ), startZ);
    });
    const geometry = kit.track(new THREE.BufferGeometry());
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const material = kit.track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide, envMapIntensity: 0.2 }));
    const skirt = new THREE.Mesh(geometry, material);
    skirt.receiveShadow = true;
    const lines = kit.track(new THREE.BufferGeometry());
    lines.setAttribute("position", new THREE.Float32BufferAttribute(outline, 3));
    skirt.add(new THREE.LineSegments(lines, kit.edgeMaterial));
    return skirt;
  }

  // Clean outlines along the top edge of every terrace and around the hill, traced with marching squares.
  private contours(levelsFor: (maxHeight: number) => number[], lift: number) {
    const { width, depth } = this.options;
    const columns = 160;
    const rows = 134;
    const heights = new Float32Array((columns + 1) * (rows + 1));
    let maxHeight = 0;
    for (let row = 0; row <= rows; row += 1) {
      for (let column = 0; column <= columns; column += 1) {
        const height = this.heightAt(-width / 2 + (column / columns) * width, -depth / 2 + (row / rows) * depth);
        heights[row * (columns + 1) + column] = height;
        maxHeight = Math.max(maxHeight, height);
      }
    }
    // Corner bits: 1 top-left, 2 top-right, 4 bottom-right, 8 bottom-left. Edges: T, R, B, L.
    const cases: Record<number, string[]> = {
      1: ["LT"], 2: ["TR"], 3: ["LR"], 4: ["RB"], 5: ["LT", "RB"], 6: ["TB"], 7: ["LB"],
      8: ["BL"], 9: ["TB"], 10: ["TR", "BL"], 11: ["RB"], 12: ["LR"], 13: ["TR"], 14: ["LT"],
    };
    const levels = levelsFor(maxHeight);
    const positions: number[] = [];
    const cellWidth = width / columns;
    const cellDepth = depth / rows;
    for (const iso of levels) {
      const y = iso + lift;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * (columns + 1) + column;
          const a = heights[index];
          const b = heights[index + 1];
          const c = heights[index + columns + 2];
          const d = heights[index + columns + 1];
          const code = (a > iso ? 1 : 0) | (b > iso ? 2 : 0) | (c > iso ? 4 : 0) | (d > iso ? 8 : 0);
          const pairs = cases[code];
          if (!pairs) {
            continue;
          }
          const x0 = -width / 2 + column * cellWidth;
          const z0 = -depth / 2 + row * cellDepth;
          const point = (edge: string) => {
            switch (edge) {
              case "T":
                return [x0 + cellWidth * ((iso - a) / (b - a)), z0];
              case "R":
                return [x0 + cellWidth, z0 + cellDepth * ((iso - b) / (c - b))];
              case "B":
                return [x0 + cellWidth * ((iso - d) / (c - d)), z0 + cellDepth];
              default:
                return [x0, z0 + cellDepth * ((iso - a) / (d - a))];
            }
          };
          for (const pair of pairs) {
            const [startX, startZ] = point(pair[0]);
            const [endX, endZ] = point(pair[1]);
            positions.push(startX, y, startZ, endX, y, endZ);
          }
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }

  // Terraced hills, smooth bumps (islands) and the carved sea combine into the final height.
  heightAt(x: number, z: number) {
    const { width, depth, bumps, seed, step } = this.options;
    let terraced = 0;
    let smooth = 0;
    for (const bump of bumps) {
      const dx = (x - bump.x) / bump.rx;
      const dz = (z - bump.z) / bump.rz;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < 1) {
        const value = bump.h * Math.pow(1 - distance * distance, bump.power ?? 1.5);
        if (bump.terrace === false) {
          smooth = Math.max(smooth, value);
        } else {
          terraced = Math.max(terraced, value);
        }
      }
    }
    if (terraced > 0.02) {
      terraced += 0.028 * (Math.sin(x * 7.3 + seed) * Math.cos(z * 6.1 - seed * 0.7) + 0.6 * Math.sin((x + z) * 12.7 + seed * 1.3));
    }
    const edge = smoothstep(0.02, 0.16, Math.min(width / 2 - Math.abs(x), depth / 2 - Math.abs(z)));
    let terraces = 0;
    const masked = Math.max(0, terraced) * edge;
    if (masked > 0.0001) {
      const level = Math.floor(masked / step);
      terraces = step * (level + smoothstep(0.74, 0.97, masked / step - level));
    }
    const height = Math.max(terraces, smooth * edge) + (this.options.carve ? this.options.carve(x, z) : 0);
    if (height < 0) {
      return Math.max(height, (this.options.floor ?? -1) + 0.01);
    }
    return height <= 0.0001 ? 0 : height;
  }
}

type Footprint = { minX: number; maxX: number; minZ: number; maxZ: number };

export type BlockOptions = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  y?: number;
  color?: string;
  kind?: TextureKind;
  roof?: "flat" | "parapet" | "gable" | "hip" | "mansard" | "none";
  roofColor?: string;
  roofHeight?: number;
  rotY?: number;
  occupy?: boolean;
  merlons?: boolean;
};

export type CylinderOptions = {
  x: number;
  z: number;
  r: number;
  rTop?: number;
  h: number;
  y?: number;
  segments?: number;
  color?: string;
  kind?: TextureKind;
  capColor?: string;
  merlons?: boolean;
  occupy?: boolean;
};

// Places geometry on a terrain, tracking occupied ground so scattered houses never overlap landmarks.
export class CityBuilder {
  private footprints: Footprint[] = [];

  constructor(
    readonly kit: Kit,
    readonly root: THREE.Group,
    readonly terrain: Terrain,
    readonly random: () => number,
  ) {}

  range(min: number, max: number) {
    return min + (max - min) * this.random();
  }

  pick<T>(items: T[]) {
    return items[Math.floor(this.random() * items.length)];
  }

  ground(x: number, z: number, width: number, depth: number, rotation = 0) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    let min = Infinity;
    let max = -Infinity;
    for (const [u, v] of [[0, 0], [-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5], [0, -0.5], [0, 0.5], [-0.5, 0], [0.5, 0]]) {
      const localX = u * width;
      const localZ = v * depth;
      const height = this.terrain.heightAt(x + localX * cos + localZ * sin, z - localX * sin + localZ * cos);
      min = Math.min(min, height);
      max = Math.max(max, height);
    }
    return { min, max };
  }

  occupy(x: number, z: number, width: number, depth: number, padding = 0.015) {
    const half = Math.max(width, depth) / 2 + padding;
    this.footprints.push({ minX: x - half, maxX: x + half, minZ: z - half, maxZ: z + half });
  }

  isFree(x: number, z: number, width: number, depth: number, padding = 0.015) {
    const half = Math.max(width, depth) / 2 + padding;
    return this.footprints.every((footprint) => x + half < footprint.minX || x - half > footprint.maxX || z + half < footprint.minZ || z - half > footprint.maxZ);
  }

  // Rectangular building; returns the height of its walls' top.
  block(options: BlockOptions) {
    const { kit, root } = this;
    const rotation = options.rotY ?? 0;
    let base: number;
    let height: number;
    if (options.y !== undefined) {
      base = options.y;
      height = options.h;
    } else {
      const ground = this.ground(options.x, options.z, options.w, options.d, rotation);
      if (ground.max - ground.min > 0.05) {
        // On a slope the building stands on a stone plinth instead of growing a huge facade.
        const plinthBase = ground.min - 0.02;
        const plinthHeight = ground.max - plinthBase;
        kit.add(root, new THREE.BoxGeometry(options.w + 0.01, plinthHeight, options.d + 0.01), kit.boxMaterials(palette.stone, "stone", options.w, plinthHeight, options.d), [options.x, plinthBase + plinthHeight / 2, options.z], {
          rotation: [0, rotation, 0],
        });
        base = ground.max;
        height = options.h;
      } else {
        base = ground.min - 0.02;
        height = ground.max - base + options.h;
      }
    }
    const color = options.color ?? palette.cream;
    const roof = options.roof ?? "flat";
    const roofColor = options.roofColor ?? palette.teal;
    const top = base + height;
    kit.add(root, new THREE.BoxGeometry(options.w, height, options.d), kit.boxMaterials(color, options.kind ?? "windows", options.w, height, options.d, roof === "flat" ? palette.creamDark : color), [options.x, base + height / 2, options.z], {
      rotation: [0, rotation, 0],
    });

    const roofHeight = options.roofHeight ?? Math.min(options.w, options.d) * 0.5;
    if (roof === "parapet") {
      kit.add(root, new THREE.BoxGeometry(options.w + 0.012, 0.014, options.d + 0.012), kit.material(palette.creamDark), [options.x, top + 0.007, options.z], { rotation: [0, rotation, 0] });
    } else if (roof === "gable") {
      const shape = new THREE.Shape();
      shape.moveTo(-options.w / 2 - 0.008, 0);
      shape.lineTo(options.w / 2 + 0.008, 0);
      shape.lineTo(0, roofHeight);
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: options.d + 0.012, bevelEnabled: false });
      geometry.translate(0, 0, -(options.d + 0.012) / 2);
      kit.add(root, geometry, kit.material(roofColor), [options.x, top, options.z], { rotation: [0, rotation, 0] });
    } else if (roof === "hip" || roof === "mansard") {
      const geometry =
        roof === "hip" ? new THREE.ConeGeometry(Math.SQRT1_2, 1, 4) : new THREE.CylinderGeometry(Math.SQRT1_2 * 0.55, Math.SQRT1_2, 1, 4);
      geometry.rotateY(Math.PI / 4);
      geometry.translate(0, 0.5, 0);
      kit.add(root, geometry, kit.material(roofColor), [options.x, top, options.z], {
        rotation: [0, rotation, 0],
        scale: [options.w + 0.014, roofHeight, options.d + 0.014],
      });
    }
    if (options.merlons) {
      this.merlons(options.x, options.z, top, options.w, options.d, color, rotation);
    }
    if (options.occupy !== false && options.y === undefined) {
      this.occupy(options.x, options.z, options.w, options.d);
    }
    return top;
  }

  cylinder(options: CylinderOptions) {
    const { kit, root } = this;
    const segments = options.segments ?? 8;
    let base: number;
    let height: number;
    if (options.y !== undefined) {
      base = options.y;
      height = options.h;
    } else {
      const ground = this.ground(options.x, options.z, options.r * 2, options.r * 2);
      base = ground.min - 0.02;
      height = ground.max - base + options.h;
    }
    const color = options.color ?? palette.cream;
    kit.add(
      root,
      new THREE.CylinderGeometry(options.rTop ?? options.r, options.r, height, segments),
      kit.cylinderMaterials(color, options.kind ?? "plain", options.r, height, options.capColor),
      [options.x, base + height / 2, options.z],
      { edgeAngle: segments > 12 ? 40 : 20 },
    );
    if (options.merlons) {
      this.roundMerlons(options.x, options.z, base + height, options.rTop ?? options.r, color);
    }
    if (options.occupy !== false && options.y === undefined) {
      this.occupy(options.x, options.z, options.r * 2, options.r * 2);
    }
    return base + height;
  }

  cone(x: number, z: number, y: number, radius: number, height: number, color: string, segments = 8, rotation = 0) {
    this.kit.add(this.root, new THREE.ConeGeometry(radius, height, segments), this.kit.material(color), [x, y + height / 2, z], {
      rotation: [0, rotation, 0],
      edgeAngle: 20,
    });
    return y + height;
  }

  dome(x: number, z: number, y: number, radius: number, color: string, options: { scaleY?: number; lantern?: boolean; drum?: number } = {}) {
    const { kit, root } = this;
    let base = y;
    if (options.drum) {
      kit.add(root, new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, options.drum, 12), kit.cylinderMaterials(palette.cream, "arches", radius, options.drum), [x, base + options.drum / 2, z], { edgeAngle: 40 });
      base += options.drum;
    }
    const scaleY = options.scaleY ?? 1;
    kit.add(root, new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), kit.material(color), [x, base, z], { scale: [1, scaleY, 1], edgeAngle: 50 });
    let top = base + radius * scaleY;
    if (options.lantern) {
      kit.add(root, new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, radius * 0.32, 8), kit.material(palette.cream), [x, top + radius * 0.14, z], { edgeAngle: 30 });
      top = this.cone(x, z, top + radius * 0.3, radius * 0.24, radius * 0.4, color);
    }
    return top;
  }

  private mergedMesh(geometries: THREE.BufferGeometry[], color: string) {
    if (geometries.length === 0) {
      return;
    }
    const merged = mergeGeometries(geometries);
    geometries.forEach((geometry) => geometry.dispose());
    if (merged) {
      this.kit.add(this.root, merged, this.kit.material(color), [0, 0, 0], { edgeAngle: 30 });
    }
  }

  // Battlements around the top of a rectangle.
  merlons(x: number, z: number, y: number, width: number, depth: number, color: string, rotation = 0, size = 0.018) {
    const geometries: THREE.BufferGeometry[] = [];
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const addMerlon = (localX: number, localZ: number) => {
      const geometry = new THREE.BoxGeometry(size, size * 1.3, size);
      geometry.rotateY(rotation);
      geometry.translate(x + localX * cos + localZ * sin, y + size * 0.65, z - localX * sin + localZ * cos);
      geometries.push(geometry);
    };
    const countX = Math.max(2, Math.round(width / (size * 2)));
    const countZ = Math.max(2, Math.round(depth / (size * 2)));
    for (let index = 0; index < countX; index += 1) {
      const localX = -width / 2 + size / 2 + (index * (width - size)) / (countX - 1);
      addMerlon(localX, depth / 2 - size / 2);
      addMerlon(localX, -depth / 2 + size / 2);
    }
    for (let index = 1; index < countZ - 1; index += 1) {
      const localZ = -depth / 2 + size / 2 + (index * (depth - size)) / (countZ - 1);
      addMerlon(width / 2 - size / 2, localZ);
      addMerlon(-width / 2 + size / 2, localZ);
    }
    this.mergedMesh(geometries, color);
  }

  roundMerlons(x: number, z: number, y: number, radius: number, color: string, size = 0.016) {
    const geometries: THREE.BufferGeometry[] = [];
    const count = Math.max(6, Math.round((Math.PI * 2 * radius) / (size * 2)));
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const geometry = new THREE.BoxGeometry(size, size * 1.3, size);
      geometry.rotateY(-angle);
      geometry.translate(x + Math.cos(angle) * (radius - size / 2), y + size * 0.65, z + Math.sin(angle) * (radius - size / 2));
      geometries.push(geometry);
    }
    this.mergedMesh(geometries, color);
  }

  // Crenellated wall that follows the terrain between two points.
  wall(from: [number, number], to: [number, number], options: { h: number; t: number; color?: string; merlons?: boolean }) {
    const [x1, z1] = from;
    const [x2, z2] = to;
    const length = Math.hypot(x2 - x1, z2 - z1);
    const rotation = -Math.atan2(z2 - z1, x2 - x1);
    let min = Infinity;
    let max = -Infinity;
    for (let index = 0; index <= 6; index += 1) {
      const height = this.terrain.heightAt(x1 + ((x2 - x1) * index) / 6, z1 + ((z2 - z1) * index) / 6);
      min = Math.min(min, height);
      max = Math.max(max, height);
    }
    const color = options.color ?? palette.stone;
    const base = min - 0.02;
    const height = max - base + options.h;
    const centerX = (x1 + x2) / 2;
    const centerZ = (z1 + z2) / 2;
    this.kit.add(this.root, new THREE.BoxGeometry(length, height, options.t), this.kit.boxMaterials(color, "stone", length, height, options.t), [centerX, base + height / 2, centerZ], {
      rotation: [0, rotation, 0],
    });
    if (options.merlons !== false) {
      this.merlons(centerX, centerZ, base + height, length, options.t, color, rotation, 0.016);
    }
    this.occupy(centerX, centerZ, Math.min(length, 0.2), options.t, 0);
  }

  palm(x: number, z: number, height: number) {
    const { kit, root } = this;
    const groundY = this.terrain.heightAt(x, z);
    const palm = new THREE.Group();
    palm.position.set(x, groundY, z);
    palm.rotation.set(this.range(-0.12, 0.12), this.range(0, Math.PI * 2), this.range(-0.12, 0.12));
    kit.add(palm, new THREE.CylinderGeometry(0.0055, 0.0105, height, 6), kit.material(palette.trunk, "stone", 1, 6), [0, height / 2, 0], { edges: false });

    const leaf = new THREE.Shape();
    leaf.moveTo(0, 0);
    leaf.quadraticCurveTo(0.06, 0.022, 0.13, 0);
    leaf.quadraticCurveTo(0.06, -0.012, 0, 0);
    // The blade lies flat (width along z) and extends along +x; rotating around z makes it droop.
    const leafGeometry = new THREE.ShapeGeometry(leaf, 4);
    leafGeometry.rotateX(Math.PI / 2);
    const leafMaterial = kit.material(palette.leaf, "plain", 1, 1, { doubleSide: true });
    const fronds = 9;
    for (let index = 0; index < fronds; index += 1) {
      const pivot = new THREE.Group();
      pivot.position.y = height;
      pivot.rotation.y = (index / fronds) * Math.PI * 2 + this.random() * 0.4;
      const frond = kit.add(pivot, leafGeometry, leafMaterial, [0, 0, 0], { rotation: [0, 0, -0.3 - this.random() * 0.5], edgeAngle: 1 });
      frond.castShadow = true;
      palm.add(pivot);
    }
    root.add(palm);
    this.occupy(x, z, 0.05, 0.05, 0);
  }

  tree(x: number, z: number, radius: number, color: string = palette.leafDark, options: { squash?: number; fruit?: string; occupy?: boolean } = {}) {
    const { kit, root } = this;
    const groundY = this.terrain.heightAt(x, z);
    kit.add(root, new THREE.CylinderGeometry(radius * 0.14, radius * 0.2, radius * 1.1, 5), kit.material(palette.trunk), [x, groundY + radius * 0.55, z], { edges: false });
    const squash = options.squash ?? 0.9;
    const crownY = groundY + radius * 1.05 + radius * squash * 0.7;
    kit.add(root, new THREE.IcosahedronGeometry(radius, 0), kit.material(color), [x, crownY, z], {
      rotation: [this.random(), this.random(), 0],
      scale: [1, squash, 1],
      edgeAngle: 30,
    });
    if (options.fruit) {
      const fruitGeometry = new THREE.SphereGeometry(radius * 0.16, 6, 4);
      for (let index = 0; index < 5; index += 1) {
        const angle = this.random() * Math.PI * 2;
        kit.add(root, fruitGeometry, kit.material(options.fruit), [x + Math.cos(angle) * radius * 0.8, crownY + this.range(-0.4, 0.4) * radius, z + Math.sin(angle) * radius * 0.8], { edges: false, shadow: false });
      }
    }
    if (options.occupy !== false) {
      this.occupy(x, z, radius * 1.6, radius * 1.6, 0);
    }
  }

  cypress(x: number, z: number, height: number) {
    const groundY = this.terrain.heightAt(x, z);
    this.kit.add(this.root, new THREE.ConeGeometry(height * 0.16, height, 6), this.kit.material(palette.pine), [x, groundY + height / 2, z], { edgeAngle: 30 });
    this.occupy(x, z, height * 0.3, height * 0.3, 0);
  }

  // Standing figure with open arms (Sagrado Corazón, Colom...).
  statue(x: number, z: number, y: number, height: number, color: string = palette.white, armsUp = 0.15) {
    const { kit, root } = this;
    const material = kit.material(color);
    kit.add(root, new THREE.CylinderGeometry(height * 0.07, height * 0.14, height * 0.62, 8), material, [x, y + height * 0.31, z], { edgeAngle: 30 });
    kit.add(root, new THREE.SphereGeometry(height * 0.08, 8, 6), material, [x, y + height * 0.72, z], { edgeAngle: 60 });
    kit.add(root, new THREE.BoxGeometry(height * 0.2, height * 0.055, height * 0.055), material, [x - height * 0.12, y + height * 0.56, z], { rotation: [0, 0, armsUp] });
    kit.add(root, new THREE.BoxGeometry(height * 0.2, height * 0.055, height * 0.055), material, [x + height * 0.12, y + height * 0.56, z], { rotation: [0, 0, -armsUp] });
    return y + height * 0.8;
  }

  glassBox(x: number, z: number, width: number, depth: number, height: number, rotation = 0, tilt = 0, color: string = palette.glass) {
    const groundY = this.ground(x, z, width, depth, rotation).min - 0.01;
    const materials = this.kit.boxMaterials(color, "glass", width, height, depth, color, { transparent: true, opacity: 0.62, roughness: 0.2, doubleSide: true });
    this.kit.add(this.root, new THREE.BoxGeometry(width, height, depth), materials, [x, groundY + height / 2, z], { rotation: [0, rotation, tilt] });
    this.occupy(x, z, width, depth);
    return groundY + height;
  }

  lathe(x: number, z: number, y: number, profile: [number, number][], color: string, segments = 24, kind: TextureKind = "plain") {
    const points = profile.map(([radius, height]) => new THREE.Vector2(radius, height));
    const radius = Math.max(...profile.map(([value]) => value));
    const height = Math.max(...profile.map(([, value]) => value));
    const material = this.kit.material(color, kind, kind === "plain" ? 1 : Math.max(1, Math.round((Math.PI * 2 * radius) / 0.06)), kind === "plain" ? 1 : Math.max(1, Math.round(height / 0.05)));
    this.kit.add(this.root, new THREE.LatheGeometry(points, segments), material, [x, y, z], { edgeAngle: 45 });
    return y + height;
  }

  // Fills free ground with small buildings so each city reads as a dense hillside.
  scatterHouses(options: {
    count: number;
    bounds: [number, number, number, number];
    width?: [number, number];
    height?: [number, number];
    colors: string[];
    roofs: BlockOptions["roof"][];
    roofColors?: string[];
    maxSlope?: number;
    maxGround?: number;
    kinds?: TextureKind[];
  }) {
    const [minX, maxX, minZ, maxZ] = options.bounds;
    let placed = 0;
    for (let attempt = 0; attempt < options.count * 14 && placed < options.count; attempt += 1) {
      const x = this.range(minX, maxX);
      const z = this.range(minZ, maxZ);
      const width = this.range(...(options.width ?? [0.09, 0.17]));
      const depth = this.range(0.08, 0.15);
      const rotation = this.range(-0.18, 0.18);
      if (!this.isFree(x, z, width, depth, 0.008)) {
        continue;
      }
      const ground = this.ground(x, z, width, depth, rotation);
      if (ground.min < -0.002 || ground.max - ground.min > (options.maxSlope ?? 0.12) || ground.max > (options.maxGround ?? 10)) {
        continue;
      }
      const roof = this.pick(options.roofs);
      this.block({
        x,
        z,
        w: width,
        d: depth,
        h: this.range(...(options.height ?? [0.09, 0.2])),
        color: this.pick(options.colors),
        kind: this.pick(options.kinds ?? ["windows"]),
        roof,
        roofColor: this.pick(options.roofColors ?? [palette.teal, palette.tealDark]),
        roofHeight: roof === "mansard" ? 0.05 : undefined,
        rotY: rotation,
      });
      placed += 1;
    }
  }

  // Small houses stepping up the slopes, facing away from the summit like a hill town.
  scatterHillside(options: { count: number; peak: [number, number]; colors: string[]; roofs: BlockOptions["roof"][]; roofColors?: string[]; minGround?: number; maxGround?: number }) {
    let placed = 0;
    for (let attempt = 0; attempt < options.count * 30 && placed < options.count; attempt += 1) {
      const x = this.range(-1.05, 1.05);
      const z = this.range(-0.85, 0.75);
      const groundHeight = this.terrain.heightAt(x, z);
      if (groundHeight < (options.minGround ?? 0.1) || groundHeight > (options.maxGround ?? 10)) {
        continue;
      }
      const rotation = Math.atan2(x - options.peak[0], z - options.peak[1]);
      const width = this.range(0.06, 0.11);
      const depth = this.range(0.05, 0.08);
      if (!this.isFree(x, z, width, depth, 0.004)) {
        continue;
      }
      const ground = this.ground(x, z, width, depth, rotation);
      if (ground.min < -0.002 || ground.max - ground.min > 0.24) {
        continue;
      }
      this.block({
        x,
        z,
        w: width,
        d: depth,
        h: this.range(0.04, 0.09),
        color: this.pick(options.colors),
        kind: "windows",
        roof: this.pick(options.roofs),
        roofColor: this.pick(options.roofColors ?? [palette.teal, palette.tealDark]),
        roofHeight: 0.04,
        rotY: rotation,
      });
      placed += 1;
    }
  }

  scatterGreens(options: { count: number; bounds: [number, number, number, number]; minGround?: number; kinds: ("tree" | "bush" | "cypress" | "pine")[] }) {
    const [minX, maxX, minZ, maxZ] = options.bounds;
    let placed = 0;
    for (let attempt = 0; attempt < options.count * 10 && placed < options.count; attempt += 1) {
      const x = this.range(minX, maxX);
      const z = this.range(minZ, maxZ);
      const ground = this.terrain.heightAt(x, z);
      if (ground < (options.minGround ?? 0.02) || !this.isFree(x, z, 0.05, 0.05, 0)) {
        continue;
      }
      const kind = this.pick(options.kinds);
      if (kind === "cypress") {
        this.cypress(x, z, this.range(0.1, 0.16));
      } else if (kind === "pine") {
        this.tree(x, z, this.range(0.03, 0.05), palette.pine, { squash: 0.6 });
      } else if (kind === "bush") {
        const radius = this.range(0.022, 0.036);
        this.kit.add(this.root, new THREE.IcosahedronGeometry(radius, 0), this.kit.material(this.pick([palette.leafDark, palette.sageDark, palette.leaf])), [x, ground + radius * 0.6, z], {
          scale: [1, 0.8, 1],
          edgeAngle: 30,
        });
        this.occupy(x, z, radius * 2, radius * 2, 0);
      } else {
        this.tree(x, z, this.range(0.028, 0.045), this.pick([palette.leafDark, palette.leaf]));
      }
      placed += 1;
    }
  }
}

function sliceGeometry(geometry: THREE.BufferGeometry, start: number, count: number) {
  const slice = new THREE.BufferGeometry();
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const { itemSize, normalized } = attribute;
    slice.setAttribute(name, new THREE.BufferAttribute((attribute.array as Float32Array).slice(start * itemSize, (start + count) * itemSize), itemSize, normalized));
  }
  return slice;
}

// Bakes every mesh and outline of a finished model into one mesh per material and one line set per
// material, so a city costs a few dozen draw calls instead of thousands. The result looks the same.
export function mergeModel(model: THREE.Object3D, kit: Kit) {
  model.updateMatrixWorld(true);
  const meshes = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const lines = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const add = (buckets: Map<THREE.Material, THREE.BufferGeometry[]>, source: THREE.Material, geometry: THREE.BufferGeometry) => {
    let material = source;
    // Facade tiling is baked into the UVs so every size of window shares one material and texture.
    const map = (source as THREE.MeshStandardMaterial).map;
    const recipe = source.userData.recipe as { color: string; kind: TextureKind; extras: MaterialExtras } | undefined;
    const uv = geometry.attributes.uv;
    if (map && recipe && uv && (map.repeat.x !== 1 || map.repeat.y !== 1)) {
      for (let index = 0; index < uv.count; index += 1) {
        uv.setXY(index, uv.getX(index) * map.repeat.x, uv.getY(index) * map.repeat.y);
      }
      material = kit.material(recipe.color, recipe.kind, 1, 1, recipe.extras);
    }
    const bucket = buckets.get(material);
    if (bucket) {
      bucket.push(geometry);
    } else {
      buckets.set(material, [geometry]);
    }
  };

  model.traverse((object) => {
    if (object instanceof THREE.LineSegments) {
      add(lines, object.material as THREE.Material, object.geometry.clone().applyMatrix4(object.matrixWorld));
    } else if (object instanceof THREE.Mesh) {
      const geometry = (object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()).applyMatrix4(object.matrixWorld);
      if (Array.isArray(object.material)) {
        for (const group of geometry.groups) {
          add(meshes, object.material[group.materialIndex ?? 0], sliceGeometry(geometry, group.start, Math.min(group.count, geometry.attributes.position.count - group.start)));
        }
        geometry.dispose();
      } else {
        add(meshes, object.material, geometry);
      }
    }
  });

  const merged = new THREE.Group();
  meshes.forEach((geometries, material) => {
    const geometry = mergeGeometries(geometries);
    geometries.forEach((part) => part.dispose());
    if (geometry) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      merged.add(mesh);
    }
  });
  lines.forEach((geometries, material) => {
    const geometry = mergeGeometries(geometries);
    geometries.forEach((part) => part.dispose());
    if (geometry) {
      merged.add(new THREE.LineSegments(geometry, material));
    }
  });
  model.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
      object.geometry.dispose();
    }
  });
  return merged;
}
