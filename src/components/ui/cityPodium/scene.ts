import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Kit } from "./kit";
import { buildCity } from "./cities";

export type PodiumPlace = { key: string; city: string; rank: 1 | 2 | 3; status: string; selected: boolean };

// Screen-space position of each podium place, in CSS pixels relative to the canvas.
export type PlaceLayout = { key: string; labelX: number; labelY: number; left: number; width: number; bottom: number };

const blockWidth = 2.5;
const blockDepth = 2.1;
const blockHeight: Record<1 | 2 | 3, number> = { 1: 1.55, 2: 1.1, 3: 0.78 };
const blockX: Record<1 | 2 | 3, number> = { 1: 0, 2: -2.85, 3: 2.85 };

type Tier = { color: string; metalness: number; roughness: number; ink: string; highlight: string };
const neutralTier: Tier = { color: "#90a3ad", metalness: 0.15, roughness: 0.55, ink: "#ffffff", highlight: "rgba(0, 0, 0, 0.18)" };
const medalTiers: Record<1 | 2 | 3, Tier> = {
  1: { color: "#e8c25a", metalness: 0.62, roughness: 0.32, ink: "#5a420c", highlight: "rgba(255, 245, 200, 0.7)" },
  2: { color: "#cfd6dc", metalness: 0.58, roughness: 0.3, ink: "#2f363d", highlight: "rgba(255, 255, 255, 0.75)" },
  3: { color: "#cb8b5f", metalness: 0.58, roughness: 0.34, ink: "#45281a", highlight: "rgba(255, 225, 200, 0.6)" },
};

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

// Rank number and stop status engraved on the front of a block.
function frontLabel(rank: number, status: string, tier: Tier, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = Math.round((512 * height) / width);
  const context = canvas.getContext("2d")!;
  const numberSize = Math.min(canvas.height * 0.62, 300);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `900 ${numberSize}px Inter, system-ui, sans-serif`;
  const numberY = canvas.height * (status ? 0.44 : 0.5);
  context.fillStyle = tier.highlight;
  context.fillText(String(rank), canvas.width / 2, numberY + 3);
  context.fillStyle = tier.ink;
  context.fillText(String(rank), canvas.width / 2, numberY);
  if (status) {
    const statusSize = Math.max(22, Math.min(40, canvas.height * 0.1));
    context.font = `800 ${statusSize}px Inter, system-ui, sans-serif`;
    context.globalAlpha = 0.8;
    context.fillText(status.toUpperCase(), canvas.width / 2, Math.min(canvas.height - statusSize, numberY + numberSize * 0.52 + statusSize));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
      child.geometry.dispose();
    }
  });
}

export function createCityPodiumScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Neutral tone mapping keeps the pastel palette from washing out under the sun.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;

  scene.add(new THREE.HemisphereLight("#fffaf0", "#9db8ad", 0.85));
  const sun = new THREE.DirectionalLight("#fff1d6", 1.9);
  sun.position.set(-5, 9, 7);
  sun.target.position.set(0, 1, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -5;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.012;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.14 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const kit = new Kit();
  const content = new THREE.Group();
  scene.add(content);
  const cityModels = new Map<string, THREE.Group>();
  let places: { key: string; group: THREE.Group; top: number; blocks: THREE.Object3D[] }[] = [];
  const blockResources: { dispose(): void }[] = [];
  let width = 1;
  let height = 1;

  // Models are cached per stop so a reordered ranking reuses them without rebuilding.
  function cityModel(key: string, city: string) {
    const cacheKey = `${key}|${city}`;
    let model = cityModels.get(cacheKey);
    if (!model) {
      model = buildCity(city, kit);
      cityModels.set(cacheKey, model);
    }
    return model;
  }

  function update(nextPlaces: PodiumPlace[], hasDonations: boolean) {
    places.forEach((place) => {
      place.blocks.forEach((block) => {
        disposeObject(block);
        place.group.remove(block);
      });
      content.remove(place.group);
    });
    blockResources.splice(0).forEach((resource) => resource.dispose());

    places = nextPlaces.map((place) => {
      const group = new THREE.Group();
      group.position.x = blockX[place.rank];
      const blockH = blockHeight[place.rank];
      const tier = hasDonations ? medalTiers[place.rank] : neutralTier;
      const material = new THREE.MeshStandardMaterial({
        color: tier.color,
        metalness: tier.metalness,
        roughness: tier.roughness,
        emissive: place.selected ? new THREE.Color(tier.color) : new THREE.Color("#000000"),
        emissiveIntensity: place.selected ? 0.22 : 0,
      });
      const block = new THREE.Mesh(new RoundedBoxGeometry(blockWidth, blockH, blockDepth, 4, 0.07), material);
      block.position.y = blockH / 2;
      block.castShadow = true;
      block.receiveShadow = true;

      const labelWidth = blockWidth * 0.82;
      const labelHeight = Math.min(blockH * 0.82, 1.2);
      const texture = frontLabel(place.rank, place.status, tier, labelWidth, labelHeight);
      const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false });
      const label = new THREE.Mesh(new THREE.PlaneGeometry(labelWidth, labelHeight), labelMaterial);
      label.position.set(0, blockH / 2, blockDepth / 2 + 0.004);
      blockResources.push(material, texture, labelMaterial);

      const model = cityModel(place.key, place.city);
      model.position.set(0, blockH + 0.002, 0);
      group.add(block, label, model);
      content.add(group);
      const top = new THREE.Box3().setFromObject(model).max.y;
      return { key: place.key, group, top, blocks: [block, label] };
    });
  }

  function fitCamera() {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const box = new THREE.Box3().setFromObject(content);
    if (box.isEmpty()) {
      return;
    }
    const corners = [0, 1].flatMap((ix) => [0, 1].flatMap((iy) => [0, 1].map((iz) => new THREE.Vector3(ix ? box.max.x : box.min.x, iy ? box.max.y : box.min.y, iz ? box.max.z : box.min.z))));
    // Leave room at the top for the HTML labels above each city.
    const top = 1 - Math.min(0.5, (width < 560 ? 110 : 150) / height);
    const bottom = -0.96;
    const halfX = 0.96;
    const elevation = 0.42;
    const direction = new THREE.Vector3(0, Math.sin(elevation), Math.cos(elevation));
    const target = box.getCenter(new THREE.Vector3());
    let distance = box.getSize(new THREE.Vector3()).length() * 1.4;
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    for (let iteration = 0; iteration < 8; iteration += 1) {
      camera.position.copy(target).addScaledVector(direction, distance);
      camera.lookAt(target);
      camera.updateMatrixWorld();
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const corner of corners) {
        const projected = corner.clone().project(camera);
        minX = Math.min(minX, projected.x);
        maxX = Math.max(maxX, projected.x);
        minY = Math.min(minY, projected.y);
        maxY = Math.max(maxY, projected.y);
      }
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      target.addScaledVector(right, ((minX + maxX) / 2) * halfHeight * camera.aspect);
      target.addScaledVector(up, ((minY + maxY) / 2 - (top + bottom) / 2) * halfHeight);
      distance *= Math.max((maxX - minX) / (2 * halfX), (maxY - minY) / (top - bottom));
    }
    camera.position.copy(target).addScaledVector(direction, distance);
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }

  function toScreen(point: THREE.Vector3) {
    const projected = point.clone().project(camera);
    return { x: ((projected.x + 1) / 2) * width, y: ((1 - projected.y) / 2) * height };
  }

  function layout(): PlaceLayout[] {
    return places.map(({ key, group, top }) => {
      const box = new THREE.Box3().setFromObject(group);
      let left = Infinity;
      let rightEdge = -Infinity;
      let bottom = -Infinity;
      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
          for (const z of [box.min.z, box.max.z]) {
            const point = toScreen(new THREE.Vector3(x, y, z));
            left = Math.min(left, point.x);
            rightEdge = Math.max(rightEdge, point.x);
            bottom = Math.max(bottom, point.y);
          }
        }
      }
      const label = toScreen(new THREE.Vector3(group.position.x, top + 0.06, 0));
      return { key, labelX: label.x, labelY: label.y, left, width: rightEdge - left, bottom: Math.min(bottom, height) };
    });
  }

  function render() {
    renderer.render(scene, camera);
  }

  return {
    update(nextPlaces: PodiumPlace[], hasDonations: boolean) {
      update(nextPlaces, hasDonations);
      fitCamera();
      render();
      return layout();
    },
    resize(nextWidth: number, nextHeight: number) {
      if (Math.max(1, nextWidth) === width && Math.max(1, nextHeight) === height) {
        return layout();
      }
      width = Math.max(1, nextWidth);
      height = Math.max(1, nextHeight);
      renderer.setSize(width, height, false);
      fitCamera();
      render();
      return layout();
    },
    dispose() {
      places.forEach((place) => place.blocks.forEach(disposeObject));
      blockResources.forEach((resource) => resource.dispose());
      cityModels.forEach(disposeObject);
      kit.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      environment.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
