export function isVideo(url: string | null | undefined): boolean {
  if (!url) return false;
  // Check for common video extensions or data types
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url) || url.includes('video');
}
