import ImageKit from "imagekit";

// Configuración del cliente de ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

// Función para generar token de autenticación
export function getAuthenticationParameters() {
  const token = imagekit.getAuthenticationParameters();
  return token;
}

// Función para eliminar imagen de ImageKit
export async function deleteImage(fileId: string) {
  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error("Error deleting image from ImageKit:", error);
    return false;
  }
}
