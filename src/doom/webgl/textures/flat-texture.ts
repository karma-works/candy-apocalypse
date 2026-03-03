import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RedFormat,
  RepeatWrapping,
} from "three";
import { Flat } from "../../textures/flat";
import { Video as RVideo } from "../../rendering/video";

export class FlatTexture extends DataTexture {
  constructor(flat: Flat) {
    const size = 64;
    const rVideo = new RVideo({ logical: [size, size] });
    rVideo.init(1);
    rVideo.drawFlat(0, 0, 0, flat);

    const source = rVideo.screens[0];
    super(source, size, size, RedFormat);

    this.wrapS = RepeatWrapping;
    this.wrapT = RepeatWrapping;

    this.magFilter = LinearFilter;
    this.minFilter = LinearMipmapLinearFilter;
    this.generateMipmaps = true;
  }
}
