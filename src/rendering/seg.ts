import { Line } from './line'
import { Sector } from './sector'
import { Side } from './side'
import { Vertex } from './vertex'
//
// The LineSeg.
//
export interface Seg {
  v1: Vertex;
  v2: Vertex;
  offset: number;
  angle: number;
  sideDef: Side;
  lineDef: Line;
  // Sector references.
  // Could be retrieved from linedef, too.
  // backsector is NULL for one sided lines
  frontSector: Sector;
  backSector: Sector | null;
}
