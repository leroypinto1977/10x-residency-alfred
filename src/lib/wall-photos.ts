/**
 * Photographs from a GOAT session, used by the PhotoWall section.
 *
 * These are served as pre-sized static WebP rather than through next/image.
 * The wall renders 24 tiles at a known, fixed size, so the optimizer has
 * nothing to decide — and a static asset has no `<img src>` fallback for a
 * crawler to pull a large variant from, which is exactly how this project
 * burned 75 GB of transfer in a day once already. Tiles are 620px on their
 * longest edge (~16 KB each); the lightbox pair is 1400px and is only ever
 * fetched when someone opens one.
 *
 * `w`/`h` are the tile's intrinsic pixels. They set each tile's
 * aspect-ratio, which is what stops the columns reflowing as images decode.
 */
export interface WallPhoto {
  /** Frame number — also the asset basename: /wall/{id}.webp, /wall/{id}-lg.webp */
  id: string;
  /** Describes the frame for anyone who can't see it. */
  alt: string;
  /** Shown in the lightbox. Describes what's in the frame, nothing more. */
  caption: string;
  w: number;
  h: number;
}

const L = { w: 620, h: 413 };
const P = { w: 413, h: 620 };

export const WALL_PHOTOS: WallPhoto[] = [
  { id: "4202", alt: "Three founders leaning over a table, sorting printed cards into groups", caption: "Working through the material, table by table.", ...L },
  { id: "5880", alt: "Front row of the audience watching the speaker, notes on the table in front of them", caption: "Front row.", ...L },
  { id: "4231", alt: "The speaker in a blue suit presenting beside a wall of windows looking onto forested hills", caption: "Making the point.", ...L },
  { id: "5769", alt: "The speaker in a maroon blazer framed between two tall ivory sculptures", caption: "Holding the floor.", ...L },
  { id: "4192", alt: "Founders seated in rows reading through printed worksheets", caption: "Worksheets out.", ...L },
  { id: "5907", alt: "The room seen from behind the speaker's shoulder, faces turned toward him", caption: "The view from the front.", ...L },

  { id: "5779", alt: "Black and white frame of the speaker with a hand raised, mid-sentence", caption: "A show of hands.", ...L },
  { id: "4211", alt: "Founders holding printed cards up in the air during an exercise", caption: "Hands up.", ...L },
  { id: "5884", alt: "Audience seated at small tables in the evening, watching intently", caption: "Nobody checked a phone.", ...L },
  { id: "4243", alt: "The speaker addressing the room, seen past the heads of two founders in front", caption: "No back row.", ...P },
  { id: "5811", alt: "The speaker mid-gesture, a GOAT-lettered jacket blurred in the foreground", caption: "One rule, repeated.", ...L },
  { id: "5865", alt: "A founder standing to read from his notes while someone films on a phone", caption: "Reading his numbers out loud.", ...L },

  { id: "5748", alt: "Wide view of the evening room, the speaker standing at the front", caption: "One problem at a time.", ...L },
  { id: "4223", alt: "The speaker with both arms open, addressing founders seated at the front", caption: "Working the room.", ...L },
  { id: "5796", alt: "The speaker laughing, caught mid-turn", caption: "When it lands.", ...P },
  { id: "5869", alt: "Black and white frame of the room from the back, the speaker lit at the front", caption: "Listening, which is most of it.", ...L },
  { id: "4203", alt: "Founders comparing printed cards laid out across their laps", caption: "Sorting the pieces.", ...L },
  { id: "5847", alt: "A founder standing to speak, holding a sheet of notes, the speaker listening", caption: "A founder takes the floor.", ...L },

  { id: "4292", alt: "The venue's glass room with the hills visible through the far wall", caption: "The room, and what's outside it.", ...L },
  { id: "5921", alt: "Founders in the audience laughing at something said from the front", caption: "The laugh that means it landed.", ...L },
  { id: "5788", alt: "Black and white frame of the speaker gesturing, a figure watching behind him", caption: "Said again, slower.", ...L },
  { id: "5745", alt: "The speaker silhouetted against blue light at the front of the evening room", caption: "Evening session.", ...L },
  { id: "5776", alt: "The speaker in profile beside an ivory sculpture, hand raised", caption: "Mid-answer.", ...P },
  { id: "5806", alt: "The speaker in conversation, a GOAT-lettered jacket in the foreground", caption: "The jacket.", ...L },
];

/**
 * Deals the photos across `count` columns round-robin rather than slicing
 * them into blocks. Round-robin keeps the curation's day/night and
 * wide/portrait alternation spread across the wall; slicing would stack all
 * the daylight frames in column one.
 */
export function dealIntoColumns(photos: WallPhoto[], count: number): WallPhoto[][] {
  const columns: WallPhoto[][] = Array.from({ length: count }, () => []);
  photos.forEach((photo, i) => columns[i % count].push(photo));
  return columns;
}
