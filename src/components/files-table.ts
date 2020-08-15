import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { FileInfo, fs } from '@/doom/system/fs'
import { LumpType, guessLumpType } from '@/doom/wad/lump'
import { DataTableHeader } from 'vuetify'
import { Params } from '@/doom/doom/params'
import { Wad } from '@/doom/wad/wad'

const prefixes = [ 'B', 'kB', 'MB', 'GB' ]

type FileType = 'wad' | 'save' | 'unknown' | LumpType

type ExtendedFileInfo = FileInfo & { type: FileType }

function getType(item: FileInfo): FileType {
  let fileName = item.name.toLowerCase()
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

function extend(f: FileInfo, wad = false): ExtendedFileInfo {
  return {
    ...f,
    type: wad && f.buffer ?
      guessLumpType(f.buffer, f.name) :
      getType(f),
  }
}

@Component
export default class FilesTable extends Vue {
  @Prop() parent!: string | undefined

  files: readonly ExtendedFileInfo[] = []

  headers: DataTableHeader<ExtendedFileInfo>[] = [
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
      sortable: false,
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

        this.files = wad.lumps.map(f => extend(f, true))
        return
      }
    }
    this.wadName = ''
    this.files = (await fs.ls()).map(f => extend(f))
  }

  formatSize(size: number): string {
    const i = Math.max(
      Math.floor(Math.log(size) / Math.log(1000)),
      0)

    return `${(size / Math.pow(1000, i)).toFixed(2)} ${prefixes[i]}`
  }

  getLabel(type: FileType): string {
    switch (type) {
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

  canPlay(item: ExtendedFileInfo): boolean {
    const playable: FileType[] = [ 'wad', 'demo' ]
    return playable.includes(item.type)
  }
  canBrowse(item: ExtendedFileInfo): boolean {
    return item.type === 'wad'
  }
  getParam(item: ExtendedFileInfo): Partial<Params> {
    const base: Partial<Params> = {}
    if (this.wadName) {
      base.wad = this.wadName
    }
    switch (item.type) {
    case 'wad':
      return { wad: item.name }
    case 'demo':
      return { ...base, playDemo: item.name }
    default:
      return { ...base }
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
