import Dexie, { Table } from 'dexie'

type BufferFile = {
  type: 'buffer',
  buffer: ArrayBuffer
}
type UriFile = {
  type: 'uri',
  uri: string,
}

type DbFile = (BufferFile | UriFile) & {
  size?: number,
}

export interface FileInfo {
  name: string
  size: number
  buffer: ArrayBuffer | undefined
}

class FS {
  private table: Table<DbFile, string>
  constructor() {
    const db = new Dexie('fs')

    db.version(1).stores({
      files: '',
    })

    this.table = db.table('files')
  }

  async open(name: string): Promise<ArrayBuffer | undefined> {
    let f = await this.table.get(name)
    let exists = true
    if (f === undefined) {
      exists = false
      f = { uri: name, type: 'uri' }
    }

    let buffer: ArrayBuffer

    switch (f.type) {
    case 'buffer':
      buffer = f.buffer
      break
    case 'uri': {
      const res = await fetch(f.uri)
      if (!res.ok) {
        return undefined
      }
      buffer = await res.arrayBuffer()
      break
    }
    default:
      return undefined
    }

    if (exists && f.size !== buffer.byteLength) {
      await this.table.update(name, { size: f.size })
    }

    return buffer
  }

  async write(name: string, buffer: ArrayBuffer, overwrite?: boolean): Promise<string | undefined>
  async write(name: string, uri: string, overwrite?: boolean): Promise<string | undefined>
  async write(name: string, input: string | ArrayBuffer, overwrite = true): Promise<string | undefined> {
    if (!overwrite) {
      if (await this.table.get(name) !== undefined) {
        return undefined
      }
    }
    let body: DbFile
    if (typeof input === 'string') {
      body = { type: 'uri', uri: input }
    } else {
      body = { type: 'buffer', buffer: input, size: input.byteLength }
    }
    return await this.table.put(body, name)
  }

  async rm(name: string): Promise<void> {
    this.table.delete(name)
  }

  async ls(): Promise<readonly FileInfo[]> {
    const collection = this.table.toCollection()

    const list: FileInfo[] = []

    await collection.each((f, { primaryKey }) => {
      list.push({
        name: primaryKey,
        size: f.size || 0,
        buffer: f.type === 'buffer' ? f.buffer : undefined,
      })
    })

    return list
  }
}

export const fs = new FS()
