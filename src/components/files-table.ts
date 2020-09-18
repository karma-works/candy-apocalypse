import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { FileInfo, fs } from '@/doom/system/fs'
import { LumpType, guessLumpType } from '@/doom/wad/lump'
import { DataTableHeader } from 'vuetify'
import { Level } from '@/doom/level/level'
import { Params } from '@/doom/doom/params'
import { Wad } from '@/doom/wad/wad'

const prefixes = [ 'B', 'kB', 'MB', 'GB' ]

type FileType = 'iwad' | 'pwad' | 'save' | 'config' | 'unknown' | LumpType

export type ExtendedFileInfo = FileInfo & {
  id: string
  type: FileType
}

function getType(item: FileInfo): FileType {
  let fileName = item.name.toLowerCase()
  const dot = fileName.lastIndexOf('.')
  const ext = fileName.substr(dot + 1)
  fileName = fileName.substr(0, dot)

  if (ext.endsWith('wad')) {
    if (item.buffer) {
      const identification = new Wad(item.buffer).identification
      switch (identification) {
      case 'IWAD':
        return 'iwad'
      case 'PWAD':
        return 'pwad'
      }
    }
    if ([ 'doom2', 'doomu', 'doom', 'doom1', 'plutonia', 'tnt', 'doom2f' ]
      .includes(fileName)) {
      return 'iwad'
    }
    return 'pwad'
  } else if (ext.endsWith('dsg')) {
    return 'save'
  } else if (ext.endsWith('cfg')) {
    return 'config'
  } else if (ext.endsWith('lmp') &&
    item.buffer !== undefined
  ) {
    return guessLumpType(item.buffer, fileName)
  }
  return 'unknown'
}

function extend(f: FileInfo): ExtendedFileInfo {
  return {
    ...f,
    id: f.name,
    type: getType(f),
  }
}
function extendWadLump(f: FileInfo, i: number, wad: string): ExtendedFileInfo {
  return {
    ...f,
    id: `${wad}#${i}`,
    type: f.buffer ? guessLumpType(f.buffer, f.name) : 'unknown',
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
      width: 180,
    },
  ]

  selected: ExtendedFileInfo[] = []
  select(value: ExtendedFileInfo): void {
    if (value.type === 'patch') {
      this.selected = [ value ]
      this.$emit('selectedChange', value)
    } else {
      this.selected = []
      this.$emit('selectedChange', null)
    }
  }

  pwadName = ''
  iwadName = ''

  async mounted(): Promise<void> {
    await this.initFiles()
  }
  @Watch('parent')
  async initFiles(): Promise<void> {
    if (this.parent &&
      this.parent.toLowerCase().endsWith('.wad')
    ) {
      const buffer = await fs.open(this.parent)
      if (buffer) {
        const wad = new Wad(buffer)
        const wadName = this.parent
        if (wad.identification === 'IWAD') {
          this.iwadName = wadName
        } else {
          this.pwadName = wadName
        }

        this.files = wad.lumps.map((f, i) => extendWadLump(f, i, wadName))
        return
      }
    }
    this.iwadName = ''
    this.pwadName = ''
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
    case 'iwad':
      return 'IWAD'
    case 'pwad':
      return 'PWAD'
    case 'save':
      return 'Save game'
    case 'config':
      return 'Configuration'
    default:
      return type[0].toUpperCase() + type.substr(1)
    }
  }

  canPlay(item: ExtendedFileInfo): boolean {
    const playable: FileType[] = [ 'iwad', 'pwad', 'demo', 'config', 'level' ]
    return playable.includes(item.type)
  }
  canBrowse(item: ExtendedFileInfo): boolean {
    return item.type === 'iwad' || item.type === 'pwad'
  }
  getParam(item: ExtendedFileInfo): Partial<Params> {
    const base: Partial<Params> = {}
    if (this.iwadName) {
      base.iwad = this.iwadName
    }
    if (this.pwadName) {
      base.pwads = [ this.pwadName ]
    }
    switch (item.type) {
    case 'iwad':
      return { iwad: item.name }
    case 'pwad':
      return { pwads: [ item.name ] }
    case 'demo':
      return { ...base, playDemo: item.name }
    case 'config':
      return { ...base, config: item.name }
    case 'level':
    {
      const level = new Level(item.buffer || new ArrayBuffer(0), item.name)
      return { ...base, episode: level.episode, map: level.map }
    }
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
    if (this.iwadName || this.pwadName) {
      a.download += '.LMP'
    }
    a.click()
  }

  canRemove(): boolean {
    return !(this.iwadName || this.pwadName)
  }
  async remove({ name }: FileInfo): Promise<void> {
    await fs.rm(name)
    await this.initFiles()
  }
}
