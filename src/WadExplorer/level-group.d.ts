import { LevelGroup } from '../doom/webgl/objects/level-scene';
import { Object3DNode } from '@react-three/fiber';

declare type LevelGroupProps = Object3DNode<LevelGroup, typeof LevelGroup>;

declare global {
  namespace JSX {
      interface IntrinsicElements {
        levelGroup: LevelGroupProps;
      }
  }
}
