/**
 * Procedural level layout generator — pure TypeScript, no BabylonJS deps.
 * Same params always produce identical output (deterministic via seeded RNG).
 */

import { RNG } from "./RNG";
import type { SpawnPoint } from "../../game/state/gameStore";

// World-space constants
const CELL = 4; // units per grid cell
const WALL_H = 3; // wall height
const DOOR_W = 2.5; // doorway opening width

export interface LevelParams {
  length: number; // 1–10: scales total floor area
  difficulty: number; // 1–10: more enemies, fewer pickups
  complexity: number; // 1–10: more rooms / turns
}

interface RoomDef {
  id: number;
  gx: number;
  gz: number; // grid origin (cell units)
  gw: number;
  gd: number; // grid size (cell units)
  connections: number[]; // ids of connected rooms
  isStart: boolean;
  isExit: boolean;
  isBranch: boolean;
  // world-space (derived from grid)
  wx: number;
  wz: number;
  ww: number;
  wd: number;
  cx: number;
  cz: number; // world center
}

export interface FloorDef {
  cx: number;
  cz: number;
  w: number;
  d: number;
}

export interface WallDef {
  cx: number;
  cz: number;
  len: number;
  axis: "x" | "z"; // "x" = wall runs along X axis, "z" = along Z axis
}

export interface GeneratedLevel {
  params: LevelParams;
  seed: number;
  floors: FloorDef[];
  walls: WallDef[];
  spawns: SpawnPoint[];
  bounds: { minX: number; minZ: number; maxX: number; maxZ: number };
}

type Dir = "E" | "W" | "N" | "S";

function deriveSeed(p: LevelParams): number {
  return (
    ((p.length * 73856093) ^
      (p.difficulty * 19349663) ^
      (p.complexity * 83492791)) >>>
    0
  );
}

function setWorldCoords(r: RoomDef): void {
  r.wx = r.gx * CELL;
  r.wz = r.gz * CELL;
  r.ww = r.gw * CELL;
  r.wd = r.gd * CELL;
  r.cx = r.wx + r.ww / 2;
  r.cz = r.wz + r.wd / 2;
}

function makeRoom(
  id: number,
  gx: number,
  gz: number,
  gw: number,
  gd: number,
  isStart: boolean,
  isExit: boolean,
  isBranch: boolean,
): RoomDef {
  const r: RoomDef = {
    id,
    gx,
    gz,
    gw,
    gd,
    connections: [],
    isStart,
    isExit,
    isBranch,
    wx: 0,
    wz: 0,
    ww: 0,
    wd: 0,
    cx: 0,
    cz: 0,
  };
  setWorldCoords(r);
  return r;
}

function nextGridPos(
  parent: RoomDef,
  dir: Dir,
  newW: number,
  newD: number,
): { gx: number; gz: number } {
  switch (dir) {
    case "E":
      return { gx: parent.gx + parent.gw, gz: parent.gz };
    case "W":
      return { gx: parent.gx - newW, gz: parent.gz };
    case "S":
      return { gx: parent.gx, gz: parent.gz + parent.gd };
    case "N":
      return { gx: parent.gx, gz: parent.gz - newD };
  }
}

// Which side of `a` faces `b` (rooms must be grid-adjacent)
function sharedSide(a: RoomDef, b: RoomDef): Dir {
  if (b.gx === a.gx + a.gw) {
    return "E";
  }
  if (b.gx + b.gw === a.gx) {
    return "W";
  }
  if (b.gz === a.gz + a.gd) {
    return "S";
  }
  return "N";
}

// World-space coordinate of the doorway center along a shared wall
function doorwayCenter(a: RoomDef, b: RoomDef, side: Dir): number {
  if (side === "E" || side === "W") {
    // Wall runs along Z; doorway center is a Z value
    const lo = Math.max(a.wz, b.wz);
    const hi = Math.min(a.wz + a.wd, b.wz + b.wd);
    return (lo + hi) / 2;
  } else {
    // Wall runs along X; doorway center is an X value
    const lo = Math.max(a.wx, b.wx);
    const hi = Math.min(a.wx + a.ww, b.wx + b.ww);
    return (lo + hi) / 2;
  }
}

// Split a 1-D span [start, end] into segments, skipping doorway gaps of width DOOR_W
function splitSpan(
  start: number,
  end: number,
  gapCenters: number[],
): Array<[number, number]> {
  const sorted = [...gapCenters].sort((a, b) => a - b);
  const segs: Array<[number, number]> = [];
  let pos = start;
  for (const c of sorted) {
    const gs = c - DOOR_W / 2;
    const ge = c + DOOR_W / 2;
    if (gs > pos) {
      segs.push([pos, Math.min(gs, end)]);
    }
    pos = Math.max(pos, ge);
  }
  if (pos < end) {
    segs.push([pos, end]);
  }
  return segs.filter(([s, e]) => e - s > 0.1);
}

export function generateLevel(params: LevelParams): GeneratedLevel {
  const seed = deriveSeed(params);
  const rng = new RNG(seed);

  const totalRooms = 3 + Math.round(params.complexity * 1.5);
  const critPathLen = Math.ceil(totalRooms * 0.6);
  const branchCount = totalRooms - critPathLen;

  const minCells = 2;
  const maxCells = 2 + Math.ceil(params.length / 3); // 2–5 depending on length

  function pickSize(): { w: number; d: number } {
    const range = maxCells - minCells + 1;
    return {
      w: minCells + rng.nextInt(range),
      d: minCells + rng.nextInt(range),
    };
  }

  const rooms: RoomDef[] = [];
  const occupied = new Set<string>();

  function markOccupied(r: RoomDef): void {
    for (let x = r.gx; x < r.gx + r.gw; x++) {
      for (let z = r.gz; z < r.gz + r.gd; z++) {
        occupied.add(`${x},${z}`);
      }
    }
  }

  function canPlace(gx: number, gz: number, gw: number, gd: number): boolean {
    for (let x = gx; x < gx + gw; x++) {
      for (let z = gz; z < gz + gd; z++) {
        if (occupied.has(`${x},${z}`)) {
          return false;
        }
      }
    }
    return true;
  }

  function tryPlaceAdjacentTo(
    parent: RoomDef,
    isExit: boolean,
    isBranch: boolean,
  ): RoomDef | null {
    const dirs = rng.shuffle<Dir>(["E", "W", "S", "N"]);
    for (const dir of dirs) {
      const { w, d } = pickSize();
      const { gx, gz } = nextGridPos(parent, dir, w, d);
      if (canPlace(gx, gz, w, d)) {
        const id = rooms.length;
        const room = makeRoom(id, gx, gz, w, d, false, isExit, isBranch);
        room.connections.push(parent.id);
        parent.connections.push(id);
        rooms.push(room);
        markOccupied(room);
        return room;
      }
    }
    return null;
  }

  // ── Place start room ──────────────────────────────────────────────────────
  const { w: sw, d: sd } = pickSize();
  const start = makeRoom(0, 0, 0, sw, sd, true, false, false);
  rooms.push(start);
  markOccupied(start);

  // ── Critical path ─────────────────────────────────────────────────────────
  let last = start;
  for (let i = 1; i < critPathLen; i++) {
    const isExit = i === critPathLen - 1;
    let room = tryPlaceAdjacentTo(last, isExit, false);
    if (!room) {
      const pathSoFar = rooms.filter((r) => !r.isBranch);
      for (const parent of pathSoFar) {
        room = tryPlaceAdjacentTo(parent, isExit, false);
        if (room) {
          break;
        }
      }
    }
    if (!room) {
      break;
    }
    last = room;
  }

  if (!rooms.some((r) => r.isExit)) {
    const pathRooms = rooms.filter((r) => !r.isBranch);
    for (const parent of pathRooms) {
      const room = tryPlaceAdjacentTo(parent, true, false);
      if (room) {
        last = room;
        break;
      }
    }
  }

  // ── Dead-end branches ─────────────────────────────────────────────────────
  const critRooms = rooms.filter((r) => !r.isBranch && !r.isExit);
  for (let i = 0; i < branchCount; i++) {
    const parent = rng.pick(critRooms);
    tryPlaceAdjacentTo(parent, false, true);
  }

  // ── Verify exit is reachable from start ───────────────────────────────────
  function isReachable(fromId: number, toId: number): boolean {
    const visited = new Set<number>();
    const queue = [fromId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toId) {
        return true;
      }
      visited.add(current);
      for (const conn of rooms[current].connections) {
        if (!visited.has(conn)) {
          queue.push(conn);
        }
      }
    }
    return false;
  }

  const exitRoomDef = rooms.find((r) => r.isExit);
  if (exitRoomDef && !isReachable(start.id, exitRoomDef.id)) {
    let connected = false;
    for (const room of rooms) {
      if (room.id === exitRoomDef.id) {
        continue;
      }
      if (isReachable(start.id, room.id)) {
        const dx = Math.abs(room.gx - exitRoomDef.gx);
        const dz = Math.abs(room.gz - exitRoomDef.gz);
        const adjX = dx === room.gw || dx === exitRoomDef.gw;
        const adjZ = dz === room.gd || dz === exitRoomDef.gd;
        if ((adjX && dz === 0) || (adjZ && dx === 0)) {
          room.connections.push(exitRoomDef.id);
          exitRoomDef.connections.push(room.id);
          connected = true;
          break;
        }
      }
    }
    if (!connected) {
      for (const room of rooms) {
        if (room.id !== exitRoomDef.id && isReachable(start.id, room.id)) {
          room.connections.push(exitRoomDef.id);
          exitRoomDef.connections.push(room.id);
          break;
        }
      }
    }
  }

  // ── Floors ────────────────────────────────────────────────────────────────
  const floors: FloorDef[] = rooms.map((r) => ({
    cx: r.cx,
    cz: r.cz,
    w: r.ww,
    d: r.wd,
  }));

  // ── Walls with doorway gaps ───────────────────────────────────────────────
  const walls: WallDef[] = [];

  for (const room of rooms) {
    // Build per-side doorway center lists
    const doorways: Record<Dir, number[]> = { E: [], W: [], N: [], S: [] };
    for (const otherId of room.connections) {
      const other = rooms[otherId];
      const side = sharedSide(room, other);
      doorways[side].push(doorwayCenter(room, other, side));
    }

    // North wall — runs along X at z = room.wz
    for (const [s, e] of splitSpan(room.wx, room.wx + room.ww, doorways.N)) {
      walls.push({ cx: (s + e) / 2, cz: room.wz, len: e - s, axis: "x" });
    }

    // South wall — runs along X at z = room.wz + room.wd
    for (const [s, e] of splitSpan(room.wx, room.wx + room.ww, doorways.S)) {
      walls.push({
        cx: (s + e) / 2,
        cz: room.wz + room.wd,
        len: e - s,
        axis: "x",
      });
    }

    // West wall — runs along Z at x = room.wx
    for (const [s, e] of splitSpan(room.wz, room.wz + room.wd, doorways.W)) {
      walls.push({ cx: room.wx, cz: (s + e) / 2, len: e - s, axis: "z" });
    }

    // East wall — runs along Z at x = room.wx + room.ww
    for (const [s, e] of splitSpan(room.wz, room.wz + room.wd, doorways.E)) {
      walls.push({
        cx: room.wx + room.ww,
        cz: (s + e) / 2,
        len: e - s,
        axis: "z",
      });
    }
  }

  // ── Spawns ────────────────────────────────────────────────────────────────
  const spawns: SpawnPoint[] = [];

  function randomPosInRoom(
    r: RoomDef,
    margin: number,
  ): { x: number; z: number } {
    const safeW = Math.max(0, r.ww - 2 * margin);
    const safeD = Math.max(0, r.wd - 2 * margin);
    return {
      x: r.wx + margin + rng.next() * safeW,
      z: r.wz + margin + rng.next() * safeD,
    };
  }

  // Player in start room
  const sp = randomPosInRoom(start, 1.5);
  spawns.push({ type: "player", position: [sp.x, 1.7, sp.z] });

  // Exit in last critical path room
  const exitRoom = rooms.find((r) => r.isExit) ?? rooms[rooms.length - 1];
  spawns.push({
    type: "pickup-exit",
    position: [exitRoom.cx, 0.5, exitRoom.cz],
  });

  // Enemies
  function pickEnemyType(): string {
    if (params.difficulty <= 3) {
      return "enemy-demon";
    }
    if (params.difficulty <= 6) {
      return rng.pick(["enemy-demon", "enemy-imp"]);
    }
    return rng.pick([
      "enemy-demon",
      "enemy-imp",
      "enemy-imp",
      "enemy-cacodemon",
    ]);
  }

  const enemyCount = 1 + Math.round(params.difficulty * 2);
  const enemyRooms = rooms.filter((r) => !r.isStart && !r.isExit);
  for (let i = 0; i < enemyCount; i++) {
    if (enemyRooms.length === 0) {
      break;
    }
    const room = enemyRooms[i % enemyRooms.length];
    const margin = Math.min(1.5, Math.min(room.ww, room.wd) / 2 - 0.5);
    if (margin <= 0) {
      continue;
    }
    const pos = randomPosInRoom(room, margin);
    spawns.push({ type: pickEnemyType(), position: [pos.x, 0, pos.z] });
  }

  // Pickups — prefer dead-end (branch) rooms, then others
  const pickupCount = Math.max(
    1,
    Math.round(11 - params.difficulty + params.complexity * 0.3),
  );
  const branchRooms = rooms.filter((r) => r.isBranch);
  const otherRooms = rooms.filter(
    (r) => !r.isStart && !r.isExit && !r.isBranch,
  );
  const pickupRooms = [...branchRooms, ...otherRooms];
  const pickupTypes = [
    "pickup-health",
    "pickup-health",
    "pickup-ammo-pistol",
    "pickup-ammo-shotgun",
  ];
  for (let i = 0; i < pickupCount; i++) {
    if (pickupRooms.length === 0) {
      break;
    }
    const room = pickupRooms[i % pickupRooms.length];
    const margin = Math.min(1.0, Math.min(room.ww, room.wd) / 2 - 0.5);
    if (margin <= 0) {
      continue;
    }
    const pos = randomPosInRoom(room, margin);
    spawns.push({ type: rng.pick(pickupTypes), position: [pos.x, 0.5, pos.z] });
  }

  // ── Bounds ────────────────────────────────────────────────────────────────
  const allX = rooms.flatMap((r) => [r.wx, r.wx + r.ww]);
  const allZ = rooms.flatMap((r) => [r.wz, r.wz + r.wd]);
  const bounds = {
    minX: Math.min(...allX),
    minZ: Math.min(...allZ),
    maxX: Math.max(...allX),
    maxZ: Math.max(...allZ),
  };

  // Export wall height for builder
  (walls as any).__wallH = WALL_H;

  return { params, seed, floors, walls, spawns, bounds };
}

export { WALL_H };
