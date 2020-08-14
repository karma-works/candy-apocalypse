<template>
  <div class="screen-wrapper" ref="screenWrapper">
    <canvas width="320" height="320" ref="screen"
      v-bind:style="{ transform: `scale3d(${ratio}, ${ratio}, 1)` }">
    </canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { fs } from '@/doom/system/fs'
import { Doom as RawDoom } from '@/doom/doom'
import { Params } from '@/doom/doom/params'

@Component
export default class Doom extends Vue {
  $refs!: {
    screen: HTMLCanvasElement
    screenWrapper: HTMLDivElement
  }

  doomInst!: RawDoom

  ratio = 1

  private defaultParams!: Params

  async mounted(): Promise<void> {
    await fs.write('doom1.wad', './doom1.wad', false)

    const screen = this.$refs.screen

    this.defaultParams = {
      screen,
      wad: 'doom1.wad',
    }

    this.doomInst = new RawDoom(this.defaultParams)

    await this.doomInst.init()

    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  async restart(p: Partial<Params>): Promise<void> {
    await this.doomInst.quit()

    this.doomInst = new RawDoom({
      ...this.defaultParams,
      ...p,
    })

    await this.doomInst.init()
  }

  onResize(): void {
    const screenWrapper = this.$refs.screenWrapper
    const screen = this.$refs.screen
    const screenParent = screen.parentElement
    if (screenParent !== null) {
      const horizontalRatio = screenParent.clientWidth / screen.width
      const verticallRatio = screenParent.clientHeight / screen.height
      this.ratio = Math.min(horizontalRatio, verticallRatio)
    }
  }

  beforeDestroy(): void {
    this.doomInst.quit()
    window.removeEventListener('resize', this.onResize)
  }

  toggleSound(): void {
    this.doomInst.iSound.toggleSound()
  }
}
</script>

<style lang="scss">
.screen-wrapper {
  height: calc(100vh - 64px);
  text-align: center;
  > canvas {
    transform-origin: top;
    outline: none;
  }
}
</style>