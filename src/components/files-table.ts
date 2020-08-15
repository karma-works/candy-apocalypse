import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { FileInfo, fs } from '@/doom/system/fs'
import { LumpType, guessLumpType } from '@/doom/wad/lump'
import { DataTableHeader } from 'vuetify'
import { Params } from '@/doom/doom/params'
import { Wad } from '@/doom/wad/wad'

const prefixes = [ 'B', 'kB', 'MB', 'GB' ]

type FileType = 'wad' | 'save' | 'unknown' | LumpType

@Component
export default class FilesTable extends Vue {
  @Prop() parent!: string | undefined

  files: readonly FileInfo[] = []

  headers: DataTableHeader<FileInfo>[] = [
    {
      text: 'Name',
      value: 'name',
    },
    {
      text: 'Size',
      value: 'size',
    },
    {
      text: 'Type',
      value: 'type',
    },
    {
      text: 'Actions',
      value: 'actions',
    },
  ]

  wadName = ''

  async mounted(): Promise<void> {
    await this.initFiles()
  }
  @Watch('parent')
  async initFiles(): Promise<void> {
    if (this.parent &&
      this.parent.toLowerCase().endsWith('.wad')
    ) {
      this.wadName = this.parent
      const buffer = await fs.open(this.wadName)
      if (buffer) {
        const wad = new Wad(buffer)

        this.files = wad.lumps
        return
      }
    }
    this.wadName = ''
    this.files = await fs.ls()
  }

  formatSize(size: number): string {
    const i = Math.max(
      Math.floor(Math.log(size) / Math.log(1000)),
      0)

    return `${(size / Math.pow(1000, i)).toFixed(2)} ${prefixes[i]}`
  }

  getType(item: FileInfo): FileType {
    let fileName = item.name.toLowerCase()
    if (this.wadName && item.buffer) {
      return guessLumpType(item.buffer, fileName)
    }
    const dot = fileName.lastIndexOf('.')
    const ext = fileName.substr(dot + 1)
    fileName = fileName.substr(0, dot)

    if (ext.endsWith('wad')) {
      return 'wad'
    } else if (ext.endsWith('dsg')) {
      return 'save'
    } else if (ext.endsWith('lmp') &&
      item.buffer !== undefined
    ) {
      return guessLumpType(item.buffer, fileName)
    }
    return 'unknown'
  }
  getLabel(item: FileInfo): string {
    switch (this.getType(item)) {
    case 'wad':
      return 'WAD'
    case 'save':
      return 'Save game'
    case 'demo':
      return 'Demo'
    default:
      return 'Unknown'
    }
  }

  canPlay(item: FileInfo): boolean {
    const playable: FileType[] = [ 'wad', 'demo' ]
    return playable.includes(this.getType(item))
  }
  canBrowse(item: FileInfo): boolean {
    return this.getType(item) === 'wad'
  }
  getParam(item: FileInfo): Partial<Params> {
    switch (this.getType(item)) {
    case 'wad':
      return { wad: item.name }
    case 'demo':
      return { playDemo: item.name }
    default:
      return {}
    }
  }

  async download(f: FileInfo): Promise<void> {
    let buf = f.buffer
    if (buf === undefined) {
      buf = await fs.open(name)
    }
    if (buf === undefined) {
      return
    }

    const blob = new Blob([ buf ])
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    if (this.wadName) {
      a.download += '.LMP'
    }
    a.click()
  }

  canRemove(): boolean {
    return !this.wadName
  }
  async remove({ name }: FileInfo): Promise<void> {
    await fs.rm(name)
  }
}
