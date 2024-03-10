import { FRACBITS } from '../doom/misc/fixed'
import { Line } from '../doom/rendering/defs/line'
import { Sector } from '../doom/rendering/defs/sector'
import { Sector as SectorMesh } from '../doom/webgl/objects/sector'
import { Seg } from '../doom/rendering/segs/seg'
import { Side } from '../doom/rendering/defs/side'
import { TextureLoader } from '../doom/webgl/texture-loader'
import { Vertex } from '../doom/rendering/data/vertex'
import { extend } from '@react-three/fiber'
import { useControls } from 'leva'
import { useMemo } from 'react'

extend({ Sector: SectorMesh })

interface StudioProps {
  textureLoader: TextureLoader
  width: number
  height: number
}

export default function Studio({ textureLoader, width, height }: StudioProps) {
  const defaultWall = useMemo(() => {
    const walls = textureLoader.textures
    const wall = walls[Math.floor(Math.random() * walls.length)]

    return wall.name
  }, [ textureLoader.textures ])

  const defaultFloor = useMemo(() => {
    let floors = textureLoader.flats.filter(({ name }) => name.toLowerCase().startsWith('floor'))
    if (floors.length === 0) {
      floors = textureLoader.flats
    }
    return floors[Math.floor(Math.random() * floors.length)].name
  }, [ textureLoader.flats ])

  const defaultCeiling = useMemo(() => {
    let ceilings = textureLoader.flats.filter(({ name }) => name.toLowerCase().startsWith('ceil'))
    if (ceilings.length === 0) {
      ceilings = textureLoader.flats
    }
    return ceilings[Math.floor(Math.random() * ceilings.length)].name
  }, [ textureLoader.flats ])

  const walls = textureLoader.textures.map(t => t.name)
  const flats = textureLoader.flats.map(t => t.name)

  const { wall, floor, ceiling } = useControls('Studio', {
    wall: {
      value: defaultWall,
      options: walls,
    },
    floor: {
      value: defaultFloor,
      options: flats.slice(1),
    },
    ceiling: {
      value: defaultCeiling,
      options: flats.slice(1),
    },
  })

  const wallPic = textureLoader.textures.findIndex(({ name }) => name === wall)
  const floorPic = textureLoader.flats.findIndex(({ name }) => name === floor)
  const ceilingPic = textureLoader.flats.findIndex(({ name }) => name === ceiling)

  const [ sector, segs, lines ] = useMemo(() => {
    const sector = new Sector(1, 0, height << FRACBITS, floorPic, ceilingPic, 200, 0, 0, null)

    const v = [
      new Vertex(-width / 2 << FRACBITS, -width / 2 << FRACBITS),
      new Vertex(-width / 2 << FRACBITS, +width / 2 << FRACBITS),
      new Vertex(+width / 2 << FRACBITS, +width / 2 << FRACBITS),
      new Vertex(+width / 2 << FRACBITS, -width / 2 << FRACBITS),
    ]

    const lines = [
      new Line(v[0], v[1]),
      new Line(v[1], v[2]),
      new Line(v[2], v[3]),
      new Line(v[3], v[0]),
    ]
    lines.forEach(l => l.frontSector = sector)

    const side = new Side(0, 0, 0, 0, wallPic, sector)

    const segs = [
      new Seg(0, v[0], v[1], 0, 0, side, lines[0], sector, null),
      new Seg(1, v[1], v[2], 0, 0, side, lines[1], sector, null),
      new Seg(2, v[2], v[3], 0, 0, side, lines[2], sector, null),
      new Seg(3, v[3], v[0], 0, 0, side, lines[3], sector, null),
    ]

    return [ sector, segs, lines ]
  }, [ width, height, ceilingPic, floorPic, wallPic ])

  return (
    <sector
      args={[ sector, segs, lines, textureLoader ]}
    />
  )
}
