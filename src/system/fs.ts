import Dexie, { Table } from 'dexie'

class FS {
  private table: Table<ArrayBuffer, string>
  constructor() {
    const db = new Dexie('fs')

    db.version(1).stores({
      files: '',
    })

    this.table = db.table('files')
  }

  async open(name: string): Promise<ArrayBuffer | undefined> {
    return await this.table.get(name)
  }

  async write(name: string, buffer: ArrayBuffer): Promise<string> {
    return await this.table.put(buffer, name)
  }
}

export const fs = new FS()
