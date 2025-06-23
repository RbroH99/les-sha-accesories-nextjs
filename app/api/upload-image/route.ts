import { type NextRequest, NextResponse } from "next/server"
import { imagekit } from "@/lib/imagekit"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "products"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG and WebP are allowed." }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único para el archivo
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Subir a ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: `bisuteria/${folder}`,
      useUniqueFileName: false,
      tags: ["bisuteria", folder],
      transformation: {
        pre: "q-80,f-webp", // Optimización automática
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        fileId: uploadResponse.fileId,
        name: uploadResponse.name,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        size: uploadResponse.size,
        filePath: uploadResponse.filePath,
      },
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
