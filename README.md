# [DOOM.ts](https://tchandelle.gitlab.io/doom.ts/)

**doom.ts** is a port of the classic game DOOM, implemented in TypeScript.
It is based on the original source code available [here](https://github.com/id-Software/DOOM).

An online version of doom.ts is available [here](https://tchandelle.gitlab.io/doom.ts/).

## Features

- **Playable Game**. Source code in [./src/doom/](./src/doom/)
- **Modern THREE.js Renderer Engine**: Play with either the legacy 2.5D rendering engine, or a modern 3D engine. Source code in [./src/doom/webgl/](./src/doom/webgl/)
- **WAD Explorer**: Source code in [./src/WadExplorer/](./src/WadExplorer/)

## Compatibility
- DOOM v1.9
- The Ultimate DOOM
- Doom II - Hell on Earth
- Final Doom - TNT: Evilution
- Final Doom - The Plutonia Experiment

## Known issues
- WebGL: Sky ceiling too low in some places. (See DOOM E3M1)

## Missing Features

- Deathmatch

## Usage

To run the game locally, follow these steps:

1. Install dependencies:

```sh
yarn install
```

2. Start the development server:

```sh
yarn run dev
```

3. Open your browser and visit [http://localhost:5173](http://localhost:5173) to play doom.ts.


## Disclaimer

This project is a fan-made port of the original DOOM game and is not affiliated with or endorsed by id Software or ZeniMax Media Inc. All rights to the original DOOM source code belong to ZeniMax Media Inc.
