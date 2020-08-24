<template>
  <div>
    <v-slider
      v-model="width"
      min="32"
      max="1024"
      step="0.001"
      label="Zoom"
    ></v-slider>

    <div class="screen-wrapper"
      v-bind:style="{ width: `${width}px` }">
      <canvas ref="screen"
        v-bind:style="{ transform: `scale3d(${xScale}, ${yScale}, 1)` }"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts" src="./patch-viewer"></script>

<style lang="scss" scoped>
.screen-wrapper {
  min-width: 320px;
  text-align: center;
  > canvas {
    transform-origin: top;
    image-rendering: pixelated;
    outline: none;
  }
}
</style>