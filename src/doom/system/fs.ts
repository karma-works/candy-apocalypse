import Dexie, { Table } from 'dexie'

type BufferFile = {
  type: 'buffer',
  buffer: ArrayBuffer
}
type UriFile = {
  type: 'uri',
  uri: string,
}

type File = BufferFile | UriFile

class FS {
  private table: Table<File, string>
  constructor() {
    const db = new Dexie('fs')

    db.version(1).stores({
      files: '',
    })

    this.table = db.table('files')
  }

  async open(name: string): Promise<ArrayBuffer | undefined> {
    let f = await this.table.get(name)
    if (f === undefined) {
      f = { uri: name, type: 'uri' }
    }

    switch (f.type) {
    case 'buffer':
      return f.buffer
    case 'uri': {
      const res = await fetch(f.uri)
      if (!res.ok) {
        return undefined
      }
      return res.arrayBuffer()
    }
    default:
      return undefined
    }
  }

  async write(name: string, buffer: ArrayBuffer): Promise<string>
  async write(name: string, uri: string): Promise<string>
  async write(name: string, input: string | ArrayBuffer): Promise<string> {
    let body: File
    if (typeof input === 'string') {
      body = { type: 'uri', uri: input }
    } else {
      body = { type: 'buffer', buffer: input }
    }
    return await this.table.put(body, name)
  }
}

export const fs = new FS()
