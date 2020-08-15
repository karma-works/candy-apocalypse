import { Component, Vue } from 'vue-property-decorator'
import { FileInfo, fs } from '@/doom/system/fs'
import { DataTableHeader } from 'vuetify'
import { Params } from '@/doom/doom/params'

const prefixes = [ 'B', 'kB', 'MB', 'GB' ]

type FileType = 'wad' | 'save' | 'unknown'

@Component
export default class FilesTable extends Vue {

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

  async mounted(): Promise<void> {
    this.files = await fs.ls()
  }

  formatSize(size: number): string {
    const i = Math.max(
      Math.floor(Math.log(size) / Math.log(1000)),
      0)

    return `${(size / Math.pow(1000, i)).toFixed(2)} ${prefixes[i]}`
  }

  getType(item: FileInfo): FileType {
    if (item.name.toLowerCase().endsWith('.wad')) {
      return 'wad'
    } else if (item.name.toLowerCase().endsWith('.dsg')) {
      return 'save'
    }
    return 'unknown'
  }
  getLabel(item: FileInfo): string {
    switch (this.getType(item)) {
    case 'wad':
      return 'WAD'
    case 'save':
      return 'Save game'
    default:
      return 'Unknown'
    }
  }

  canPlay(item: FileInfo): boolean {
    return this.getType(item) === 'wad'
  }
  getParam(item: FileInfo): Partial<Params> {
    switch (this.getType(item)) {
    case 'wad':
      return { wad: item.name }
    default:
      return {}
    }
  }

  async download({ name }: FileInfo): Promise<void> {
    const buf = await fs.open(name)
    if (buf === undefined) {
      return
    }

    const blob = new Blob([ buf ])
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
  }

  async remove({ name }: FileInfo): Promise<void> {
    await fs.rm(name)
  }
}
