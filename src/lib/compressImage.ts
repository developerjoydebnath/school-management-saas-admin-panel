import imageCompression from 'browser-image-compression';

const compressionCache = new Map<string, File>();

export async function compressImage(file: File): Promise<File> {
  const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
  if (compressionCache.has(cacheKey)) {
    return compressionCache.get(cacheKey)!;
  }

  const options = {
    maxSizeMB: 1, // Compress to 1MB max before sending to server
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressed = await imageCompression(file, options);
    compressionCache.set(cacheKey, compressed);
    return compressed;
  } catch (error) {
    console.error('Image compression failed:', error);
    // If compression fails, return the original file to let the server handle it
    return file;
  }
}
