import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { normalizeCity } from "../../../data/spainMap";
import { CityBuilder, Kit, Terrain, mergeModel, palette, seededRandom, type BlockOptions, type Bump } from "./kit";

// Each city is a terraced hill crowned by its landmark, with buildings climbing the slopes,
// following the style of the original illustrations. Units: the hill sits on a 2.36 x 1.96 base.
const baseWidth = 2.36;
const baseDepth = 1.96;

type Point = [number, number];

function ellipse(centerX: number, centerZ: number, radiusX: number, radiusZ: number, count: number, offset = 0): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = offset + (index / count) * Math.PI * 2;
    return [centerX + Math.cos(angle) * radiusX, centerZ + Math.sin(angle) * radiusZ];
  });
}

function castle(builder: CityBuilder, points: Point[], options: { wallHeight: number; towerHeight: number; towerSize: number; closed?: boolean }) {
  const segments = options.closed === false ? points.length - 1 : points.length;
  for (let index = 0; index < segments; index += 1) {
    builder.wall(points[index], points[(index + 1) % points.length], { h: options.wallHeight, t: 0.026 });
  }
  points.forEach(([x, z], index) => {
    builder.block({ x, z, w: options.towerSize, d: options.towerSize, h: options.towerHeight + (index % 3) * 0.025, color: palette.stone, kind: "slits", roof: "none", merlons: true });
  });
}

// Tall finished spire: tapering octagonal tower, cone and a coloured finial.
function spire(builder: CityBuilder, x: number, z: number, y: number, height: number, radius: number, finial: string) {
  const top = builder.cylinder({ x, z, y, r: radius, rTop: radius * 0.5, h: height, segments: 8, color: palette.stone, kind: "slits", occupy: false });
  const tip = builder.cone(x, z, top, radius * 0.5, height * 0.2, palette.stone, 8);
  builder.kit.add(builder.root, new THREE.SphereGeometry(radius * 0.38, 8, 6), builder.kit.material(finial), [x, tip + radius * 0.2, z], { edgeAngle: 60 });
}

function lamp(builder: CityBuilder, x: number, z: number) {
  const ground = builder.terrain.heightAt(x, z);
  builder.kit.add(builder.root, new THREE.CylinderGeometry(0.003, 0.004, 0.1, 5), builder.kit.material(palette.tealDark), [x, ground + 0.05, z], { edges: false });
  builder.kit.add(builder.root, new THREE.SphereGeometry(0.011, 8, 6), builder.kit.material(palette.white), [x, ground + 0.105, z], { edgeAngle: 60 });
}

function malaga(builder: CityBuilder) {
  // Alcazaba and Gibralfaro crowning the hill, with the coracha walls running down the slope.
  castle(builder, ellipse(-0.24, -0.42, 0.4, 0.25, 7, 0.4), { wallHeight: 0.075, towerHeight: 0.12, towerSize: 0.068 });
  builder.block({ x: -0.2, z: -0.44, w: 0.12, d: 0.11, h: 0.24, color: palette.stone, kind: "slits", roof: "none", merlons: true });
  builder.block({ x: -0.38, z: -0.36, w: 0.13, d: 0.09, h: 0.08, color: palette.cream, kind: "arches", roof: "gable", roofColor: palette.teal, roofHeight: 0.05 });
  castle(builder, [[-0.6, -0.3], [-0.78, -0.06], [-0.74, 0.18], [-0.52, 0.3]], { wallHeight: 0.065, towerHeight: 0.09, towerSize: 0.058, closed: false });

  // Cathedral "La Manquita": one finished tower and the unfinished stump.
  const cathedralX = 0.42;
  const cathedralZ = 0.24;
  const body = builder.block({ x: cathedralX, z: cathedralZ - 0.03, w: 0.46, d: 0.3, h: 0.2, color: palette.cream, kind: "arches", roof: "parapet" });
  builder.dome(cathedralX, cathedralZ - 0.09, body, 0.07, palette.teal, { drum: 0.05, lantern: true });
  builder.dome(cathedralX - 0.15, cathedralZ - 0.09, body, 0.04, palette.teal);
  builder.dome(cathedralX + 0.15, cathedralZ - 0.09, body, 0.04, palette.teal);
  builder.block({ x: cathedralX, z: cathedralZ + 0.13, w: 0.2, d: 0.05, h: 0.24, color: palette.cream, kind: "arches", roof: "gable", roofColor: palette.cream, roofHeight: 0.06 });
  let tower = builder.block({ x: cathedralX + 0.19, z: cathedralZ + 0.1, w: 0.11, d: 0.11, h: 0.44, color: palette.cream, kind: "arches", roof: "parapet" });
  tower = builder.block({ x: cathedralX + 0.19, z: cathedralZ + 0.1, y: tower, w: 0.09, d: 0.09, h: 0.08, color: palette.cream, kind: "arches", roof: "none" });
  tower = builder.cylinder({ x: cathedralX + 0.19, z: cathedralZ + 0.1, y: tower, r: 0.04, h: 0.06, color: palette.cream, kind: "arches" });
  builder.dome(cathedralX + 0.19, cathedralZ + 0.1, tower, 0.04, palette.teal, { lantern: true });
  builder.block({ x: cathedralX - 0.19, z: cathedralZ + 0.1, w: 0.11, d: 0.11, h: 0.3, color: palette.cream, kind: "arches", roof: "parapet" });

  // La Farola lighthouse on the port.
  const base = builder.block({ x: 0.98, z: 0.74, w: 0.1, d: 0.1, h: 0.05, color: palette.white, kind: "plain", roof: "parapet" });
  let light = builder.cylinder({ x: 0.98, z: 0.74, y: base, r: 0.032, rTop: 0.024, h: 0.3, color: palette.white, segments: 10 });
  light = builder.cylinder({ x: 0.98, z: 0.74, y: light, r: 0.036, h: 0.012, color: palette.tealDark, segments: 10 });
  light = builder.cylinder({ x: 0.98, z: 0.74, y: light, r: 0.02, h: 0.035, color: palette.glass, segments: 8 });
  builder.dome(0.98, 0.74, light, 0.022, palette.teal);

  // Aduana palace and the town hall with its turrets.
  builder.block({ x: -0.5, z: 0.55, w: 0.34, d: 0.24, h: 0.15, color: palette.salmon, kind: "windows", roof: "hip", roofColor: palette.teal, roofHeight: 0.07 });
  const townHall = builder.block({ x: -0.04, z: 0.6, w: 0.28, d: 0.15, h: 0.15, color: palette.cream, kind: "windows", roof: "parapet" });
  for (const offset of [-0.12, 0.12]) {
    const turret = builder.cylinder({ x: -0.04 + offset, z: 0.66, y: townHall, r: 0.022, h: 0.05, color: palette.cream, kind: "arches" });
    builder.cone(-0.04 + offset, 0.66, turret, 0.026, 0.05, palette.teal);
  }

  for (const [x, z, height] of [[-1.02, 0.84, 0.28], [-0.8, 0.88, 0.24], [-0.24, 0.87, 0.3], [0.2, 0.86, 0.26], [0.64, 0.88, 0.3], [0.82, 0.48, 0.22]]) {
    builder.palm(x, z, height);
  }
  builder.scatterHillside({ count: 48, peak: [-0.24, -0.44], colors: [palette.white, palette.cream, palette.white], roofs: ["parapet", "flat", "gable"], maxGround: 1.05 });
  builder.scatterGreens({ count: 40, bounds: [-1.1, 0.3, -0.95, 0.15], minGround: 0.18, kinds: ["pine", "pine", "bush", "cypress"] });
  builder.scatterHouses({
    count: 80,
    bounds: [-1.08, 1.06, -0.88, 0.72],
    width: [0.07, 0.13],
    height: [0.06, 0.14],
    colors: [palette.white, palette.cream, palette.white, palette.salmon],
    roofs: ["parapet", "parapet", "flat", "gable", "hip"],
    maxSlope: 0.13,
  });
  builder.scatterGreens({ count: 18, bounds: [-1.1, 1.1, -0.9, 0.7], kinds: ["bush", "tree"] });
}

// La Concha bay seen from the sea: Urgull on the left, Igueldo on the right and Santa Clara in the mouth.
const concha = { x: 0.08, z: 0.5, rx: 0.68, rz: 0.48 };
const conchaWater = -0.03;

const smooth = (edge0: number, edge1: number, value: number) => {
  const amount = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
};

function conchaCarve(x: number, z: number) {
  const dx = (x - concha.x) / concha.rx;
  const dz = (z - concha.z) / concha.rz;
  const bay = 1 - Math.sqrt(dx * dx + dz * dz);
  const mouth = Math.min((z - 0.78) / 0.16, 1 - Math.abs(x - concha.x) / 0.52);
  const openSea = (z - 0.9) / 0.07;
  const sea = Math.max(bay, mouth * 0.7, openSea);
  return sea > 0 ? -0.1 * smooth(0, 0.22, sea) : 0;
}

// Point on the bay's shell curve, scaled outwards from the shoreline.
function conchaArc(scale: number, from: number, to: number, count: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = from + ((to - from) * index) / (count - 1);
    return [concha.x + Math.cos(angle) * concha.rx * scale, concha.z + Math.sin(angle) * concha.rz * scale];
  });
}

// Offset from a rotated building's centre along its own axes.
function local(x: number, z: number, rotation: number, offsetX: number, offsetZ = 0): Point {
  return [x + offsetX * Math.cos(rotation) + offsetZ * Math.sin(rotation), z - offsetX * Math.sin(rotation) + offsetZ * Math.cos(rotation)];
}

function forest(builder: CityBuilder, center: Point, radius: number, count: number) {
  for (let index = 0; index < count; index += 1) {
    const angle = builder.range(0, Math.PI * 2);
    const distance = Math.sqrt(builder.random()) * radius;
    const x = center[0] + Math.cos(angle) * distance;
    const z = center[1] + Math.sin(angle) * distance * 0.9;
    if (builder.terrain.heightAt(x, z) > 0.06 && builder.isFree(x, z, 0.03, 0.03, 0)) {
      builder.tree(x, z, builder.range(0.034, 0.055), builder.pick([palette.pine, palette.leafDark, palette.leaf]), { squash: builder.range(0.6, 0.9), occupy: false });
    }
  }
}

// La Concha's white railing, following the promenade and stopping where the hills begin.
function railingPath(builder: CityBuilder, points: Point[]) {
  const geometries: THREE.BufferGeometry[] = [];
  const height = (point: Point) => builder.terrain.heightAt(point[0], point[1]);
  const onPromenade = (point: Point) => height(point) <= 0.02 && height(point) >= -0.004;
  points.forEach((point, index) => {
    if (!onPromenade(point)) {
      return;
    }
    const post = new THREE.BoxGeometry(0.006, 0.034, 0.006);
    post.translate(point[0], height(point) + 0.017, point[1]);
    geometries.push(post);
    const next = points[index + 1];
    if (next && onPromenade(next)) {
      const rail = new THREE.BoxGeometry(Math.hypot(next[0] - point[0], next[1] - point[1]), 0.007, 0.008);
      rail.rotateY(-Math.atan2(next[1] - point[1], next[0] - point[0]));
      rail.translate((point[0] + next[0]) / 2, (height(point) + height(next)) / 2 + 0.034, (point[1] + next[1]) / 2);
      geometries.push(rail);
    }
  });
  const merged = geometries.length > 0 ? mergeGeometries(geometries) : null;
  geometries.forEach((geometry) => geometry.dispose());
  if (merged) {
    builder.kit.add(builder.root, merged, builder.kit.material(palette.white), [0, 0, 0], { edgeAngle: 30 });
  }
}

function boat(builder: CityBuilder, x: number, z: number, rotation: number) {
  const { kit, root } = builder;
  const group = new THREE.Group();
  group.position.set(x, conchaWater + 0.004, z);
  group.rotation.y = rotation;
  kit.add(group, new THREE.BoxGeometry(0.07, 0.014, 0.024), kit.material(palette.white), [0, 0.004, 0], { edgeAngle: 30 });
  kit.add(group, new THREE.BoxGeometry(0.07, 0.004, 0.026), kit.material(palette.teal), [0, -0.003, 0], { edges: false });
  kit.add(group, new THREE.CylinderGeometry(0.0015, 0.0015, 0.075, 4), kit.material(palette.trunk), [0.005, 0.048, 0], { edges: false });
  const sail = new THREE.Shape();
  sail.moveTo(0, 0);
  sail.lineTo(0, 0.065);
  sail.lineTo(0.042, 0);
  sail.closePath();
  kit.add(group, new THREE.ShapeGeometry(sail), kit.material(palette.white, "plain", 1, 1, { doubleSide: true }), [0.007, 0.014, 0], { edgeAngle: 1 });
  root.add(group);
}

// Straight track up Igueldo with the little red car, lifted so it never cuts into the terraces.
function funicular(builder: CityBuilder, from: Point, to: Point) {
  const { kit, root, terrain } = builder;
  const start = new THREE.Vector3(from[0], terrain.heightAt(from[0], from[1]), from[1]);
  const end = new THREE.Vector3(to[0], terrain.heightAt(to[0], to[1]), to[1]);
  let lift = 0;
  for (let step = 0; step <= 20; step += 1) {
    const point = start.clone().lerp(end, step / 20);
    lift = Math.max(lift, terrain.heightAt(point.x, point.z) - point.y);
  }
  start.y += lift + 0.012;
  end.y += lift + 0.012;
  const track = kit.add(root, new THREE.BoxGeometry(0.014, 0.006, start.distanceTo(end)), kit.material(palette.stone), [(start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2], { edgeAngle: 30 });
  track.lookAt(end);
  const carPosition = start.clone().lerp(end, 0.45);
  const car = kit.add(root, new THREE.BoxGeometry(0.026, 0.022, 0.036), kit.material("#c4533f"), [carPosition.x, carPosition.y + 0.014, carPosition.z], { edgeAngle: 30 });
  car.lookAt(end.x, carPosition.y + 0.014 + (end.y - start.y) * 0.1, end.z);
}

function peineDelViento(builder: CityBuilder, spots: Point[]) {
  const { kit, root } = builder;
  spots.forEach(([x, z], index) => {
    const base = Math.max(builder.terrain.heightAt(x, z), conchaWater);
    kit.add(root, new THREE.IcosahedronGeometry(0.026, 0), kit.material("#8f9c98"), [x, base + 0.006, z], { scale: [1.2, 0.7, 1], edgeAngle: 30 });
    kit.add(root, new THREE.TorusGeometry(0.016, 0.0032, 4, 10, Math.PI * 1.4), kit.material("#5b4a3d"), [x, base + 0.034, z], { rotation: [0, index * 0.9, 0.4], edgeAngle: 40 });
  });
}

function donosti(builder: CityBuilder) {
  const urgull: Point = [-0.7, 0.5];
  const igueldo: Point = [0.9, 0.42];

  // Monte Urgull: Castillo de la Mota and the Sagrado Corazón above a wooded hill.
  castle(builder, ellipse(urgull[0], urgull[1], 0.15, 0.11, 6, 0.3), { wallHeight: 0.06, towerHeight: 0.08, towerSize: 0.05 });
  let statue = builder.block({ x: urgull[0], z: urgull[1], w: 0.1, d: 0.1, h: 0.07, color: palette.stone, kind: "stone", roof: "none", merlons: true });
  statue = builder.block({ x: urgull[0], z: urgull[1], y: statue, w: 0.065, d: 0.065, h: 0.22, color: palette.white, kind: "plain", roof: "none" });
  statue = builder.block({ x: urgull[0], z: urgull[1], y: statue, w: 0.08, d: 0.08, h: 0.02, color: palette.white, kind: "plain", roof: "none" });
  builder.statue(urgull[0], urgull[1], statue, 0.24, palette.white, 0.25);
  // Fortification walls zigzagging down Urgull's slope towards the bay.
  const ramparts = ellipse(urgull[0], urgull[1], 0.27, 0.25, 9, -0.2).slice(0, 5);
  for (let index = 0; index < ramparts.length - 1; index += 1) {
    builder.wall(ramparts[index], ramparts[index + 1], { h: 0.04, t: 0.022 });
  }

  // Monte Igueldo: the old lighthouse tower, the funicular and the park buildings.
  builder.cylinder({ x: igueldo[0] + 0.02, z: igueldo[1] - 0.02, r: 0.05, h: 0.17, segments: 12, color: palette.stone, kind: "slits", merlons: true });
  builder.block({ x: igueldo[0] - 0.13, z: igueldo[1] - 0.05, w: 0.13, d: 0.08, h: 0.06, color: palette.white, kind: "windows", roof: "gable", roofColor: palette.tealDark, roofHeight: 0.04 });
  builder.block({ x: igueldo[0] + 0.1, z: igueldo[1] + 0.09, w: 0.08, d: 0.06, h: 0.05, color: palette.salmon, kind: "windows", roof: "hip", roofColor: palette.tealDark });
  funicular(builder, [igueldo[0] - 0.34, igueldo[1] - 0.2], [igueldo[0] - 0.1, igueldo[1] - 0.04]);
  peineDelViento(builder, [[1.02, 0.9], [1.1, 0.85], [0.94, 0.93]]);

  // Isla de Santa Clara with the lighthouse keeper's house.
  builder.block({ x: 0.125, z: 0.845, w: 0.05, d: 0.04, h: 0.03, color: palette.white, kind: "windows", roof: "gable", roofColor: palette.teal, roofHeight: 0.025 });
  const lighthouse = builder.cylinder({ x: 0.075, z: 0.835, r: 0.013, h: 0.06, color: palette.white, segments: 10 });
  builder.cone(0.075, 0.835, lighthouse, 0.016, 0.022, palette.teal, 10);
  builder.tree(0.16, 0.82, 0.022, palette.pine, { squash: 0.7 });
  builder.tree(0.04, 0.865, 0.02, palette.leafDark, { squash: 0.7 });
  builder.tree(0.15, 0.875, 0.018, palette.leaf, { squash: 0.7 });

  // Town hall (former casino) at the end of the beach, Palacio de Miramar and La Perla on the sand.
  const hallX = -0.36;
  const hallZ = 0.12;
  const hallRotation = Math.atan2(concha.x - hallX, concha.z - hallZ);
  builder.block({ x: hallX, z: hallZ, w: 0.36, d: 0.16, h: 0.16, color: palette.white, kind: "windows", roof: "parapet", rotY: hallRotation });
  for (const offset of [-0.16, 0.16]) {
    const [x, z] = local(hallX, hallZ, hallRotation, offset);
    const corner = builder.block({ x, z, w: 0.08, d: 0.08, h: 0.23, color: palette.white, kind: "windows", roof: "none", rotY: hallRotation });
    builder.dome(x, z, corner, 0.04, palette.tealDark, { lantern: true });
  }
  const miramarRotation = Math.atan2(concha.x - 0.52, concha.z - 0.04);
  builder.block({ x: 0.52, z: 0.04, w: 0.18, d: 0.1, h: 0.08, color: palette.cream, kind: "windows", roof: "gable", roofColor: palette.tealDark, roofHeight: 0.06, rotY: miramarRotation });
  const [towerX, towerZ] = local(0.52, 0.04, miramarRotation, 0.1);
  builder.block({ x: towerX, z: towerZ, w: 0.05, d: 0.05, h: 0.13, color: palette.cream, kind: "windows", roof: "hip", roofColor: palette.tealDark, roofHeight: 0.05, rotY: miramarRotation });
  builder.block({ x: 0.08, z: 0.075, w: 0.13, d: 0.05, h: 0.045, color: palette.white, kind: "windows", roof: "parapet" });

  // La Concha promenade: railing, lamps, tamarisks and the belle époque buildings facing the bay.
  railingPath(builder, conchaArc(1.1, Math.PI * 1.05, Math.PI * 1.95, 54));
  conchaArc(1.1, Math.PI * 1.15, Math.PI * 1.85, 7).forEach(([x, z]) => {
    if (builder.terrain.heightAt(x, z) < 0.02) {
      lamp(builder, x, z);
    }
  });
  conchaArc(1.24, Math.PI * 1.12, Math.PI * 1.88, 9).forEach(([x, z]) => {
    if (builder.terrain.heightAt(x, z) < 0.02 && builder.isFree(x, z, 0.06, 0.06, 0)) {
      builder.tree(x, z, 0.032, palette.sage, { squash: 0.55 });
    }
  });
  conchaArc(1.48, Math.PI * 1.2, Math.PI * 1.8, 9).forEach(([x, z], index) => {
    if (index === 0 || index === 7 || !builder.isFree(x, z, 0.13, 0.1, 0)) {
      return;
    }
    builder.block({
      x,
      z,
      w: 0.13,
      d: 0.1,
      h: builder.range(0.16, 0.24),
      color: builder.pick([palette.white, palette.cream, palette.salmon]),
      kind: "windows",
      roof: "mansard",
      roofColor: builder.pick([palette.tealDark, palette.slate]),
      roofHeight: 0.05,
      rotY: Math.atan2(concha.x - x, concha.z - z),
    });
  });

  // Catedral del Buen Pastor rising over the city centre.
  builder.block({ x: 0.1, z: -0.52, w: 0.24, d: 0.38, h: 0.2, color: palette.stone, kind: "arches", roof: "gable", roofColor: palette.tealDark, roofHeight: 0.1 });
  let tower = builder.block({ x: 0.1, z: -0.3, w: 0.11, d: 0.11, h: 0.42, color: palette.stone, kind: "slits", roof: "none" });
  tower = builder.block({ x: 0.1, z: -0.3, y: tower, w: 0.09, d: 0.09, h: 0.07, color: palette.stone, kind: "arches", roof: "none" });
  builder.cone(0.1, -0.3, tower, 0.066, 0.3, palette.stone, 4, Math.PI / 4);
  for (const [dx, dz] of [[-0.045, -0.045], [0.045, -0.045], [-0.045, 0.045], [0.045, 0.045]]) {
    builder.cone(0.1 + dx, -0.3 + dz, tower, 0.012, 0.07, palette.stone, 4);
  }

  // Woods on both hills, the old town at Urgull's foot and the city centre behind the beach.
  forest(builder, urgull, 0.44, 260);
  forest(builder, igueldo, 0.4, 180);
  builder.scatterHouses({
    count: 22,
    bounds: [-0.98, -0.3, -0.42, 0.16],
    width: [0.07, 0.11],
    height: [0.12, 0.2],
    colors: [palette.white, palette.cream, palette.salmon],
    roofs: ["gable", "gable", "hip"],
    maxSlope: 0.13,
  });
  builder.scatterHouses({
    count: 70,
    bounds: [-1.08, 1.08, -0.95, 0.05],
    width: [0.1, 0.16],
    height: [0.14, 0.24],
    colors: [palette.white, palette.cream, palette.cream, palette.salmon],
    roofs: ["mansard", "mansard", "hip", "gable"],
    roofColors: [palette.tealDark, palette.slate],
    maxSlope: 0.13,
  });
  builder.scatterHillside({ count: 12, peak: igueldo, colors: [palette.white, palette.cream], roofs: ["hip", "gable"], roofColors: [palette.tealDark], maxGround: 0.45 });

  // Sailing boats in the bay.
  for (const [x, z, rotation] of [[-0.12, 0.6, 0.4], [0.3, 0.56, -0.6], [0.26, 0.7, 1.3], [-0.04, 0.73, 2.4]]) {
    boat(builder, x, z, rotation);
  }
}

function madrid(builder: CityBuilder) {
  const { kit, root } = builder;
  // Palacio de Cibeles on the summit.
  const palace = builder.block({ x: 0.05, z: -0.38, w: 0.46, d: 0.26, h: 0.16, color: palette.white, kind: "windows", roof: "parapet" });
  for (const [dx, dz] of [[-0.21, -0.11], [0.21, -0.11], [-0.21, 0.11], [0.21, 0.11]]) {
    const turret = builder.cylinder({ x: 0.05 + dx, z: -0.38 + dz, y: palace, r: 0.024, h: 0.07, color: palette.white, kind: "windows" });
    builder.cone(0.05 + dx, -0.38 + dz, turret, 0.028, 0.06, palette.slate);
  }
  let tower = builder.block({ x: 0.05, z: -0.38, y: palace, w: 0.12, d: 0.12, h: 0.22, color: palette.white, kind: "windows", roof: "none" });
  tower = builder.block({ x: 0.05, z: -0.38, y: tower, w: 0.085, d: 0.085, h: 0.08, color: palette.white, kind: "arches", roof: "none" });
  builder.cone(0.05, -0.38, tower, 0.062, 0.14, palette.slate, 4, Math.PI / 4);
  for (const offset of [-0.14, 0.14]) {
    const side = builder.block({ x: 0.05 + offset, z: -0.3, y: palace, w: 0.06, d: 0.06, h: 0.1, color: palette.white, kind: "windows", roof: "none" });
    builder.cone(0.05 + offset, -0.3, side, 0.043, 0.08, palette.slate, 4, Math.PI / 4);
  }

  // Almudena cathedral and the Royal Palace on the left hill.
  const almudena = builder.block({ x: -0.62, z: -0.56, w: 0.3, d: 0.22, h: 0.15, color: palette.stone, kind: "arches", roof: "parapet" });
  builder.dome(-0.62, -0.58, almudena, 0.085, palette.slate, { drum: 0.07, lantern: true });
  for (const offset of [-0.11, 0.11]) {
    const front = builder.block({ x: -0.62 + offset, z: -0.46, y: almudena, w: 0.05, d: 0.05, h: 0.08, color: palette.stone, kind: "arches", roof: "none" });
    builder.dome(-0.62 + offset, -0.46, front, 0.025, palette.slate);
  }
  builder.block({ x: -0.8, z: 0.3, w: 0.36, d: 0.14, h: 0.13, color: palette.white, kind: "windows", roof: "parapet" });

  // Real Casa de Correos (Puerta del Sol) with its clock.
  const post = builder.block({ x: -0.24, z: 0.24, w: 0.28, d: 0.16, h: 0.13, color: "#dda27c", kind: "windows", roof: "parapet" });
  const clock = builder.block({ x: -0.24, z: 0.28, y: post, w: 0.06, d: 0.05, h: 0.07, color: palette.white, kind: "plain", roof: "none" });
  builder.dome(-0.24, 0.28, clock, 0.026, palette.slate);
  kit.add(root, new THREE.CylinderGeometry(0.016, 0.016, 0.004, 16), kit.material(palette.cream), [-0.24, post + 0.036, 0.306], { rotation: [Math.PI / 2, 0, 0], edgeAngle: 40 });

  // Puerta de Alcalá.
  const gate = builder.block({ x: -0.56, z: 0.62, w: 0.36, d: 0.07, h: 0.15, color: palette.stone, kind: "arches", roof: "parapet" });
  builder.block({ x: -0.56, z: 0.62, y: gate, w: 0.15, d: 0.06, h: 0.05, color: palette.stone, kind: "plain", roof: "gable", roofColor: palette.stone, roofHeight: 0.035 });

  // Edificio Metrópolis with its dome and the golden Victory.
  let metropolis = builder.cylinder({ x: 0.08, z: 0.56, r: 0.085, h: 0.26, segments: 12, color: palette.white, kind: "windows" });
  metropolis = builder.cylinder({ x: 0.08, z: 0.56, y: metropolis, r: 0.06, h: 0.04, segments: 12, color: palette.white, kind: "arches" });
  metropolis = builder.dome(0.08, 0.56, metropolis, 0.06, palette.slate, { scaleY: 1.1 });
  builder.statue(0.08, 0.56, metropolis, 0.06, palette.gold, 0.7);
  builder.block({ x: 0.24, z: 0.5, w: 0.16, d: 0.12, h: 0.22, color: palette.white, kind: "windows", roof: "parapet" });

  // Torres KIO leaning towards each other.
  for (const [x, lean] of [[0.62, -0.26], [0.88, 0.26]]) {
    const geometry = new THREE.BoxGeometry(0.09, 0.42, 0.09);
    geometry.translate(0, 0.21, 0);
    kit.add(root, geometry, kit.boxMaterials("#a9c5cf", "glass", 0.09, 0.42, 0.09, palette.slate), [x, builder.terrain.heightAt(x, 0.6), 0.6], { rotation: [0, 0, lean] });
    builder.occupy(x, 0.6, 0.14, 0.12);
  }

  // Cuatro Torres rising behind the hill.
  const skyline: [number, number, number, string][] = [[0.72, -0.66, 0.82, "#a9c6cf"], [0.9, -0.56, 0.94, "#b8d0d8"], [0.58, -0.84, 0.76, "#9fbcc6"], [1.04, -0.76, 0.86, "#c3d8de"]];
  skyline.forEach(([x, z, height, color], index) => {
    const top = builder.block({ x, z, w: 0.085, d: 0.085, h: height, color, kind: "glass", roof: "none" });
    if (index === 1) {
      builder.block({ x, z, y: top, w: 0.07, d: 0.07, h: 0.03, color: palette.leaf, kind: "plain", roof: "none" });
    } else if (index === 3) {
      builder.cone(x, z, top, 0.02, 0.08, palette.slate, 4);
    }
  });

  // El Oso y el Madroño.
  const pedestal = builder.block({ x: -0.06, z: 0.86, w: 0.07, d: 0.07, h: 0.03, color: palette.stone, kind: "plain", roof: "none" });
  builder.tree(-0.03, 0.85, 0.035, palette.leafDark, { fruit: "#c4533f" });
  kit.add(root, new THREE.BoxGeometry(0.03, 0.026, 0.045), kit.material("#7a6150"), [-0.075, pedestal + 0.013, 0.86], {});
  kit.add(root, new THREE.SphereGeometry(0.014, 8, 6), kit.material("#7a6150"), [-0.075, pedestal + 0.034, 0.885], { edgeAngle: 60 });

  builder.scatterHillside({ count: 48, peak: [0.05, -0.38], colors: [palette.white, palette.cream, palette.salmon], roofs: ["mansard", "parapet", "hip"], roofColors: [palette.slate, palette.tealDark], maxGround: 1.0 });
  builder.scatterHouses({
    count: 72,
    bounds: [-1.08, 1.08, -0.9, 0.72],
    width: [0.1, 0.17],
    height: [0.12, 0.22],
    colors: [palette.white, palette.cream, palette.salmon, "#f3dfc6"],
    roofs: ["mansard", "parapet", "hip", "mansard"],
    roofColors: [palette.slate, palette.tealDark],
    maxSlope: 0.13,
  });
  builder.scatterGreens({ count: 28, bounds: [-1.1, 1.1, -0.95, 0.8], minGround: 0, kinds: ["tree", "tree", "bush"] });
}

function valencia(builder: CityBuilder) {
  const { kit, root } = builder;
  // Cathedral with its octagonal lantern and the Miguelete bell tower.
  const cathedral = builder.block({ x: 0.05, z: -0.38, w: 0.34, d: 0.24, h: 0.16, color: palette.stone, kind: "arches", roof: "parapet" });
  const lantern = builder.cylinder({ x: 0.1, z: -0.4, y: cathedral, r: 0.07, h: 0.07, segments: 8, color: palette.stone, kind: "arches" });
  builder.cone(0.1, -0.4, lantern, 0.075, 0.05, palette.teal, 8);
  let miguelete = builder.cylinder({ x: -0.18, z: -0.3, r: 0.06, h: 0.5, segments: 8, color: palette.stone, kind: "slits" });
  miguelete = builder.cylinder({ x: -0.18, z: -0.3, y: miguelete, r: 0.064, h: 0.07, segments: 8, color: palette.stone, kind: "arches" });
  miguelete = builder.cylinder({ x: -0.18, z: -0.3, y: miguelete, r: 0.026, h: 0.07, segments: 8, color: palette.stone, kind: "arches" });
  builder.cone(-0.18, -0.3, miguelete, 0.03, 0.04, palette.teal, 8);

  // Torres de Serranos.
  for (const x of [-0.76, -0.48]) {
    builder.cylinder({ x, z: 0.56, r: 0.085, h: 0.3, segments: 5, color: palette.stone, kind: "stone", merlons: true });
  }
  builder.block({ x: -0.62, z: 0.56, w: 0.2, d: 0.12, h: 0.24, color: palette.stone, kind: "arches", roof: "none", merlons: true });

  // Mercado Central.
  const market = builder.block({ x: 0.42, z: 0.02, w: 0.32, d: 0.22, h: 0.12, color: palette.cream, kind: "arches", roof: "gable", roofColor: palette.teal, roofHeight: 0.07, rotY: Math.PI / 2 });
  builder.dome(0.42, 0.02, market + 0.05, 0.06, palette.teal, { lantern: true });

  // Ciutat de les Arts i les Ciències: pool, Hemisfèric, Palau de les Arts and L'Umbracle.
  kit.add(root, new THREE.BoxGeometry(0.82, 0.012, 0.34), kit.material(palette.water, "plain", 1, 1, { transparent: true, opacity: 0.9, roughness: 0.3 }), [0.6, 0.006, 0.66], { edgeAngle: 30 });
  builder.occupy(0.6, 0.66, 0.82, 0.34, 0);
  kit.add(root, new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), kit.material(palette.white), [0.5, 0.012, 0.66], { scale: [0.2, 0.085, 0.11], edgeAngle: 50 });
  kit.add(root, new THREE.SphereGeometry(0.028, 12, 8), kit.material(palette.slate), [0.5, 0.04, 0.75], { edgeAngle: 60 });
  kit.add(root, new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), kit.material(palette.white), [0.92, 0.012, 0.56], { scale: [0.1, 0.26, 0.13], edgeAngle: 50 });
  kit.add(root, new THREE.TorusGeometry(0.2, 0.008, 6, 24, Math.PI * 0.85), kit.material(palette.white), [0.9, 0.03, 0.56], { rotation: [0, Math.PI / 2, 0.25], edgeAngle: 50 });
  for (let index = 0; index < 6; index += 1) {
    kit.add(root, new THREE.TorusGeometry(0.04, 0.004, 4, 12, Math.PI), kit.material(palette.white), [0.24 + index * 0.07, 0.0, 0.88], { edgeAngle: 40 });
  }

  for (const [x, z, height] of [[-1.0, 0.82, 0.28], [-0.3, 0.86, 0.26], [0.02, 0.84, 0.3], [0.28, 0.4, 0.24], [1.06, 0.86, 0.26], [-0.96, 0.2, 0.22]]) {
    builder.palm(x, z, height);
  }
  for (const [x, z] of [[-0.86, 0.86], [-0.16, 0.84], [-0.06, 0.62], [-0.98, 0.5], [0.18, 0.66], [-0.36, 0.64]]) {
    builder.tree(x, z, 0.03, palette.leafDark, { fruit: palette.orange });
  }
  builder.scatterHillside({ count: 48, peak: [-0.08, -0.4], colors: [palette.cream, palette.white, palette.salmon], roofs: ["parapet", "gable", "hip"], maxGround: 0.95 });
  builder.scatterHouses({
    count: 70,
    bounds: [-1.08, 1.08, -0.88, 0.5],
    width: [0.09, 0.16],
    height: [0.08, 0.16],
    colors: [palette.cream, palette.white, palette.salmon, "#f4e2c4"],
    roofs: ["parapet", "gable", "hip", "parapet"],
    maxSlope: 0.13,
  });
  builder.scatterGreens({ count: 22, bounds: [-1.1, 1.1, -0.95, 0.5], minGround: 0.1, kinds: ["bush", "tree", "cypress"] });
}

function barcelona(builder: CityBuilder) {
  const { kit, root } = builder;
  // Sagrada Família: nave plus the forest of spires with coloured finials.
  const nave = builder.block({ x: 0, z: -0.42, w: 0.24, d: 0.42, h: 0.17, color: palette.stone, kind: "arches", roof: "gable", roofColor: palette.stone, roofHeight: 0.08, rotY: Math.PI / 2 });
  const finials = [palette.gold, palette.orange, palette.teal, palette.white];
  [-0.14, -0.05, 0.05, 0.14].forEach((offset, index) => {
    spire(builder, offset, -0.29, nave, index === 0 || index === 3 ? 0.4 : 0.48, 0.024, finials[index % finials.length]);
    spire(builder, offset, -0.55, nave, index === 0 || index === 3 ? 0.34 : 0.42, 0.022, finials[(index + 2) % finials.length]);
  });
  for (const [dx, dz] of [[-0.07, -0.05], [0.07, -0.05], [-0.07, 0.05], [0.07, 0.05]]) {
    spire(builder, dx, -0.42 + dz, nave, 0.56, 0.028, palette.gold);
  }
  spire(builder, 0, -0.5, nave, 0.62, 0.03, palette.teal);
  const central = builder.cylinder({ x: 0, z: -0.42, y: nave, r: 0.038, rTop: 0.02, h: 0.74, segments: 8, color: palette.stone, kind: "slits", occupy: false });
  const tip = builder.cone(0, -0.42, central, 0.02, 0.1, palette.stone, 8);
  kit.add(root, new THREE.IcosahedronGeometry(0.026, 0), kit.material(palette.gold), [0, tip + 0.02, -0.42], { edgeAngle: 20 });

  // Torre Glòries.
  const glories = builder.ground(0.76, -0.06, 0.2, 0.2).min - 0.01;
  builder.lathe(0.76, -0.06, glories, [[0, 0], [0.105, 0], [0.105, 0.22]], "#c06a55", 20, "glass");
  builder.lathe(0.76, -0.06, glories + 0.22, [[0.105, 0], [0.104, 0.14], [0.096, 0.24], [0.08, 0.32], [0.054, 0.38], [0.02, 0.41], [0, 0.415]], "#7a99bb", 20, "glass");
  builder.occupy(0.76, -0.06, 0.22, 0.22);

  // Casa Batlló with its dragon-back roof, and Casa Milà with wavy floors.
  const batllo = builder.block({ x: -0.62, z: 0.56, w: 0.15, d: 0.13, h: 0.3, color: "#dce9e2", kind: "arches", roof: "none" });
  [palette.teal, "#d8865a", palette.teal, palette.gold, palette.teal].forEach((color, index) => {
    kit.add(root, new THREE.SphereGeometry(0.022, 10, 8), kit.material(color), [-0.68 + index * 0.03, batllo + 0.01, 0.56], { scale: [1, 0.8, 1.4], edgeAngle: 60 });
  });
  const cross = builder.cylinder({ x: -0.55, z: 0.6, y: batllo, r: 0.012, h: 0.05, color: palette.cream, segments: 8 });
  builder.cone(-0.55, 0.6, cross, 0.016, 0.02, palette.teal, 8);
  const milaBase = builder.ground(-0.28, 0.42, 0.28, 0.18).min - 0.01;
  for (let floor = 0; floor < 5; floor += 1) {
    kit.add(root, new THREE.CylinderGeometry(1, 1, 0.046, 20), kit.boxMaterials(palette.cream, "windows", 0.3, 0.046, 0.2)[4], [-0.28 + Math.sin(floor * 1.7) * 0.012, milaBase + floor * 0.05 + 0.023, 0.42], {
      scale: [0.14 + Math.cos(floor * 1.3) * 0.01, 1, 0.09],
      edgeAngle: 40,
    });
  }
  for (const [dx, dz] of [[-0.06, -0.02], [0.02, 0.03], [0.07, -0.03]]) {
    builder.cone(-0.28 + dx, 0.42 + dz, milaBase + 0.25, 0.012, 0.035, palette.white, 6);
  }
  builder.occupy(-0.28, 0.42, 0.3, 0.2);

  // Mirador de Colom.
  const colomBase = builder.block({ x: 0.9, z: 0.72, w: 0.1, d: 0.1, h: 0.06, color: palette.stone, kind: "stone", roof: "parapet" });
  let column = builder.cylinder({ x: 0.9, z: 0.72, y: colomBase, r: 0.016, h: 0.42, segments: 10, color: palette.stone });
  column = builder.cylinder({ x: 0.9, z: 0.72, y: column, r: 0.026, h: 0.02, segments: 10, color: palette.stone });
  builder.kit.add(root, new THREE.SphereGeometry(0.018, 10, 8), kit.material(palette.gold), [0.9, column + 0.018, 0.72], { edgeAngle: 60 });
  builder.statue(0.9, 0.72, column + 0.034, 0.055, "#8a7a5c", 0.9);

  // Arc de Triomf.
  builder.block({ x: 0.2, z: 0.78, w: 0.18, d: 0.06, h: 0.2, color: palette.brick, kind: "brick", roof: "parapet", merlons: true });

  // Park Güell pavilions.
  builder.block({ x: -0.88, z: 0.12, w: 0.09, d: 0.09, h: 0.08, color: "#ecd1ad", kind: "windows", roof: "hip", roofColor: "#8a6a52", roofHeight: 0.07 });
  const pavilion = builder.block({ x: -0.74, z: 0.06, w: 0.08, d: 0.08, h: 0.07, color: "#ecd1ad", kind: "windows", roof: "none" });
  const turret = builder.cylinder({ x: -0.74, z: 0.06, y: pavilion, r: 0.02, h: 0.08, color: palette.white, segments: 10 });
  builder.cone(-0.74, 0.06, turret, 0.024, 0.04, palette.teal, 10);

  // Eixample blocks with chamfered corners.
  for (const [x, z] of [[-0.05, 0.6], [0.48, 0.48], [-0.9, 0.62]]) {
    builder.cylinder({ x, z, r: 0.1, h: 0.14, segments: 8, color: palette.cream, kind: "windows", capColor: palette.creamDark });
  }

  for (const [x, z, height] of [[-1.0, 0.84, 0.28], [-0.42, 0.86, 0.26], [0.46, 0.86, 0.3], [0.64, 0.82, 0.24], [1.06, 0.46, 0.26]]) {
    builder.palm(x, z, height);
  }
  builder.scatterHillside({ count: 46, peak: [0, -0.42], colors: [palette.cream, palette.white, palette.salmon], roofs: ["parapet", "hip", "gable"], maxGround: 0.9 });
  builder.scatterHouses({
    count: 66,
    bounds: [-1.08, 1.08, -0.9, 0.7],
    width: [0.09, 0.16],
    height: [0.1, 0.2],
    colors: [palette.cream, palette.white, palette.salmon, "#ead8bd"],
    roofs: ["parapet", "parapet", "hip", "gable"],
    maxSlope: 0.13,
  });
  builder.scatterGreens({ count: 24, bounds: [-1.1, 1.1, -0.95, 0.6], minGround: 0.1, kinds: ["bush", "tree", "pine"] });
}

// Sevilla seen from the Arenal: the Guadalquivir crosses the base from front to back with Triana beyond it,
// and the old city rises to the cathedral platform crowned by the Giralda.
const guadalquivirWater = -0.03;
const giraldaBrick = "#e2b07e";
const giraldaShade = "#c98f60";
const giraldaRelief = "#f0d0a4";
const albero = "#e8c47e";
const azulejo = "#3f6fa3";
const ironwork = palette.slate;

function riverX(z: number) {
  return -0.66 + 0.06 * z + 0.05 * Math.sin(z * 2.4);
}

// Angle of the river's course, so bridges and riverside rows stand square to the banks.
function riverAngle(z: number) {
  return Math.atan(0.06 + 0.12 * Math.cos(z * 2.4));
}

// Point at a distance across the river from its centre line: positive towards the old city, negative to Triana.
function bank(z: number, offset: number): Point {
  return local(riverX(z), z, riverAngle(z), offset);
}

function guadalquivirCarve(x: number, z: number) {
  const inside = (0.13 - Math.abs(x - riverX(z))) / 0.035;
  return inside > 0 ? -0.1 * smooth(0, 1, inside) : 0;
}

type Parts = Map<string, THREE.BufferGeometry[]>;

function addPart(parts: Parts, color: string, geometry: THREE.BufferGeometry) {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  if (flat !== geometry) {
    geometry.dispose();
  }
  const list = parts.get(color);
  if (list) {
    list.push(flat);
  } else {
    parts.set(color, [flat]);
  }
}

// Small repeated details become one mesh per colour, so they cost a single outline pass.
function buildParts(builder: CityBuilder, parts: Parts, edges = true) {
  parts.forEach((geometries, color) => {
    const merged = mergeGeometries(geometries);
    geometries.forEach((geometry) => geometry.dispose());
    if (merged) {
      builder.kit.add(builder.root, merged, builder.kit.material(color), [0, 0, 0], { edgeAngle: 30, edges });
    }
  });
}

// Places a detail on one face of a square tower: u runs along the face, out is how far it stands proud.
function onFace(parts: Parts, color: string, geometry: THREE.BufferGeometry, [x, z]: Point, half: number, face: number, u: number, y: number, out = 0.002) {
  geometry.translate(u, y, half + out);
  geometry.rotateY((face * Math.PI) / 2);
  geometry.translate(x, 0, z);
  addPart(parts, color, geometry);
}

// Sebka: the rhomboid brick net of the Giralda, clipped to a panel [u1, y1, u2, y2] on one face.
function sebka(parts: Parts, color: string, center: Point, half: number, face: number, [u1, y1, u2, y2]: number[], cell: number) {
  const slope = 1.6;
  const reach = (y2 - y1) / slope;
  for (const direction of [1, -1]) {
    for (let start = u1 - reach; start <= u2 + reach + 1e-6; start += cell) {
      const from = Math.max(u1, direction > 0 ? start : start - reach);
      const to = Math.min(u2, direction > 0 ? start + reach : start);
      if (to - from < 0.002) {
        continue;
      }
      const yAt = (u: number) => y1 + direction * slope * (u - start);
      const [ya, yb] = [yAt(from), yAt(to)];
      const bar = new THREE.BoxGeometry(Math.hypot(to - from, yb - ya), 0.0026, 0.003);
      bar.rotateZ(Math.atan2(yb - ya, to - from));
      bar.translate((from + to) / 2, (ya + yb) / 2, 0);
      onFace(parts, color, bar, center, half, face, 0, 0, 0.003);
    }
  }
}

function giralda(builder: CityBuilder, x: number, z: number) {
  const { kit, root } = builder;
  const parts: Parts = new Map();
  const center: Point = [x, z];
  const width = 0.115;
  const shaft = 0.4;
  const corners = (offset: number) => [[-offset, -offset], [offset, -offset], [offset, offset], [-offset, offset]];

  // Almohad shaft: paired ajimez windows up the middle of each face, flanked by sebka panels.
  const top = builder.block({ x, z, w: width, d: width, h: shaft, color: giraldaBrick, kind: "brick", roof: "none" });
  const base = top - shaft;
  for (let face = 0; face < 4; face += 1) {
    for (const level of [0.12, 0.27, 0.42, 0.57, 0.72, 0.87]) {
      const y = base + shaft * level;
      onFace(parts, palette.cream, new THREE.BoxGeometry(0.026, 0.034, 0.004), center, width / 2, face, 0, y, 0.001);
      for (const side of [-1, 1]) {
        onFace(parts, palette.ink, new THREE.BoxGeometry(0.008, 0.021, 0.004), center, width / 2, face, side * 0.0056, y - 0.003, 0.002);
      }
    }
    for (const side of [-1, 1]) {
      const panel = side < 0 ? [-0.05, base + shaft * 0.36, -0.019, top - 0.014] : [0.019, base + shaft * 0.36, 0.05, top - 0.014];
      onFace(parts, giraldaShade, new THREE.BoxGeometry(panel[2] - panel[0], panel[3] - panel[1], 0.004), center, width / 2, face, (panel[0] + panel[2]) / 2, (panel[1] + panel[3]) / 2, 0);
      sebka(parts, giraldaRelief, center, width / 2, face, panel, 0.0125);
      // Blind lobed arch below each panel.
      onFace(parts, giraldaShade, new THREE.BoxGeometry(0.022, 0.04, 0.004), center, width / 2, face, side * 0.0345, base + shaft * 0.24, 0);
      onFace(parts, giraldaRelief, new THREE.TorusGeometry(0.011, 0.0018, 4, 12, Math.PI), center, width / 2, face, side * 0.0345, base + shaft * 0.24 + 0.02, 0.002);
    }
  }

  // Balcony at the top of the minaret, with the bronze jarras de azucenas on its corners.
  let y = builder.block({ x, z, y: top, w: width + 0.014, d: width + 0.014, h: 0.012, color: palette.cream, kind: "plain", roof: "none" });
  builder.merlons(x, z, y, width + 0.014, width + 0.014, palette.cream, 0, 0.008);
  for (const [dx, dz] of corners(width / 2 + 0.002)) {
    addPart(parts, "#b8893a", new THREE.CylinderGeometry(0.004, 0.006, 0.012, 8).translate(x + dx, y + 0.006, z + dz));
    addPart(parts, "#b8893a", new THREE.SphereGeometry(0.008, 8, 6).translate(x + dx, y + 0.018, z + dz));
    addPart(parts, palette.white, new THREE.ConeGeometry(0.004, 0.016, 5).translate(x + dx, y + 0.032, z + dz));
  }

  // Renaissance belfry: open arches on every face with the bells hanging inside.
  const belfry = 0.094;
  const belfryHeight = 0.08;
  addPart(parts, "#5b4a3d", new THREE.BoxGeometry(belfry - 0.022, belfryHeight, belfry - 0.022).translate(x, y + belfryHeight / 2, z));
  for (const [dx, dz] of corners(belfry / 2 - 0.009)) {
    addPart(parts, palette.cream, new THREE.BoxGeometry(0.018, belfryHeight, 0.018).translate(x + dx, y + belfryHeight / 2, z + dz));
  }
  for (let face = 0; face < 4; face += 1) {
    onFace(parts, giraldaBrick, new THREE.BoxGeometry(0.008, belfryHeight, 0.008), center, belfry / 2 - 0.004, face, 0, y + belfryHeight / 2, 0);
    for (const side of [-1, 1]) {
      onFace(parts, palette.cream, new THREE.TorusGeometry(0.0145, 0.0035, 4, 12, Math.PI), center, belfry / 2 - 0.004, face, side * 0.0225, y + belfryHeight - 0.03, 0);
      onFace(parts, palette.gold, new THREE.ConeGeometry(0.009, 0.018, 10), center, (belfry - 0.022) / 2, face, side * 0.022, y + belfryHeight * 0.48, 0.006);
    }
  }
  y = builder.block({ x, z, y: y + belfryHeight, w: belfry + 0.008, d: belfry + 0.008, h: 0.016, color: palette.cream, kind: "plain", roof: "none" });
  builder.merlons(x, z, y, belfry + 0.008, belfry + 0.008, giraldaBrick, 0, 0.007);

  // Clock body, the body of the stars and the body of the lilies, narrowing up to the cupola.
  y = builder.block({ x, z, y, w: 0.076, d: 0.076, h: 0.05, color: palette.cream, kind: "plain", roof: "none" });
  for (let face = 0; face < 4; face += 1) {
    onFace(parts, palette.white, new THREE.CylinderGeometry(0.0125, 0.0125, 0.003, 16).rotateX(Math.PI / 2), center, 0.038, face, 0, y - 0.024, 0.001);
    onFace(parts, palette.ink, new THREE.BoxGeometry(0.0016, 0.01, 0.002), center, 0.038, face, 0, y - 0.021, 0.003);
    onFace(parts, giraldaBrick, new THREE.BoxGeometry(0.04, 0.008, 0.004), center, 0.038, face, 0, y - 0.045, 0);
  }
  y = builder.block({ x, z, y, w: 0.084, d: 0.084, h: 0.008, color: giraldaBrick, kind: "plain", roof: "none" });
  for (const [dx, dz] of corners(0.036)) {
    addPart(parts, "#b8893a", new THREE.SphereGeometry(0.006, 8, 6).translate(x + dx, y + 0.006, z + dz));
  }
  y = builder.block({ x, z, y, w: 0.06, d: 0.06, h: 0.036, color: palette.cream, kind: "arches", roof: "none" });
  y = builder.block({ x, z, y, w: 0.066, d: 0.066, h: 0.007, color: giraldaBrick, kind: "plain", roof: "none" });
  y = builder.cylinder({ x, z, y, r: 0.024, h: 0.03, segments: 12, color: palette.cream, kind: "arches" });
  y = builder.cylinder({ x, z, y, r: 0.016, h: 0.018, segments: 12, color: palette.cream, kind: "arches" });
  y = builder.dome(x, z, y, 0.018, palette.teal, { scaleY: 1.2 });

  // El Giraldillo: the bronze Faith on a globe, turning with her banner as a weather vane.
  kit.add(root, new THREE.SphereGeometry(0.0065, 10, 8), kit.material(palette.gold), [x, y + 0.004, z], { edgeAngle: 60 });
  const statueBase = y + 0.009;
  builder.statue(x, z, statueBase, 0.05, "#b8893a", 0.55);
  addPart(parts, "#b8893a", new THREE.BoxGeometry(0.016, 0.014, 0.002).translate(x + 0.022, statueBase + 0.036, z));
  buildParts(builder, parts);
}

function catedral(builder: CityBuilder, x: number, z: number) {
  const parts: Parts = new Map();
  const width = 0.5;
  const depth = 0.3;
  const pinnacle = (px: number, pz: number, py: number, size: number) => {
    addPart(parts, palette.stone, new THREE.BoxGeometry(size, size * 2.4, size).translate(px, py + size * 1.2, pz));
    addPart(parts, palette.stone, new THREE.ConeGeometry(size * 0.75, size * 2.8, 4).rotateY(Math.PI / 4).translate(px, py + size * 3.8, pz));
  };

  // Five Gothic naves under flat stepped roofs: the aisles, the raised nave and transept, and the crossing.
  const aisles = builder.block({ x, z, w: width, d: depth, h: 0.15, color: palette.stone, kind: "arches", roof: "none" });
  const nave = builder.block({ x, z, y: aisles, w: width - 0.06, d: 0.1, h: 0.07, color: palette.stone, kind: "arches", roof: "none" });
  builder.block({ x: x + 0.05, z, y: aisles, w: 0.1, d: depth - 0.04, h: 0.07, color: palette.stone, kind: "arches", roof: "none" });
  const crossing = builder.block({ x: x + 0.05, z, y: nave, w: 0.07, d: 0.07, h: 0.035, color: palette.stone, kind: "arches", roof: "none" });
  builder.cone(x + 0.05, z, crossing, 0.03, 0.06, palette.stone, 4, Math.PI / 4);

  // Pinnacles all round the aisles, flying buttresses up to the nave, and smaller pinnacles on the upper roofs.
  for (let px = x - width / 2 + 0.02; px <= x + width / 2 - 0.02 + 1e-6; px += 0.046) {
    for (const side of [-1, 1]) {
      const edge = z + side * (depth / 2 - 0.007);
      pinnacle(px, edge, aisles, 0.012);
      if (Math.abs(px - (x + 0.05)) > 0.07) {
        const [y1, y2] = [aisles + 0.024, nave - 0.01];
        const z2 = z + side * 0.05;
        const length = Math.hypot(z2 - edge, y2 - y1);
        const buttress = new THREE.BoxGeometry(0.007, 0.007, length);
        buttress.rotateX(Math.atan2(-(y2 - y1), z2 - edge));
        addPart(parts, palette.stone, buttress.translate(px, (y1 + y2) / 2, (edge + z2) / 2));
        pinnacle(px, z2, nave, 0.008);
      }
    }
  }
  for (let pz = z - depth / 2 + 0.06; pz <= z + depth / 2 - 0.06 + 1e-6; pz += 0.06) {
    pinnacle(x - width / 2 + 0.007, pz, aisles, 0.012);
    pinnacle(x + width / 2 - 0.007, pz, aisles, 0.012);
  }
  for (const [dx, dz] of [[-0.035, -0.035], [0.035, -0.035], [0.035, 0.035], [-0.035, 0.035]]) {
    pinnacle(x + 0.05 + dx, z + dz, crossing, 0.008);
  }

  // Puerta de la Asunción facing the Avenida, with its rose window.
  const portalX = x - 0.06;
  const portalZ = z + depth / 2 + 0.012;
  const portal = builder.block({ x: portalX, z: portalZ, w: 0.09, d: 0.03, h: 0.19, color: palette.stone, kind: "arches", roof: "gable", roofColor: palette.stone, roofHeight: 0.05 });
  addPart(parts, palette.cream, new THREE.TorusGeometry(0.019, 0.0035, 4, 18).translate(portalX, portal - 0.04, portalZ + 0.017));
  addPart(parts, palette.ink, new THREE.CylinderGeometry(0.016, 0.016, 0.003, 18).rotateX(Math.PI / 2).translate(portalX, portal - 0.04, portalZ + 0.015));
  pinnacle(portalX - 0.045, portalZ, portal, 0.011);
  pinnacle(portalX + 0.045, portalZ, portal, 0.011);

  // Renaissance Capilla Real at the head and the Sacristía Mayor on the side, both under domes.
  const chapel = builder.block({ x: x + width / 2 - 0.08, z: z - depth / 2 - 0.03, w: 0.12, d: 0.06, h: 0.16, color: palette.stone, kind: "arches", roof: "none" });
  builder.dome(x + width / 2 - 0.08, z - depth / 2 - 0.03, chapel, 0.042, palette.teal, { drum: 0.02, lantern: true });
  const sacristy = builder.block({ x: x + width / 2 + 0.03, z: z + 0.03, w: 0.06, d: 0.1, h: 0.13, color: palette.stone, kind: "arches", roof: "none" });
  builder.dome(x + width / 2 + 0.03, z + 0.03, sacristy, 0.028, palette.teal, { lantern: true });
  buildParts(builder, parts);
}

function patioDeLosNaranjos(builder: CityBuilder, x: number, z: number, width: number, depth: number) {
  const corners: Point[] = [[x - width / 2, z - depth / 2], [x + width / 2, z - depth / 2], [x + width / 2, z + depth / 2], [x - width / 2, z + depth / 2]];
  corners.forEach((corner, index) => builder.wall(corner, corners[(index + 1) % 4], { h: 0.045, t: 0.018, color: palette.cream }));
  // Puerta del Perdón and the orange trees in rows around the Visigothic fountain.
  builder.block({ x: x - width / 2, z, w: 0.03, d: 0.06, h: 0.09, color: palette.cream, kind: "arches", roof: "none", merlons: true });
  const ground = builder.terrain.heightAt(x, z);
  builder.cylinder({ x, z, y: ground, r: 0.016, h: 0.012, segments: 8, color: palette.stone });
  for (const dx of [-0.3, 0, 0.3]) {
    for (const dz of [-0.24, 0.24]) {
      builder.tree(x + dx * width, z + dz * depth, 0.024, palette.leafDark, { fruit: palette.orange });
    }
  }
}

function archivoDeIndias(builder: CityBuilder, x: number, z: number) {
  const top = builder.block({ x, z, w: 0.2, d: 0.12, h: 0.085, color: "#ecc9a0", kind: "windows", roof: "parapet" });
  for (const [dx, dz] of [[-0.095, -0.055], [0.095, -0.055], [0.095, 0.055], [-0.095, 0.055], [0, 0.055], [0, -0.055]]) {
    builder.cone(x + dx, z + dz, top + 0.014, 0.008, 0.03, palette.stone, 4, Math.PI / 4);
  }
}

// Puente de Isabel II: three cast-iron arches with the rings between arch and deck, and the Capillita del Carmen.
function puenteDeTriana(builder: CityBuilder, z0: number) {
  const parts: Parts = new Map();
  const angle = riverAngle(z0);
  const x0 = riverX(z0);
  const place = (geometry: THREE.BufferGeometry, color: string, u: number, y: number, v = 0) => {
    geometry.translate(u, y, v);
    geometry.rotateY(angle);
    geometry.translate(x0, 0, z0);
    addPart(parts, color, geometry);
  };
  const deck = 0.034;
  const span = 0.078;
  const spring = guadalquivirWater + 0.008;
  place(new THREE.BoxGeometry(0.4, 0.01, 0.052), palette.stone, 0, deck + 0.005);
  for (const v of [-0.025, 0.025]) {
    place(new THREE.BoxGeometry(0.4, 0.004, 0.004), ironwork, 0, deck + 0.026, v);
    for (let u = -0.19; u <= 0.19 + 1e-6; u += 0.019) {
      place(new THREE.BoxGeometry(0.0025, 0.016, 0.0025), ironwork, u, deck + 0.018, v);
    }
  }
  for (const centre of [-span, 0, span]) {
    for (const v of [-0.018, 0.018]) {
      place(new THREE.TorusGeometry(span / 2, 0.0042, 4, 20, Math.PI), ironwork, centre, spring, v);
      for (const side of [-1, 1]) {
        place(new THREE.TorusGeometry(0.0068, 0.0016, 4, 14), ironwork, centre + side * 0.018, deck - 0.0105, v);
      }
    }
  }
  for (const u of [-span * 1.5 + span, span * 1.5 - span]) {
    for (const v of [-0.018, 0.018]) {
      place(new THREE.TorusGeometry(0.0115, 0.0018, 4, 16), ironwork, u, deck - 0.014, v);
    }
    place(new THREE.BoxGeometry(0.014, 0.1, 0.05), palette.stone, u, spring - 0.05);
  }
  for (const side of [-1, 1]) {
    place(new THREE.BoxGeometry(0.07, 0.074, 0.058), palette.stone, side * 0.152, deck - 0.037);
    builder.occupy(...local(x0, z0, angle, side * 0.17), 0.1, 0.1);
    for (const v of [-0.025, 0.025]) {
      place(new THREE.CylinderGeometry(0.0022, 0.0028, 0.05, 5), ironwork, side * 0.1, deck + 0.035, v);
      place(new THREE.SphereGeometry(0.006, 8, 6), palette.white, side * 0.1, deck + 0.062, v);
    }
  }
  buildParts(builder, parts);

  // Capillita del Carmen at the Triana end, with its glazed dome.
  const [cx, cz] = local(x0, z0, angle, -0.225, 0.05);
  const chapel = builder.block({ x: cx, z: cz, w: 0.05, d: 0.05, h: 0.075, color: palette.brick, kind: "brick", roof: "none", rotY: angle });
  const drum = builder.cylinder({ x: cx, z: cz, y: chapel, r: 0.02, h: 0.018, segments: 8, color: palette.cream, kind: "arches" });
  builder.dome(cx, cz, drum, 0.022, azulejo, { lantern: true });
}

function torreDelOro(builder: CityBuilder, [x, z]: Point, angle: number) {
  const gold = "#e3c07a";
  let y = builder.cylinder({ x, z, r: 0.068, h: 0.15, segments: 12, color: gold, kind: "stone", merlons: true });
  y = builder.cylinder({ x, z, y, r: 0.045, h: 0.08, segments: 12, color: gold, kind: "arches", merlons: true });
  y = builder.cylinder({ x, z, y, r: 0.026, h: 0.042, segments: 12, color: "#efd9a6", kind: "arches" });
  y = builder.dome(x, z, y, 0.027, palette.gold, { scaleY: 1.25 });
  builder.kit.add(builder.root, new THREE.SphereGeometry(0.006, 8, 6), builder.kit.material(palette.gold), [x, y + 0.004, z], { edgeAngle: 60 });
  // Hexagonal stair turret on the landward side.
  const [tx, tz] = local(x, z, angle, 0.07, -0.03);
  builder.cylinder({ x: tx, z: tz, r: 0.03, h: 0.115, segments: 6, color: gold, kind: "stone", merlons: true });
}

// Real Maestranza: the whitewashed ring with albero trim, the sand arena and the Puerta del Príncipe facing the river.
function maestranza(builder: CityBuilder, [x, z]: Point, angle: number) {
  const { kit, root } = builder;
  const ground = builder.terrain.heightAt(x, z);
  builder.lathe(x, z, ground - 0.01, [[0.076, 0], [0.106, 0], [0.106, 0.062], [0.076, 0.062], [0.076, 0]], palette.white, 32, "arches");
  builder.lathe(x, z, ground - 0.01, [[0.105, 0.036], [0.1085, 0.036], [0.1085, 0.046], [0.105, 0.046], [0.105, 0.036]], albero, 32);
  builder.lathe(x, z, ground - 0.01, [[0.074, 0.062], [0.109, 0.062], [0.092, 0.08], [0.074, 0.062]], palette.teal, 32);
  kit.add(root, new THREE.CylinderGeometry(0.076, 0.076, 0.004, 32), kit.material(albero), [x, ground + 0.002, z], { edgeAngle: 40 });
  kit.add(root, new THREE.TorusGeometry(0.0745, 0.0022, 4, 40), kit.material("#b5523b"), [x, ground + 0.006, z], { rotation: [Math.PI / 2, 0, 0], edges: false });
  const [gx, gz] = local(x, z, angle, -0.105);
  builder.block({ x: gx, z: gz, y: ground, w: 0.026, d: 0.06, h: 0.08, color: palette.white, kind: "arches", roof: "parapet", rotY: angle });
  builder.occupy(x, z, 0.22, 0.22);
}

function plazaDeEspana(builder: CityBuilder, [cx, cz]: Point, radius: number) {
  const { kit, root } = builder;
  const parts: Parts = new Map();
  const brick = "#d0825a";
  const ground = builder.terrain.heightAt(cx, cz);
  const at = (distance: number, angle: number): Point => [cx + Math.cos(angle) * distance, cz - Math.sin(angle) * distance];
  const from = 0.07 * Math.PI;
  const to = 0.93 * Math.PI;

  // Semicircular brick wings over a ground-floor arcade, opening towards the viewer.
  const count = 16;
  const chord = 2 * radius * Math.sin((to - from) / count / 2) + 0.006;
  for (let index = 0; index < count; index += 1) {
    const angle = from + ((to - from) * (index + 0.5)) / count;
    if (Math.abs(angle - Math.PI / 2) < 0.12) {
      continue;
    }
    const [x, z] = at(radius, angle);
    const arcade = builder.block({ x, z, w: 0.07, d: chord, h: 0.045, color: palette.cream, kind: "arches", roof: "none", rotY: angle });
    builder.block({ x, z, y: arcade, w: 0.064, d: chord, h: 0.05, color: brick, kind: "windows", roof: "gable", roofColor: palette.teal, roofHeight: 0.03, rotY: angle });
  }

  // Central pavilion and the two baroque towers closing the ends of the semicircle.
  const [px, pz] = at(radius, Math.PI / 2);
  let pavilion = builder.block({ x: px, z: pz, w: 0.13, d: 0.09, h: 0.06, color: palette.cream, kind: "arches", roof: "none" });
  pavilion = builder.block({ x: px, z: pz, y: pavilion, w: 0.124, d: 0.086, h: 0.07, color: brick, kind: "windows", roof: "parapet" });
  const attic = builder.block({ x: px, z: pz, y: pavilion + 0.014, w: 0.06, d: 0.05, h: 0.03, color: palette.cream, kind: "arches", roof: "none" });
  builder.dome(px, pz, attic, 0.02, palette.teal, { lantern: true });
  for (const dx of [-0.055, 0.055]) {
    builder.cone(px + dx, pz + 0.035, pavilion + 0.014, 0.008, 0.035, palette.cream, 4, Math.PI / 4);
  }
  for (const angle of [from - 0.05, to + 0.05]) {
    const [x, z] = at(radius, angle);
    let y = builder.block({ x, z, w: 0.068, d: 0.068, h: 0.24, color: brick, kind: "windows", roof: "none", rotY: angle });
    y = builder.block({ x, z, y, w: 0.076, d: 0.076, h: 0.01, color: palette.cream, kind: "plain", roof: "none", rotY: angle });
    for (const [dx, dz] of [[-0.03, -0.03], [0.03, -0.03], [0.03, 0.03], [-0.03, 0.03]]) {
      const [cornerX, cornerZ] = local(x, z, angle, dx, dz);
      builder.cone(cornerX, cornerZ, y, 0.007, 0.032, palette.cream, 4, angle + Math.PI / 4);
    }
    y = builder.block({ x, z, y, w: 0.052, d: 0.052, h: 0.05, color: palette.cream, kind: "arches", roof: "none", rotY: angle });
    y = builder.block({ x, z, y, w: 0.04, d: 0.04, h: 0.032, color: brick, kind: "arches", roof: "none", rotY: angle });
    y = builder.dome(x, z, y, 0.022, palette.teal, { lantern: true });
    builder.cone(x, z, y, 0.004, 0.03, palette.gold, 6);
  }

  // The canal following the curve, crossed by four tiled bridges, and the provincial benches along the arcade.
  const ring = (inner: number, outer: number, material: THREE.Material, lift: number) => {
    const geometry = new THREE.RingGeometry(inner, outer, 48, 1, from, to - from);
    geometry.rotateX(-Math.PI / 2);
    kit.add(root, geometry, material, [cx, ground + lift, cz], { edgeAngle: 30 });
  };
  ring(radius - 0.13, radius - 0.095, kit.material(palette.water, "plain", 1, 1, { transparent: true, opacity: 0.9, roughness: 0.3 }), 0.005);
  ring(radius - 0.135, radius - 0.128, kit.material(palette.cream), 0.008);
  ring(radius - 0.097, radius - 0.09, kit.material(palette.cream), 0.008);
  for (const angle of [0.24 * Math.PI, 0.38 * Math.PI, 0.62 * Math.PI, 0.76 * Math.PI]) {
    const [x, z] = at(radius - 0.112, angle);
    const part = (geometry: THREE.BufferGeometry, color: string, y: number, v = 0) => {
      geometry.translate(0, y, v);
      geometry.rotateY(angle);
      geometry.translate(x, ground, z);
      addPart(parts, color, geometry);
    };
    part(new THREE.BoxGeometry(0.056, 0.008, 0.026), palette.cream, 0.012);
    for (const v of [-0.012, 0.012]) {
      part(new THREE.BoxGeometry(0.056, 0.012, 0.003), azulejo, 0.022, v);
    }
  }
  const benchColors = [azulejo, palette.gold, palette.white, "#c4533f"];
  let bench = 0;
  for (let angle = from + 0.04; angle <= to - 0.04; angle += 0.055) {
    if (Math.abs(angle - Math.PI / 2) < 0.16) {
      continue;
    }
    const [x, z] = at(radius - 0.055, angle);
    const geometry = new THREE.BoxGeometry(0.012, 0.014, 0.026);
    geometry.rotateY(angle);
    addPart(parts, benchColors[bench % benchColors.length], geometry.translate(x, ground + 0.007, z));
    bench += 1;
  }
  buildParts(builder, parts);

  // Brick-paved square inside the semicircle.
  const floor = new THREE.CircleGeometry(radius - 0.135, 40, from, to - from);
  floor.rotateX(-Math.PI / 2);
  kit.add(root, floor, kit.material("#efd2ae"), [cx, ground + 0.003, cz], { edgeAngle: 30 });
  kit.add(root, new THREE.BoxGeometry(2 * (radius - 0.135), 0.002, 0.12), kit.material("#efd2ae"), [cx, ground + 0.002, cz + 0.06], { edgeAngle: 30 });

  // Vicente Traver's fountain in the middle of the square.
  const basin = builder.cylinder({ x: cx, z: cz, y: ground - 0.004, r: 0.05, h: 0.016, segments: 20, color: palette.cream });
  kit.add(root, new THREE.CylinderGeometry(0.044, 0.044, 0.004, 20), kit.material(palette.water, "plain", 1, 1, { transparent: true, opacity: 0.9, roughness: 0.3 }), [cx, basin, cz], { edges: false });
  const column = builder.cylinder({ x: cx, z: cz, y: basin, r: 0.008, h: 0.035, segments: 8, color: palette.cream });
  const bowl = builder.cylinder({ x: cx, z: cz, y: column, r: 0.02, rTop: 0.024, h: 0.008, segments: 12, color: palette.cream });
  builder.cone(cx, cz, bowl, 0.006, 0.02, palette.cream, 8);
  builder.occupy(cx, cz - 0.12, 0.42, 0.42, 0);
  for (const dx of [-0.16, 0, 0.16]) {
    builder.occupy(cx + dx, cz + 0.07, 0.16, 0.16, 0);
  }
}

// Metropol Parasol (las Setas): six timber parasols on trunks, built as a waffle of thin crossing ribs.
function setas(builder: CityBuilder, x: number, z: number) {
  const { kit, root } = builder;
  const timber = "#ead39a";
  const ground = builder.block({ x, z, w: 0.46, d: 0.3, h: 0.03, color: palette.cream, kind: "arches", roof: "none" });
  const caps = [
    { x: -0.14, z: -0.065, rx: 0.125, rz: 0.11, top: 0.21 },
    { x: 0.0, z: -0.07, rx: 0.125, rz: 0.115, top: 0.24 },
    { x: 0.145, z: -0.055, rx: 0.12, rz: 0.105, top: 0.2 },
    { x: -0.13, z: 0.07, rx: 0.12, rz: 0.1, top: 0.19 },
    { x: 0.015, z: 0.075, rx: 0.125, rz: 0.11, top: 0.225 },
    { x: 0.15, z: 0.07, rx: 0.115, rz: 0.098, top: 0.18 },
  ];
  const surface = (u: number, v: number) => {
    let height = -Infinity;
    for (const cap of caps) {
      const distance = ((u - cap.x) / cap.rx) ** 2 + ((v - cap.z) / cap.rz) ** 2;
      if (distance < 1) {
        height = Math.max(height, cap.top - 0.07 * distance + 0.008 * Math.sin(u * 30) * Math.cos(v * 26));
      }
    }
    return height;
  };
  const rib = 0.024;
  const geometries: THREE.BufferGeometry[] = [];
  const slice = (alongX: boolean, fixed: number) => {
    let run: [number, number][] = [];
    const flush = () => {
      if (run.length >= 2) {
        const shape = new THREE.Shape();
        shape.moveTo(run[0][0], run[0][1]);
        run.slice(1).forEach(([s, h]) => shape.lineTo(s, h));
        [...run].reverse().forEach(([s, h]) => shape.lineTo(s, h - rib));
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.0035, bevelEnabled: false });
        geometry.translate(0, ground, -0.00175);
        if (alongX) {
          geometry.translate(x, 0, z + fixed);
        } else {
          geometry.rotateY(-Math.PI / 2);
          geometry.translate(x + fixed, 0, z);
        }
        geometries.push(geometry);
      }
      run = [];
    };
    const span = alongX ? 0.28 : 0.19;
    for (let s = -span; s <= span + 1e-6; s += 0.008) {
      const height = alongX ? surface(s, fixed) : surface(fixed, s);
      if (height > -Infinity) {
        run.push([s, height]);
      } else {
        flush();
      }
    }
    flush();
  };
  for (let v = -0.18; v <= 0.18 + 1e-6; v += 0.02) {
    slice(true, v);
  }
  for (let u = -0.28; u <= 0.28 + 1e-6; u += 0.02) {
    slice(false, u);
  }
  const waffle = mergeGeometries(geometries);
  geometries.forEach((geometry) => geometry.dispose());
  if (waffle) {
    kit.add(root, waffle, kit.material(timber), [0, 0, 0], { edges: false });
  }
  caps.forEach((cap, index) => {
    const height = cap.top - rib - 0.012;
    const foot = index === 1 || index === 4 ? 0.022 : 0.015;
    builder.lathe(x + cap.x, z + cap.z, ground - 0.002, [[0, 0], [foot, 0], [foot * 0.8, height * 0.35], [foot * 1.3, height * 0.65], [0.04, height - 0.01], [0.05, height], [0, height]], timber, 16);
  });
}

// Triana across the river: the coloured row of Calle Betis facing the water, Santa Ana and the streets behind.
function triana(builder: CityBuilder, bridgeZ: number) {
  const colors = ["#f2d27c", "#e9b949", "#e48b5f", palette.white, "#f3b8a8", "#f6e7c1", "#d97e5a"];
  for (let z = -0.94; z < 0.94; ) {
    const step = builder.range(0.075, 0.1);
    const centre = z + step / 2;
    z += step;
    if (Math.abs(centre - bridgeZ) < 0.11) {
      continue;
    }
    const [x, houseZ] = bank(centre, -0.212);
    const roof = builder.pick<BlockOptions["roof"]>(["parapet", "parapet", "flat", "gable"]);
    builder.block({
      x,
      z: houseZ,
      w: 0.09,
      d: step - 0.008,
      h: builder.range(0.07, 0.13),
      color: builder.pick(colors),
      kind: "windows",
      roof,
      roofColor: palette.tealDark,
      roofHeight: 0.035,
      rotY: riverAngle(centre),
    });
  }
  // Santa Ana, the cathedral of Triana, with its Mudéjar tower and tiled pinnacles.
  const angle = riverAngle(-0.5);
  const [sx, sz] = bank(-0.5, -0.36);
  builder.block({ x: sx, z: sz, w: 0.1, d: 0.15, h: 0.08, color: palette.cream, kind: "arches", roof: "gable", roofColor: palette.tealDark, roofHeight: 0.045, rotY: angle });
  const [tx, tz] = local(sx, sz, angle, 0.035, 0.1);
  let tower = builder.block({ x: tx, z: tz, w: 0.045, d: 0.045, h: 0.19, color: palette.brick, kind: "brick", roof: "none", rotY: angle });
  tower = builder.block({ x: tx, z: tz, y: tower, w: 0.04, d: 0.04, h: 0.035, color: palette.cream, kind: "arches", roof: "none", rotY: angle });
  builder.cone(tx, tz, tower, 0.024, 0.06, palette.tealDark, 4, angle + Math.PI / 4);
  for (const [dx, dz] of [[-0.018, -0.018], [0.018, -0.018], [0.018, 0.018], [-0.018, 0.018]]) {
    const [px, pz] = local(tx, tz, angle, dx, dz);
    builder.cone(px, pz, tower, 0.005, 0.026, azulejo, 6);
  }
  builder.scatterHouses({
    count: 60,
    bounds: [-1.12, -0.74, -0.92, 0.92],
    width: [0.055, 0.1],
    height: [0.05, 0.11],
    colors,
    roofs: ["parapet", "parapet", "parapet", "flat", "gable"],
    roofColors: [palette.tealDark, palette.teal],
    maxSlope: 0.06,
  });
}

function riverBoat(builder: CityBuilder, z: number, length: number) {
  const { kit, root } = builder;
  const group = new THREE.Group();
  group.position.set(riverX(z) + 0.02, guadalquivirWater + 0.006, z);
  group.rotation.y = riverAngle(z) - Math.PI / 2;
  kit.add(group, new THREE.BoxGeometry(length, 0.016, 0.034), kit.material(palette.white), [0, 0.002, 0], { edgeAngle: 30 });
  kit.add(group, new THREE.BoxGeometry(length * 0.62, 0.016, 0.026), kit.material(palette.glass, "glass", 2, 1), [0.006, 0.018, 0], { edgeAngle: 30 });
  kit.add(group, new THREE.BoxGeometry(length * 0.7, 0.003, 0.032), kit.material(palette.teal), [0.006, 0.028, 0], { edgeAngle: 30 });
  root.add(group);
}

function sevilla(builder: CityBuilder) {
  const bridgeZ = -0.02;
  giralda(builder, -0.135, -0.36);
  catedral(builder, 0.18, -0.5);
  patioDeLosNaranjos(builder, -0.2, -0.58, 0.2, 0.18);
  archivoDeIndias(builder, 0.26, -0.05);
  puenteDeTriana(builder, bridgeZ);
  torreDelOro(builder, bank(0.52, 0.205), riverAngle(0.52));
  maestranza(builder, bank(0.18, 0.27), riverAngle(0.18));
  plazaDeEspana(builder, [0.5, 0.62], 0.33);
  setas(builder, 0.82, -0.42);

  // Iglesia del Salvador, rose-coloured under its dome.
  const salvador = builder.block({ x: 0.04, z: 0.25, w: 0.14, d: 0.1, h: 0.09, color: "#f0b9a0", kind: "arches", roof: "parapet" });
  builder.dome(0.04, 0.25, salvador + 0.014, 0.038, palette.tealDark, { drum: 0.025, lantern: true });
  for (const dx of [-0.06, 0.06]) {
    const belfry = builder.block({ x: 0.04 + dx, z: 0.3, y: salvador, w: 0.026, d: 0.026, h: 0.04, color: "#f0b9a0", kind: "arches", roof: "none" });
    builder.cone(0.04 + dx, 0.3, belfry, 0.016, 0.03, palette.tealDark, 4, Math.PI / 4);
  }

  // Riverside promenades on both banks: railings, lamps and palms, kept clear of houses.
  for (const side of [-1, 1]) {
    for (const [start, end] of [[-0.95, bridgeZ - 0.08], [bridgeZ + 0.08, side > 0 ? 0.42 : 0.95], ...(side > 0 ? [[0.62, 0.95]] : [])]) {
      const points: Point[] = [];
      for (let z = start; z <= end + 1e-6; z += 0.02) {
        points.push(bank(z, side * 0.136));
      }
      railingPath(builder, points);
    }
    for (let z = -0.95; z <= 0.95; z += 0.05) {
      builder.occupy(...bank(z, side * 0.15), 0.03, 0.03, 0);
    }
  }
  for (const z of [-0.82, -0.52, -0.24, 0.34, 0.68, 0.9]) {
    lamp(builder, ...bank(z, 0.148));
  }
  for (const z of [-0.9, -0.68, -0.4, -0.14, 0.34, 0.78, 0.92]) {
    const [x, palmZ] = bank(z, 0.175);
    if (builder.isFree(x, palmZ, 0.03, 0.03, 0)) {
      builder.palm(x, palmZ, builder.range(0.22, 0.28));
    }
  }

  // Boats on the Guadalquivir.
  riverBoat(builder, 0.72, 0.12);
  riverBoat(builder, -0.62, 0.1);
  boat(builder, riverX(0.3) - 0.03, 0.3, riverAngle(0.3) - 1.2);

  // Parque de María Luisa beside the Plaza de España, and orange trees along the Avenida.
  for (let attempt = 0; attempt < 320; attempt += 1) {
    const x = builder.range(0.1, 1.14);
    const z = builder.range(-0.1, 0.96);
    if (builder.terrain.heightAt(x, z) > 0.007 && builder.isFree(x, z, 0.04, 0.04, 0)) {
      const kind = builder.random();
      if (kind < 0.08) {
        builder.palm(x, z, builder.range(0.15, 0.2));
      } else {
        builder.tree(x, z, builder.range(0.03, 0.045), builder.pick([palette.leafDark, palette.leaf, palette.pine]), { squash: builder.range(0.7, 0.95), fruit: kind > 0.85 ? palette.orange : undefined });
      }
    }
  }
  for (let x = -0.16; x <= 0.5; x += 0.07) {
    for (const z of [0.07, 0.13]) {
      if (builder.isFree(x, z, 0.04, 0.04, 0)) {
        builder.tree(x, z, 0.024, palette.leafDark, { fruit: palette.orange, squash: 0.85 });
      }
    }
  }

  triana(builder, bridgeZ);
  builder.scatterHouses({
    count: 210,
    bounds: [-0.52, 1.12, -0.92, 0.95],
    width: [0.055, 0.1],
    height: [0.05, 0.11],
    colors: [palette.white, palette.white, "#f2d27c", palette.cream, "#f3c9a8"],
    roofs: ["parapet", "parapet", "parapet", "flat", "gable"],
    roofColors: [palette.teal, palette.tealDark],
    maxSlope: 0.13,
  });
  builder.scatterGreens({ count: 16, bounds: [-0.5, 1.1, -0.9, 0.9], kinds: ["tree", "bush", "cypress"] });
}

function genericCity(builder: CityBuilder) {
  const church = builder.block({ x: 0, z: -0.36, w: 0.26, d: 0.2, h: 0.16, color: palette.cream, kind: "arches", roof: "gable", roofColor: palette.teal, roofHeight: 0.08 });
  const tower = builder.block({ x: 0.16, z: -0.3, w: 0.08, d: 0.08, h: 0.36, color: palette.cream, kind: "slits", roof: "none" });
  builder.cone(0.16, -0.3, tower, 0.06, 0.12, palette.teal, 4, Math.PI / 4);
  void church;
  builder.scatterHouses({ count: 46, bounds: [-1.08, 1.08, -0.9, 0.72], colors: [palette.white, palette.cream, palette.salmon], roofs: ["parapet", "gable", "hip"], maxSlope: 0.06 });
  builder.scatterGreens({ count: 30, bounds: [-1.1, 1.1, -0.95, 0.8], kinds: ["tree", "bush", "cypress"] });
}

type CityDefinition = {
  bumps: Bump[];
  step: number;
  build: (builder: CityBuilder) => void;
  grass?: string[];
  carve?: (x: number, z: number) => number;
  water?: number;
  floor?: number;
  walls?: boolean;
};

const cities: Record<string, CityDefinition> = {
  malaga: {
    bumps: [{ x: -0.24, z: -0.44, h: 1.38, rx: 1.0, rz: 0.75 }, { x: 0.45, z: -0.58, h: 0.61, rx: 0.55, rz: 0.45 }],
    step: 0.17,
    build: malaga,
  },
  donosti: {
    bumps: [
      { x: -0.7, z: 0.5, h: 0.92, rx: 0.44, rz: 0.42, power: 1.1, terrace: false },
      { x: 0.9, z: 0.42, h: 0.74, rx: 0.42, rz: 0.44, power: 1.15, terrace: false },
      { x: 0.1, z: 0.84, h: 0.2, rx: 0.14, rz: 0.09, power: 0.8, terrace: false },
      { x: 0.52, z: 0.04, h: 0.1, rx: 0.2, rz: 0.16, terrace: false },
    ],
    step: 0.17,
    grass: ["#a9cbb9", "#98bea9", "#8db59f", "#a2c6b3"],
    carve: conchaCarve,
    water: conchaWater,
    floor: -0.12,
    walls: false,
    build: donosti,
  },
  madrid: {
    bumps: [{ x: 0.05, z: -0.38, h: 1.3, rx: 1.05, rz: 0.75 }, { x: -0.62, z: -0.54, h: 0.9, rx: 0.5, rz: 0.42 }],
    step: 0.17,
    build: madrid,
  },
  valencia: {
    bumps: [{ x: -0.08, z: -0.4, h: 1.16, rx: 1.0, rz: 0.72 }],
    step: 0.16,
    build: valencia,
  },
  barcelona: {
    bumps: [{ x: 0, z: -0.42, h: 1.19, rx: 1.05, rz: 0.72 }],
    step: 0.16,
    build: barcelona,
  },
  sevilla: {
    bumps: [
      { x: 0.06, z: -0.5, h: 0.24, rx: 0.75, rz: 0.5, power: 1.2 },
      { x: 1.02, z: 0.45, h: 0.012, rx: 0.2, rz: 0.5, power: 0.3, terrace: false },
      { x: 0.56, z: 0.86, h: 0.014, rx: 0.48, rz: 0.1, power: 0.3, terrace: false },
    ],
    step: 0.16,
    carve: guadalquivirCarve,
    water: guadalquivirWater,
    floor: -0.12,
    build: sevilla,
  },
};
cities.donostia = cities.donosti;
cities["san sebastian"] = cities.donosti;

function hashName(name: string) {
  let hash = 2166136261;
  for (let index = 0; index < name.length; index += 1) {
    hash = Math.imul(hash ^ name.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

// Builds the model for a stop city; unknown cities get a generic hillside town.
export function buildCity(city: string, kit: Kit) {
  const name = normalizeCity(city);
  const definition = cities[name] ?? { bumps: [{ x: 0, z: -0.4, h: 1.1, rx: 1, rz: 0.72 }], step: 0.16, build: genericCity };
  const seed = hashName(name);
  const group = new THREE.Group();
  // Coastal cities sit on a diorama base: everything is lifted so the seabed stays above the podium.
  const content = new THREE.Group();
  content.position.y = definition.floor ? -definition.floor : 0;
  group.add(content);
  const terrain = new Terrain(
    { width: baseWidth, depth: baseDepth, bumps: definition.bumps, step: definition.step, seed: seed % 97, grass: definition.grass, carve: definition.carve, water: definition.water, floor: definition.floor, walls: definition.walls },
    kit,
  );
  content.add(terrain.mesh);
  definition.build(new CityBuilder(kit, content, terrain, seededRandom(seed)));
  return mergeModel(group, kit);
}
