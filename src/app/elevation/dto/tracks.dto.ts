export class Point {
  lat: number
  lon: number
  alt?: number
}

export class Note {
  point: Point
}

export class Track {
  points: Point[]
  notes: Note[]
}
