import sharp from "sharp";

// Turns an uploaded photo (JPEG, PNG or WebP) into a small round PNG for the PDF.
// PDF files can only embed JPEG or PNG, so WebP is converted, and large photos are shrunk.
export async function roundPhoto(input: Buffer | ArrayBuffer | Uint8Array, size = 320): Promise<Uint8Array | null> {
  try {
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(input as ArrayBuffer);
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
    const out = await sharp(buf)
      .rotate() // respect the phone's orientation
      .resize(size, size, { fit: "cover", position: "attention" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    return new Uint8Array(out);
  } catch {
    return null; // a broken image must never stop the PDF from downloading
  }
}

// Loads a public photo by URL (used for the student's profile picture).
export async function roundPhotoFromUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return roundPhoto(await res.arrayBuffer());
  } catch {
    return null;
  }
}
