import { Component, Vue } from 'vue-property-decorator'
import { fs, FileInfo } from '@/doom/system/fs'
import { DataTableHeader } from 'vuetify'

const prefixes = ['B', 'kB', 'MB', 'GB']

@Component
export default class FilesTable extends Vue {

  files: readonly FileInfo[] = []

  headers: DataTableHeader<FileInfo>[] = [
    {
      text: 'Name',
      value: 'name'
    },
    {
      text: 'Size',
      value: 'size',
    },
    {
      text: 'Location',
      value: 'location',
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
}
