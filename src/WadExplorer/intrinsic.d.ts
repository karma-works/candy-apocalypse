import { LevelGroup } from '../doom/webgl/objects/level';
import { MObj } from '../doom/webgl/objects/mobj';
import { Object3DNode } from '@react-three/fiber';
import { Sector } from '../doom/webgl/objects/sector';

declare type LevelGroupProps = Object3DNode<LevelGroup, typeof LevelGroup>;
declare type SectorProps = Object3DNode<Sector, typeof Sector>;
declare type MObjProps = Object3DNode<MObj, typeof MObj>;

declare global {
  namespace JSX {
      interface IntrinsicElements {
        levelGroup: LevelGroupProps;
        sector: SectorProps;
        mObj: MObjProps
      }
  }
}
