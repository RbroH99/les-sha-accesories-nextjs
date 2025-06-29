"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, ImageIcon, Video, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOptimizedImageUrl } from "@/lib/imagekit-client";

interface MediaFile {
  id: string; // Local ID or ImageKit fileId
  url: string; // Local URL or ImageKit URL
  type: "image" | "video";
  name: string;
  size: number;
  fileId?: string; // ImageKit fileId
  filePath?: string; // ImageKit filePath
}

interface ImageUploadProps {
  images: string[]; // Array of ImageKit URLs
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  allowVideos?: boolean;
  maxVideoSize?: number; // in MB
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  folder = "products",
  allowVideos = false,
  maxVideoSize = 50,
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Initialize mediaFiles from the `images` prop (ImageKit URLs)
    const initialMediaFiles: MediaFile[] = images.map((url) => ({
      id: url, // Use URL as ID for existing images
      url: getOptimizedImageUrl(url, { width: 100, height: 100, quality: 50 }), // Use optimized URL for thumbnail
      type: url.match(/\.(mp4|webm|mov)$/i) ? "video" : "image", // Basic type detection
      name: url.substring(url.lastIndexOf("/") + 1),
      size: 0, // Size is not available from URL, set to 0 or fetch if needed
      fileId: url.split("/").pop()?.split(".")[0], // Attempt to extract fileId from URL
      filePath: url.substring(url.indexOf("bisuteria/")), // Attempt to extract filePath
    }));
    setMediaFiles(initialMediaFiles);
  }, [images]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (mediaFiles.length + files.length > maxImages) {
      toast({
        title: "Demasiados archivos",
        description: `Solo puedes subir máximo ${maxImages} archivos`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && (!allowVideos || !isVideo)) {
        toast({
          title: "Tipo de archivo no válido",
          description: allowVideos
            ? "Solo se permiten imágenes y videos"
            : "Solo se permiten imágenes",
          variant: "destructive",
        });
        continue;
      }

      if (isVideo && file.size > maxVideoSize * 1024 * 1024) {
        toast({
          title: "Video muy grande",
          description: `El video debe ser menor a ${maxVideoSize}MB`,
          variant: "destructive",
        });
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      try {
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const uploadedFile: MediaFile = {
            id: result.data.fileId,
            url: result.data.url,
            type: isImage ? "image" : "video",
            name: result.data.name,
            size: result.data.size,
            fileId: result.data.fileId,
            filePath: result.data.filePath,
          };
          setMediaFiles((prev) => [...prev, uploadedFile]);
          uploadedUrls.push(result.data.url);
          toast({
            title: "Archivo subido",
            description: `${file.name} subido exitosamente.`,
          });
        } else {
          toast({
            title: "Error al subir archivo",
            description: result.error || "Ocurrió un error desconocido.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Error de red",
          description: "No se pudo conectar con el servidor de subida.",
          variant: "destructive",
        });
      }
    }

    onImagesChange([...images, ...uploadedUrls]);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = async (id: string) => {
    const fileToRemove = mediaFiles.find((f) => f.id === id);
    if (!fileToRemove || !fileToRemove.fileId) {
      toast({
        title: "Error al eliminar",
        description: "No se encontró el ID del archivo para eliminar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: fileToRemove.fileId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const updatedFiles = mediaFiles.filter((f) => f.id !== id);
        setMediaFiles(updatedFiles);
        onImagesChange(updatedFiles.map((f) => f.url));
        toast({
          title: "Archivo eliminado",
          description: `${fileToRemove.name} eliminado exitosamente.`,
        });
      } else {
        toast({
          title: "Error al eliminar archivo",
          description: result.error || "Ocurrió un error desconocido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error de red",
        description:
          "No se pudo conectar con el servidor para eliminar el archivo.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

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
                    <img
                      src={getOptimizedImageUrl(file.url, {
                        width: 300,
                        height: 300,
                        quality: 70,
                      })}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
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
                    <Badge
                      variant={file.type === "image" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {file.type === "image" ? (
                        <ImageIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <Video className="w-3 h-3 mr-1" />
                      )}
                      {file.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
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
            Haz clic en "Agregar archivos" para subir{" "}
            {allowVideos ? "imágenes y videos" : "imágenes"}
          </p>
        </div>
      )}
    </div>
  );
}
