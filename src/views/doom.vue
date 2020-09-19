<template>
  <div class="screen-root" ref="screenRoot">
    <div class="screen-wrapper" v-bind:class="{ fullscreen: fullscreen }">
      <canvas width="320" height="320" ref="screen3d">
      </canvas>
      <canvas width="320" height="320" ref="screen2d">
      </canvas>
    </div>

    <v-speed-dial absolute bottom right
        v-model="toolFab" open-on-hover>
      <template v-slot:activator>
        <v-btn fab v-model="toolFab">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-btn fab small @click="toggleRenderer()">
        <v-icon>mdi-cube-outline</v-icon>
      </v-btn>

      <v-btn fab small @click="toggleFullScreen()">
        <v-icon>
          {{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
        </v-icon>
      </v-btn>
    </v-speed-dial>

    <v-snackbar app v-model="displayError">
      {{ error }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Doom as RawDoom } from '@/doom/doom'
import { Params } from '@/doom/doom/params'
import { fs } from '@/doom/system/fs'
import { RenderingMode } from '@/doom/rendering/rendering-interface'

@Component
export default class Doom extends Vue {
  $refs!: {
    screen2d: HTMLCanvasElement
    screen3d: HTMLCanvasElement
    screenRoot: HTMLDivElement
  }

  toolFab = true

  doomInst!: RawDoom

  private defaultParams!: Params

  async mounted(): Promise<void> {
    const paramsStr = localStorage.getItem('params')
    if (paramsStr !== null) {
      const params = JSON.parse(paramsStr)
      if (params !== null && typeof params === 'object') {
        this.params = params
      }
    }

    await fs.write('doom1.wad', './doom1.wad', false)

    await this.start()

    this.registerFullScreenChange()
  }

  async restart(): Promise<void> {
    await this.doomInst.quit()

    await this.start()

    this.$refs.screen2d.focus()
  }
  params: Partial<Params> = {}
  async start(): Promise<void> {
    try {
      const screen2d = this.$refs.screen2d
      const screen3d = this.$refs.screen3d

      localStorage.setItem('params', JSON.stringify(this.params))

      this.doomInst = new RawDoom({
        input: screen2d,
        screen2d,
        screen3d,
        wad: 'doom1.wad',
        ...this.params,
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
  registerFullScreenChange(): void {
    const el = this.$refs.screenRoot
    el.addEventListener('fullscreenchange', () => {
      this.fullscreen = document.fullscreenElement === el
    })
  }
  async toggleFullScreen(): Promise<void> {
    const el = this.$refs.screenRoot
    if (el) {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    }
  }

  toggleRenderer(): void {
    if (this.doomInst.renderingMode === RenderingMode.Legacy) {
      this.doomInst.setWebGLRenderer()
      this.error = 'WebGL renderer is still a work in progress'
      this.displayError = true
    } else {
      this.doomInst.setLegacyRenderer()
    }
  }

  beforeDestroy(): void {
    this.doomInst.quit()
  }
}
</script>

<style lang="scss" scoped>
.screen-wrapper {
  width: calc((100vh - 64px) * 4 / 3);
  height: calc(100vh - 64px);

  &.fullscreen {
    width: calc((100vh) * 4 / 3);
    height: calc(100vh);
  }

  position: relative;
  margin: 0 auto;
  > canvas {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    outline: none;
  }
}
</style>