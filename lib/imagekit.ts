import ImageKit from "imagekit"

// Configuración del cliente de ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
})

// Configuración del cliente para el frontend
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
}

// Función para generar token de autenticación
export function getAuthenticationParameters() {
  const token = imagekit.getAuthenticationParameters()
  return token
}

// Función para optimizar URLs de imágenes
export function getOptimizedImageUrl(
  src: string,
  transformations?: {
    width?: number
    height?: number
    quality?: number
    format?: "webp" | "jpg" | "png"
    crop?: "maintain_ratio" | "force" | "at_least" | "at_max"
    focus?: "auto" | "face" | "center"
  },
) {
  if (!src.includes("ik.imagekit.io")) {
    return src // Si no es una imagen de ImageKit, devolver la URL original
  }

  const params = new URLSearchParams()

  if (transformations) {
    if (transformations.width) params.append("tr", `w-${transformations.width}`)
    if (transformations.height) params.append("tr", `h-${transformations.height}`)
    if (transformations.quality) params.append("tr", `q-${transformations.quality}`)
    if (transformations.format) params.append("tr", `f-${transformations.format}`)
    if (transformations.crop) params.append("tr", `c-${transformations.crop}`)
    if (transformations.focus) params.append("tr", `fo-${transformations.focus}`)
  }

  const queryString = params.toString()
  return queryString ? `${src}?${queryString}` : src
}

// Función para eliminar imagen de ImageKit
export async function deleteImage(fileId: string) {
  try {
    await imagekit.deleteFile(fileId)
    return true
  } catch (error) {
    console.error("Error deleting image from ImageKit:", error)
    return false
  }
}
