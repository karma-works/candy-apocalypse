export type CandyTextureType =
  | "wall-default"
  | "wall-toxic"
  | "wall-lava"
  | "wall-sky"
  | "item-door-closed"
  | "item-door-open"
  | "item-switch-off"
  | "item-switch-on"
  | "item-health"
  | "item-armor"
  | "item-weapon"
  | "enemy-imp"
  | "enemy-zombie"
  | "enemy-demon"
  | "enemy-cacodemon"
  | "enemy-barrel"
  | "floor-default"
  | "floor-hazard";

export interface CandyColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export const CANDY_COLORS = {
  skyPop: { r: 0, g: 212, b: 255 },
  cottonCloud: { r: 255, g: 183, b: 197 },
  solarBurst: { r: 255, g: 225, b: 53 },
  toxicLime: { r: 50, g: 255, b: 0 },
  rageOrange: { r: 255, g: 107, b: 53 },
  mysticViolet: { r: 155, g: 93, b: 229 },
  cherryBomb: { r: 255, g: 0, b: 68 },
  deepSpace: { r: 26, g: 26, b: 46 },
};

export class CandyTextureMapper {
  private textureCache = new Map<string, ImageData>();

  mapTexture(textureName: string): CandyTextureType {
    const name = textureName.toUpperCase();

    if (name.includes("SKY") || name === "F_SKY1") {
      return "wall-sky";
    }

    if (name.includes("SLIME") || name.includes("NUKAGE")) {
      return "wall-toxic";
    }

    if (name.includes("LAVA") || name.includes("FIRE")) {
      return "wall-lava";
    }

    if (name.includes("SW1") || name.includes("SW2")) {
      return name.includes("SW2") ? "item-switch-on" : "item-switch-off";
    }

    if (name.includes("DOOR") || name.includes("BIGDOOR")) {
      return "item-door-closed";
    }

    return "wall-default";
  }

  generateFallbackTexture(
    type: CandyTextureType,
    width: number = 64,
    height: number = 64,
  ): ImageData {
    const key = `${type}-${width}x${height}`;

    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    const imageData = new ImageData(width, height);
    const data = imageData.data;

    const color = this.getColorForType(type);

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);

      if (this.isOutline(x, y, width, height)) {
        data[i] = CANDY_COLORS.deepSpace.r;
        data[i + 1] = CANDY_COLORS.deepSpace.g;
        data[i + 2] = CANDY_COLORS.deepSpace.b;
        data[i + 3] = 255;
      } else {
        const variation = Math.random() * 20 - 10;
        data[i] = Math.max(0, Math.min(255, color.r + variation));
        data[i + 1] = Math.max(0, Math.min(255, color.g + variation));
        data[i + 2] = Math.max(0, Math.min(255, color.b + variation));
        data[i + 3] = 255;
      }
    }

    this.textureCache.set(key, imageData);
    return imageData;
  }

  private getColorForType(type: CandyTextureType): CandyColor {
    switch (type) {
      case "wall-sky":
        return CANDY_COLORS.skyPop;
      case "wall-toxic":
        return CANDY_COLORS.toxicLime;
      case "wall-lava":
        return CANDY_COLORS.rageOrange;
      case "wall-default":
        return CANDY_COLORS.cottonCloud;
      case "item-door-closed":
      case "item-door-open":
        return CANDY_COLORS.mysticViolet;
      case "item-switch-off":
        return CANDY_COLORS.cherryBomb;
      case "item-switch-on":
        return CANDY_COLORS.solarBurst;
      case "floor-hazard":
        return CANDY_COLORS.toxicLime;
      case "floor-default":
        return CANDY_COLORS.cottonCloud;
      default:
        return CANDY_COLORS.solarBurst;
    }
  }

  private isOutline(
    x: number,
    y: number,
    width: number,
    height: number,
  ): boolean {
    const outlineWidth = 2;
    return (
      x < outlineWidth ||
      x >= width - outlineWidth ||
      y < outlineWidth ||
      y >= height - outlineWidth
    );
  }

  clearCache(): void {
    this.textureCache.clear();
  }
}
