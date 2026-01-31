import imageCompression from 'browser-image-compression'

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  maxSizeMB?: number
  quality?: number
}

const defaultOptions: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  maxSizeMB: 0.5,  // 500KB
  quality: 0.8,
}

/**
 * 이미지를 압축하고 리사이징합니다.
 * - 최대 1200px로 리사이징
 * - 500KB 이하로 압축
 * - WebP 형식은 브라우저 지원에 따라 자동 적용
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...defaultOptions, ...options }

  // 이미 충분히 작은 파일은 그대로 반환
  if (file.size <= (opts.maxSizeMB! * 1024 * 1024)) {
    return file
  }

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB!,
      maxWidthOrHeight: Math.max(opts.maxWidth!, opts.maxHeight!),
      useWebWorker: true,
      initialQuality: opts.quality,
    })

    console.log(`이미지 압축: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)} (${Math.round((1 - compressedFile.size / file.size) * 100)}% 감소)`)

    return compressedFile
  } catch (error) {
    console.error('이미지 압축 실패:', error)
    return file // 압축 실패 시 원본 반환
  }
}

/**
 * 썸네일용 이미지 압축 (더 작은 크기)
 */
export async function compressThumbnail(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 800,
    maxHeight: 600,
    maxSizeMB: 0.2,  // 200KB
    quality: 0.75,
  })
}

/**
 * 본문 삽입용 이미지 압축
 */
export async function compressContentImage(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    maxSizeMB: 0.5,  // 500KB
    quality: 0.8,
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
