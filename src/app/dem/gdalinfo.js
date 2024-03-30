import fs from 'fs'
// const fs = require('fs')

export async function gdalInfo(source) {
  const geotiff = await import('geotiff')
  const fromArrayBuffer = geotiff.fromArrayBuffer

  const { resolution, directory, file } = source
  const tiff = await fromArrayBuffer(fs.readFileSync(directory + file).buffer)
  const image = await tiff.getImage()

  const { ModelPixelScale: s, ModelTiepoint: t } = image.fileDirectory
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sx, sy, sz] = s
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [px, py, k, gx, gy, gz] = t

  const rasters = await image.readRasters()
  const { width, height } = rasters

  const info = {
    dem: {
      directory,
      resolution,
      modelPixelScaleX: sx,
      modelPixelScaleY: sy
    },
    tile: {
      file,
      width,
      height,
      region: {
        maxLon: gx + sx * width,
        maxLat: gy,
        minLon: gx,
        minLat: gy - sy * height
      }
    }
  }

  fs.closeSync(fs.openSync(directory + file, 'r'))

  return info
}

// ;(async function () {
//   const image = await gdalInfo({
//     directory: '/geodata/srtm-250m/',
//     file: 'SRTM_NE_250m_3_0.tif'
//   })
//   console.log(image)
// })()
