import {
  Geometry,
  Material,
  Mesh,
} from 'three'
import { Sector } from '../rendering/defs/sector'

export const enum ObserverType {
  BottomHeight,
  TopHeight,
}

export type HeightObserver = {
  type: ObserverType.BottomHeight | ObserverType.TopHeight
  mesh: Mesh<Geometry, Material>
  sector: Sector,
  height: 'floorHeight' | 'ceilingHeight',
}

export type Observer = HeightObserver
