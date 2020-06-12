import { Sector } from './sector'
//
// A SubSector.
// References a Sector.
// Basically, this is a list of LineSegs,
//  indicating the visible walls that define
//  (all or some) sides of a convex BSP leaf.
//
export interface SubSector {
  sector: Sector | null;
  numLines: number;
  firstLine: number;
}
