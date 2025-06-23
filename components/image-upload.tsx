"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ImageIcon, Video, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MediaFile {
  id: string
  url: string
  type: "image" | "video"
  name: string
  size: number
}

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  folder?: string
  allowVideos?: boolean
  maxVideoSize?: number // in MB
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  folder = "products",
  allowVideos = false,
  maxVideoSize = 50,
}: ImageUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    // Validate file count
    if (mediaFiles.length + files.length > maxImages) {
      toast({
        title: "Demasiados archivos",
        description: `Solo puedes subir máximo ${maxImages} archivos`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const newMediaFiles: MediaFile[] = []

      for (const file of files) {
        // Validate file type
        const isImage = file.type.startsWith("image/")
        const isVideo = file.type.startsWith("video/")

        if (!isImage && (!allowVideos || !isVideo)) {
          toast({
            title: "Tipo de archivo no válido",
            description: allowVideos ? "Solo se permiten imágenes y videos" : "Solo se permiten imágenes",
            variant: "destructive",
          })
          continue
        }

        // Validate video size
        if (isVideo && file.size > maxVideoSize * 1024 * 1024) {
          toast({
            title: "Video muy grande",
            description: `El video debe ser menor a ${maxVideoSize}MB`,
            variant: "destructive",
          })
          continue
        }

        // Create object URL for preview
        const url = URL.createObjectURL(file)
        const mediaFile: MediaFile = {
          id: `${Date.now()}-${Math.random()}`,
          url,
          type: isImage ? "image" : "video",
          name: file.name,
          size: file.size,
        }

        newMediaFiles.push(mediaFile)
      }

      setMediaFiles((prev) => [...prev, ...newMediaFiles])

      // Update images array with URLs (for compatibility)
      const allUrls = [...images, ...newMediaFiles.map((f) => f.url)]
      onImagesChange(allUrls)

      toast({
        title: "Archivos agregados",
        description: `${newMediaFiles.length} archivo(s) agregado(s) exitosamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar los archivos",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeFile = (id: string) => {
    const fileToRemove = mediaFiles.find((f) => f.id === id)
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url)
    }

    const updatedFiles = mediaFiles.filter((f) => f.id !== id)
    setMediaFiles(updatedFiles)

    // Update images array
    const updatedUrls = updatedFiles.map((f) => f.url)
    onImagesChange(updatedUrls)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Archivos multimedia ({mediaFiles.length}/{maxImages})
          </p>
          <p className="text-xs text-gray-500">
            {allowVideos
              ? `Imágenes (JPG, PNG, WebP) y videos (MP4, WebM) hasta ${maxVideoSize}MB`
              : "Imágenes (JPG, PNG, WebP)"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || mediaFiles.length >= maxImages}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Subiendo..." : "Agregar archivos"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowVideos ? "image/*,video/*" : "image/*"}
        onChange={handleFileSelect}
        className="hidden"
      />

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mediaFiles.map((file) => (
            <Card key={file.id} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  {file.type === "image" ? (
                    <img src={file.url || "/placeholder.svg"} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                      <Video className="w-8 h-8 mb-2" />
                      <p className="text-xs text-center px-2">{file.name}</p>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-70" />
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={file.type === "image" ? "default" : "secondary"} className="text-xs">
                      {file.type === "image" ? (
                        <ImageIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <Video className="w-3 h-3 mr-1" />
                      )}
                      {file.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mediaFiles.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay archivos seleccionados</p>
          <p className="text-sm text-gray-500">
            Haz clic en "Agregar archivos" para subir {allowVideos ? "imágenes y videos" : "imágenes"}
          </p>
        </div>
      )}
    </div>
  )
}
