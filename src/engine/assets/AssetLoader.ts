import { AbstractMesh, Scene } from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

export class AssetLoader {
  private scene: Scene | null = null;

  setScene(scene: Scene): void {
    this.scene = scene;
  }

  async loadLevel(path: string): Promise<AbstractMesh[]> {
    if (!this.scene) {
      throw new Error('Scene not set');
    }

    const result = await SceneLoader.ImportMeshAsync('', '', path, this.scene);
    return result.meshes;
  }

  async loadModel(path: string): Promise<AbstractMesh[]> {
    if (!this.scene) {
      throw new Error('Scene not set');
    }

    const result = await SceneLoader.ImportMeshAsync('', '', path, this.scene);
    result.meshes.forEach((mesh) => {
      mesh.setEnabled(false);
    });
    return result.meshes;
  }
}
