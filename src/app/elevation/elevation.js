import fs from 'fs'
// import { fromArrayBuffer } from 'geotiff'

function transform(a, b, M, roundToInt = false) {
  const round = (v) => (roundToInt ? v | 0 : v)
  return [round(M[0] + M[1] * a + M[2] * b), round(M[3] + M[4] * a + M[5] * b)]
}

export async function setTrackElevation(track, dems, tiles) {
  const geotiff = await import('geotiff')

  const elevationPoint = setElevationPoint(geotiff, dems, tiles)

  for (let point of track.points) {
    await elevationPoint(point)
  }

  for (let note of track.notes) {
    await elevationPoint(note.point)
  }

  return
}

function setElevationPoint(geotiff, dems, tiles) {
  const fromArrayBuffer = geotiff.fromArrayBuffer
  let filename, image, rasters

  return async function (point) {
    const start = new Date().getTime() //! Start time
    const { lat, lon, alt } = point

    const newFilename = !alt ? chooseTile(lat, lon, dems, tiles) : null
    if (!newFilename) {
      console.log('No appropriate tile for lat: ', lat, 'lon:', lon)
      return
    }

    if (filename !== newFilename) {
      const file = fs.readFileSync(newFilename)
      const tiff = await fromArrayBuffer(file.buffer)
      image = await tiff.getImage()
      rasters = await image.readRasters()
      filename = newFilename
    }

    console.log('Tile chosen:', newFilename)
    const calculatedAlt = await elevation(lat, lon, image, rasters)
    point.alt = calculatedAlt
    console.log('+', new Date().getTime() - start) //! End time
  }
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

async function elevation(lat, lon, image, rasters) {
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
  const { width, [0]: raster } = rasters
  const elev = raster[x + y * width]
  console.log(
    `The elevation  at (${lat.toFixed(6)},${lon.toFixed(6)}) is ${elev}m`
  )

  return elev
}
