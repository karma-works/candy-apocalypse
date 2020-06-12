import { Doom } from '../../src/doom/doom'
import { Rendering } from '../../src/rendering/rendering'
import { expect } from 'chai'

describe('Rendering', () => {
  let rendering: Rendering
  beforeEach(() => {
    rendering = new Rendering(new Doom())
  })

  describe('pointOnSide', () => {
    [
      [ -14680064, -211812352, -12582912, -212860928, 0, 2097152, 1 ],
      [ -6291456, -216006656, -4194304, -205520896, 0, -12582912, 0 ],
      [ -14680064, -211812352, -16777216, -205520896, 0, 1048576, 0 ],
      [ -2097152, -211812352, -4194304, -205520896, 0, -12582912, 1 ],
      [ -14680064, -211812352, -13631488, -209715200, -2097152, 0, 1 ],
      [ 112197632, -140509184, 109051904, -138412032, 33554432, 0, 0 ],
      [ -14680064, -211812352, -15728640, -213909504, 2097152, 0, 1 ],
      [ -14680064, -211812352, -20971520, -216006656, -1048576, 0, 0 ],
      [ -14680064, -211812352, -12582912, -210763776, -1048576, 1048576, 1 ],
      [ -2097152, -211812352, -4194304, -205520896, 7340032, 4194304, 0 ],
      [ -2097152, -211812352, 3145728, -222298112, -7340032, 4194304, 0 ],
      [ -14680064, -211812352, 4194304, -184549376, -46137344, -8388608, 1 ],
    ].forEach(([ x, y, nx, ny, ndx, ndy, expected ]) => {
      it(`calculates for x = ${x}, y = ${y}, node.x = ${nx}, node.y = ${ny}, node.dX = ${ndx}, node.dY = ${ndy}`, () => {
        expect(rendering.pointOnSide(x, y,
          { x: nx, y: ny, dX: ndx, dY: ndy, bbox: [], children: [] }),
        ).to.equal(expected)
      })
    })
  })

  describe('pointToAngle', () => {
    beforeEach(() => {
      rendering.viewX = 69206016
      rendering.viewY = -236978176
    });

    [
      [ 83886080, -232783872, 190191904 ],
      [ 88080384, -220200960, 496624608 ],
      [ 77594624, -201326592, 916055343 ],
      [ 88080384, -188743680, 818893647 ],
      [ 75497472, -239075328, -219737216 ],
      [ 71303168, -239075328, 3758096384 ],
      [ 16777216, -226492416, 2012743471 ],
      [ 33554432, -205520896, 1653291103 ],
      [ 44564480, -203423744, 1506729760 ],
      [ 46137344, -192937984, 1403371584 ],
      [ 62914560, -239075328, 2367220864 ],
      [ 67108864, -239075328, 2684354559 ],
    ].forEach(([ x, y, expected ]) => {
      it(`calculates for x = ${x}, y = ${y}`, () => {
        expect(rendering.pointToAngle(x, y)).to.equal(expected)
      })
    })
  })


  describe('pointToDist', () => {
    beforeEach(() => {
      rendering.viewX = 69206016
      rendering.viewY = -236978176
    });

    [
      [ 60817408, -222298112, 16905160 ],
      [ 58720256, -222298112, 18038637 ],
      [ 60817408, -220200960, 18757555 ],
      [ 58720256, -203423744, 35151751 ],
      [ 58720256, -220200960, 19786420 ],
      [ 46137344, -220200960, 28519684 ],
      [ 60817408, -203423744, 34587801 ],
      [ 60817408, -201326592, 36619942 ],
      [ 54525952, -192937984, 46423116 ],
      [ 63438848, -188743680, 48575449 ],
      [ 46137344, -192937984, 49704961 ],
      [ 33554432, -205520896, 47542216 ],
    ].forEach(([ x, y, expected ]) => {
      it(`calculates for x = ${x}, y = ${y}`, () => {
        expect(rendering.pointToDist(x, y)).to.equal(expected)
      })
    })
  })
})

/*
    // let args = `${x}, ${y}, (seg_t) &{ (vertex_t) &{${line.v1.x}, ${line.v1.y}}, (vertex_t) &{${line.v2.x}, ${line.v2.y}} }`
    const args = `${visAngle}`
    const global = `viewangle = ${this.viewAngle}; rw_normalangle = ${this.segsHandler.rwNormalAngle}; projection = ${this.projection}; detailshift = ${this.detailShift}; rw_distance = ${this.segsHandler.rwDistance};`

    function ret<T>(r: T): T {
      console.log(`${global} printf("%d", R_ScaleFromGlobalAngle(${args}) == ${r});`)
      return r
    }
*/
