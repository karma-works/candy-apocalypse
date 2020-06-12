import { BBox } from '../misc/bbox'
//
// BSP node.
//
export interface Node {
  // Partition line.
  x: number;
  y: number;
  dX: number;
  dY: number;
  // Bounding box for each child.
  bbox: BBox[];
  // If NF_SUBSECTOR its a subsector.
  children: number[];
}
