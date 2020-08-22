<template>
  <div class="screen-wrapper" ref="screenWrapper">
    <canvas width="320" height="320" ref="screen"
      v-bind:style="{ transform: `scale3d(${xScale}, ${yScale}, 1)` }">
    </canvas>

    <v-btn icon absolute right bottom @click="toggleFullScreen()">
      <v-icon>
        {{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
      </v-icon>
    </v-btn>

    <v-snackbar app v-model="displayError">
      {{ error }}
    </v-snackbar>
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

    await this.start()

    window.addEventListener('resize', this.onResize)
    this.onResize()

  }

  async restart(p: Partial<Params>): Promise<void> {
    await this.doomInst.quit()

    await this.start(p)

    this.$refs.screen.focus()
  }
  async start(p: Partial<Params> = {}): Promise<void> {
    try {
      this.doomInst = new RawDoom({
        ...this.defaultParams,
        ...p
      })
      this.doomInst.onError = (e) => this.onError(e)

      await this.doomInst.init()

      const ctx = this.doomInst.iSound.audioCtx
      if (ctx) {
        ctx.addEventListener('statechange', e => {
          this.sound = !!ctx && ctx.state === 'running'
          this.$emit('soundChange', this.sound)
        })
      }

      this.doomInst.iVideo.onFullScreenChange(a => {
        this.fullscreen = a
      })
    } catch (e) {
      this.onError(e)
    }
  }

  displayError = false
  error = ''
  private onError(e: unknown): void {
    if (e instanceof Error) {
      e = e.message
      console.error(e)
    }

    if (typeof e === 'string') {
      this.error = e
      this.displayError = true
    }
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

  fullscreen = false
  async toggleFullScreen(): Promise<void> {
    await this.doomInst.iVideo.toggleFullScreen()
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