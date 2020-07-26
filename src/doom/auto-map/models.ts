import { FRACUNIT } from '../misc/fixed'
import { PLAYER_RADIUS } from '../play/local'

export class Point {
  constructor(public x = 0, public y = 0) { }
}
export class Line {
  a: Point
  b: Point

  constructor(ax = 0, ay = 0, bx = 0, by = 0) {
    this.a = new Point(ax, ay)
    this.b = new Point(bx, by)
  }
}

export class Slope {
  slope = 0
  iSlope = 0
}

//
// The vector graphics for the automap.
//  A line drawing of the player pointing right,
//   starting from the middle.
//
let R = 8 * PLAYER_RADIUS / 7

export const playerArrow = [
  // -----
  new Line(
    (-R >> 0) + (R / 8 >> 0),
    0,
    R >> 0,
    0),

  // ----->
  new Line(
    R >> 0,
    0,
    (R >> 0)- (R / 2 >> 0),
    R / 4 >> 0),

  new Line(
    R >> 0,
    0,
    (R >> 0) - (R / 2 >> 0),
    -(R / 4) >> 0),

  // >---->
  new Line(
    (-R >> 0) + (R / 8 >> 0),
    0,
    (-R >> 0) - (R / 8 >> 0),
    R / 4 >> 0),

  new Line(
    (-R >> 0) + (R / 8 >> 0),
    0,
    (-R >> 0) - (R / 8 >> 0),
    -R / 4 >> 0),

  // >>--->
  new Line(
    (-R >> 0) + (3 * R / 8 >> 0),
    0,
    (-R >> 0) + (R / 8 >> 0),
    R / 4 >> 0),

  new Line(
    (-R >> 0) + (3 * R / 8 >> 0),
    0,
    (-R >> 0) + (R / 8 >> 0),
    -(R / 4) >> 0),

]

export const cheatPlayerArrow = [
  // -----
  new Line(
    (-R >> 0) + (R / 8 >> 0),
    0,
    R >> 0,
    0),

  // ----->
  new Line(
    R >> 0,
    0,
    (R >> 0) - (R / 2 >> 0),
    R / 6 >> 0),

  new Line(
    R >> 0,
    0,
    (R >> 0) - (R / 2 >> 0),
    -R / 6 >> 0),

  // >----->
  new Line(
    (-R >> 0) + (R / 8 >> 0),
    0,
    (-R >> 0) - (R / 8 >> 0),
    R / 6 >> 0),

  new Line(
    (-R >> 0) + (R / 8 >> 0),
    0,
    (-R >> 0) - (R / 8 >> 0),
    -R / 6 >> 0),

  // >>----->
  new Line(
    (-R >> 0) + (3 * R / 8 >> 0),
    0,
    (-R >> 0) + (R / 8 >> 0),
    R / 6 >> 0),

  new Line(
    (-R >> 0) + (3 * R / 8 >> 0),
    0,
    (-R >> 0) + (R / 8 >> 0),
    -R / 6 >> 0),

  // >>-d--->
  new Line(
    -R / 2 >> 0,
    0,
    -R / 2 >> 0,
    -R / 6 >> 0),

  new Line(
    -R / 2 >> 0,
    -R / 6 >> 0,
    (-R / 2 >> 0) + (R / 6 >> 0),
    -R / 6 >> 0),

  new Line(
    (-R / 2 >> 0) + (R / 6 >> 0),
    -R / 6 >> 0,
    (-R / 2 >> 0) + (R / 6 >> 0),
    R / 4 >> 0),

  // >>-dd-->
  new Line(
    -R / 6 >> 0,
    0,
    -R / 6 >> 0,
    -R / 6 >> 0),

  new Line(
    -R / 6 >> 0,
    -R / 6 >> 0,
    0,
    -R / 6 >> 0),

  new Line(
    0,
    -R / 6 >> 0,
    0,
    R / 4 >> 0),

  // >>-ddt->
  new Line(
    R / 6 >> 0,
    R / 4 >> 0,
    R / 6 >> 0,
    -R / 7 >> 0),

  new Line(
    R / 6 >> 0,
    -R / 7 >> 0,
    (R / 6 >> 0) + (R / 32 >> 0),
    (-R / 7 >> 0) - R / 32 >> 0),

  new Line(
    (R / 6 >> 0) + (R / 32 >> 0),
    (-R / 7 >> 0) - (R / 32 >> 0),
    (R / 6 >> 0) + (R / 10 >> 0),
    -R / 7 >> 0),
]

R = FRACUNIT

export const triangleGuy = [
  new Line(
    -.867 * R >> 0,
    -.5 * R >> 0,
    .867 * R >> 0,
    -.5 * R >> 0),

  new Line(
    .867 * R >> 0,
    -.5 * R >> 0,
    0,
    R),

  new Line(
    0,
    R,
    -.867 * R >> 0,
    -.5 * R >> 0),

]

export const thinTriangleGuy = [
  new Line(
    -.5 * R >> 0,
    -.7 * R >> 0,
    R,
    0),

  new Line(
    R,
    0 ,
    -.5 * R >> 0,
    .7 * R >> 0),

  new Line(
    -.5 * R >> 0,
    .7 * R >> 0,
    -.5 * R >> 0,
    -.7 * R >> 0),
]
