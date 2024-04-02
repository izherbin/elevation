import fs from 'fs'
// import { fromArrayBuffer } from 'geotiff'

function transform(a, b, M, roundToInt = false) {
  const round = (v) => (roundToInt ? v | 0 : v)
  return [round(M[0] + M[1] * a + M[2] * b), round(M[3] + M[4] * a + M[5] * b)]
}

export async function setTrackElevation(track, dems, tiles) {
  const geotiff = await import('geotiff')

  const elevations = []
  track.points.forEach(async (point) => {
    const { lat, lon, alt } = point

    if (!alt) {
      const filename = chooseTile(lat, lon, dems, tiles)
      if (!filename) {
        console.log('No appropriate tile for lat: ', lat, 'lon:', lon)
        return
      }
      elevations.push(
        elevation(lat, lon, filename, geotiff).then((alt) => {
          point.alt = alt
        })
      )
    }
  })

  track.notes.forEach(async (note) => {
    const { lat, lon, alt } = note.point

    if (!alt) {
      const filename = chooseTile(lat, lon, dems, tiles)
      if (!filename) {
        console.log('No appropriate tile for lat: ', lat, 'lon:', lon)
        return
      }
      elevations.push(
        elevation(lat, lon, filename, geotiff).then((alt) => {
          note.point.alt = alt
        })
      )
    }
  })

  await Promise.allSettled(elevations)
  return
}

function chooseTile(lat, lon, dems, tiles) {
  for (const dem of dems) {
    const { minLat, maxLat, minLon, maxLon } = dem.region
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
      for (const tile of tiles) {
        if (tile.dem.toString() === dem._id.toString()) {
          const { minLat, maxLat, minLon, maxLon } = tile.region
          if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon)
            return dem.directory + tile.file
        }
      }
    }
  }

  return null
}

async function elevation(lat, lon, filename, geotiff) {
  const fromArrayBuffer = geotiff.fromArrayBuffer

  const file = fs.readFileSync(filename).buffer
  const tiff = await fromArrayBuffer(file)
  const image = await tiff.getImage()

  // Construct the WGS-84 forward and inverse affine matrices:
  const { ModelPixelScale: s, ModelTiepoint: t } = image.fileDirectory
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sx, _sy, sz] = s
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [px, py, k, gx, gy, gz] = t
  const sy = -_sy // WGS-84 tiles have a "flipped" y component

  // const pixelToGPS = [gx, sx, 0, gy, 0, sy]
  // console.log(`pixel to GPS transform matrix:`, pixelToGPS)

  const gpsToPixel = [-gx / sx, 1 / sx, 0, -gy / sy, 0, 1 / sy]
  // console.log(`GPS to pixel transform matrix:`, gpsToPixel)

  // Convert a GPS coordinate to a pixel coordinate in our tile:
  // const [gx1, gy1, gx2, gy2] = image.getBoundingBox()
  // const lat = lerp(gy1, gy2, Math.random())
  // const long = lerp(gx1, gx2, Math.random())
  // console.log(`Looking up GPS coordinate (${lat.toFixed(6)},${lon.toFixed(6)})`)

  const [x, y] = transform(lon, lat, gpsToPixel, true)
  // console.log(`Corresponding tile pixel coordinate: [${x}][${y}]`)

  // And as each pixel in the tile covers a geographic area, not a single
  // GPS coordinate, get the area that this pixel covers:
  // const gpsBBox = [
  //   transform(x, y, pixelToGPS),
  //   transform(x + 1, y + 1, pixelToGPS)
  // ]
  // console.log(`Pixel covers the following GPS area:`, gpsBBox)

  // Finally, retrieve the elevation associated with this pixel's geographic area:
  const rasters = await image.readRasters()
  const { width, [0]: raster } = rasters
  const elev = raster[x + y * width]
  console.log(
    `The elevation  at (${lat.toFixed(6)},${lon.toFixed(6)}) is ${elev}m`
  )

  fs.closeSync(fs.openSync(filename, 'r'))

  return elev
}
