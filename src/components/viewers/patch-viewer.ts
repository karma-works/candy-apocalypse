import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Video as IVideo } from '@/doom/interfaces/video'
import { LumpReader } from '@/doom/wad/lump-reader'
import { Palette } from '@/doom/interfaces/palette'
import { Patch } from '@/doom/rendering/defs/patch'
import { Video as RVideo } from '@/doom/rendering/video'

@Component
export default class PatchViewer extends Vue {
  $refs!: {
    screen: HTMLCanvasElement
  }

  width = 320
  get xScale(): number {
    if (this.patch) {
      return this.width / this.patch.width
    }
    return 1
  }
  get yScale(): number {
    return this.xScale
  }

  @Prop() wad!: string
  @Prop() lump!: string | number

  lumpReader!: LumpReader

  patch: Patch | null = null
  palette: Palette | null = null

  @Watch('wad')
  async loadWad(): Promise<void> {
    this.lumpReader = new LumpReader()
    await this.lumpReader.initMultipleFiles([ this.wad ])

    this.palette = this.lumpReader.cacheLumpName('PLAYPAL', Palette)

    this.loadLump()
  }

  @Watch('lump')
  loadLump(): void {
    if (typeof this.lump === 'string') {
      this.patch = this.lumpReader.cacheLumpName(this.lump, Patch)
    } else if (typeof this.lump === 'number') {
      this.patch = this.lumpReader.cacheLumpNum(this.lump, Patch)
    } else {
      this.patch = null
    }

    this.displayPatch()
  }

  async mounted(): Promise<void> {
    await this.loadWad()
  }

  private iVideo: IVideo | null = null
  displayPatch(): void {
    if (this.patch === null || this.palette === null) {
      return
    }

    if (this.iVideo) {
      this.iVideo.quit()
    }

    const rVideo = new RVideo(this.patch.width, this.patch.height)
    rVideo.init(1)

    const iVideo = new IVideo(rVideo)
    this.iVideo = iVideo
    iVideo.init(this.$refs.screen)
    iVideo.uploadNewPalette(this.palette)

    rVideo.drawPatch(this.patch.leftOffset, this.patch.topOffset, 0, this.patch)

    iVideo.finishUpdate()
  }
}
