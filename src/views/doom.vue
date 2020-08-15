<template>
  <div class="screen-wrapper" ref="screenWrapper">
    <canvas width="320" height="320" ref="screen"
      v-bind:style="{ transform: `scale3d(${xScale}, ${yScale}, 1)` }">
    </canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { INTENDED_SCREENHEIGHT, SCREENWIDTH } from '@/doom/global/doomdef'
import { Doom as RawDoom } from '@/doom/doom'
import { Params } from '@/doom/doom/params'
import { fs } from '@/doom/system/fs'

@Component
export default class Doom extends Vue {
  $refs!: {
    screen: HTMLCanvasElement
    screenWrapper: HTMLDivElement
  }

  doomInst!: RawDoom

  xScale = 1
  yScale = 1

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

    const ctx = this.doomInst.iSound.audioCtx
    if (ctx) {
      ctx.addEventListener('statechange', e => {
        this.sound = !!ctx && ctx.state === 'running'
        this.$emit('soundChange', this.sound)
      })
    }
  }

  async restart(p: Partial<Params>): Promise<void> {
    await this.doomInst.quit()

    this.doomInst = new RawDoom({
      ...this.defaultParams,
      ...p,
    })

    await this.doomInst.init()

    this.$refs.screen.focus()
  }

  @Prop() sound = false
  @Watch('sound') setSound(a: boolean): void {
    const ctx = this.doomInst.iSound.audioCtx
    if (ctx === null) {
      return
    }
    if (a) {
      ctx.resume()
    } else {
      ctx.suspend()
    }
  }

  onResize(): void {
    const screenWrapper = this.$refs.screenWrapper
    const screen = this.$refs.screen
    const screenParent = screen.parentElement
    if (screenParent !== null) {
      const ratio = SCREENWIDTH / INTENDED_SCREENHEIGHT

      let width = screenParent.clientWidth
      let height = width / ratio

      if (height > screenParent.clientHeight) {
        height = screenParent.clientHeight
        width = height * ratio
      }

      this.xScale = width / screen.width
      this.yScale = height / screen.height
    }
  }

  beforeDestroy(): void {
    this.doomInst.quit()
    window.removeEventListener('resize', this.onResize)
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