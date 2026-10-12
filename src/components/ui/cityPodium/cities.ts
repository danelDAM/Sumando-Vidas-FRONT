import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { normalizeCity } from "../../../data/spainMap";
import { CityBuilder, Kit, Terrain, mergeModel, palette, seededRandom, type Bump } from "./kit";

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
