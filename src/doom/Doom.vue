<template>
  <canvas width="320" height="320" ref="screen"
    v-bind:style="{ transform: `scale3d(${ratio}, ${ratio}, 1)` }">
  </canvas>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { Doom as RawDoom } from './doom/doom'
import { fs } from './system/fs'

@Component
export default class Doom extends Vue {
  $refs!: {
    screen: HTMLCanvasElement
  }

  doomInst!: RawDoom

  ratio = 1

  async mounted(): Promise<void> {
    await fs.write('doom1.wad', './doom1.wad')

    const screen = this.$refs.screen

    this.doomInst = new RawDoom({
      screen,
      wad: 'doom1.wad',
    })

    await this.doomInst.init()

    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  onResize(): void {
    const screen = this.$refs.screen
    const screenParent = screen.parentElement
    if (screenParent !== null) {
      const horizontalRatio = screenParent.clientWidth / screen.width
      const verticallRatio = screenParent.clientHeight / screen.height
      this.ratio = Math.min(horizontalRatio, verticallRatio)
    }
  }

  beforeDestroy(): void {
    window.removeEventListener('resize', this.onResize)
  }
}
</script>
