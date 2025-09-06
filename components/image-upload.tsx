"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, ImageIcon, Video, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOptimizedImageUrl } from "@/lib/imagekit-client";

export interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
  size: number;
  fileId?: string;
  filePath?: string;
}

interface ImageUploadProps {
  initialMedia?: MediaFile[];
  onMediaChange: (media: MediaFile[]) => void;
  maxImages?: number;
  folder?: string;
  allowVideos?: boolean;
  maxVideoSize?: number;
}

export function ImageUpload({
  initialMedia = [],
  onMediaChange,
  maxImages = 5,
  folder = "products",
  allowVideos = false,
  maxVideoSize = 50,
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMediaFiles(initialMedia);
  }, [initialMedia]);

  const handleFilesUpload = async (files: File[]) => {
    if (!files.length) return;

    if (mediaFiles.length + files.length > maxImages) {
      toast({
        title: "Demasiados archivos",
        description: `Solo puedes subir un máximo de ${maxImages} archivos.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedFiles: MediaFile[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      if (isVideo && (!allowVideos || file.size > maxVideoSize * 1024 * 1024)) {
        toast({
          title: isVideo ? "Video muy grande" : "Tipo de archivo no válido",
          description: isVideo
            ? `El video debe ser menor a ${maxVideoSize}MB`
            : "Solo se permiten imágenes.",
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
          uploadedFiles.push({
            id: result.data.fileId,
            url: result.data.url,
            type: file.type.startsWith("image/") ? "image" : "video",
            name: result.data.name,
            size: result.data.size,
            fileId: result.data.fileId,
            filePath: result.data.filePath,
          });
        } else {
          toast({
            title: "Error al subir",
            description: result.error || "No se pudo subir el archivo.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error de red",
          description: "No se pudo conectar con el servidor de subida.",
          variant: "destructive",
        });
      }
    }

    if (uploadedFiles.length > 0) {
      const updatedMedia = [...mediaFiles, ...uploadedFiles];
      setMediaFiles(updatedMedia);
      onMediaChange(updatedMedia);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFilesUpload(files);
  };

  const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();
      toast({
        title: "Imagen pegada",
        description: `Se ${
          imageFiles.length > 1 ? "han" : "ha"
        } detectado ${
          imageFiles.length
        } imagen(es) en el portapapeles. Subiendo...`,
      });
      handleFilesUpload(imageFiles);
    }
  };

  useEffect(() => {
    const dropzone = dropzoneRef.current;
    if (dropzone) {
      dropzone.addEventListener("paste", handlePaste as EventListener);
    }
    return () => {
      if (dropzone) {
        dropzone.removeEventListener("paste", handlePaste as EventListener);
      }
    };
  }, [handleFilesUpload]);

  const removeFile = (fileIdToRemove: string) => {
    const updatedMedia = mediaFiles.filter((f) => f.id !== fileIdToRemove);
    setMediaFiles(updatedMedia);
    onMediaChange(updatedMedia);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4" ref={dropzoneRef}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Archivos ({mediaFiles.length}/{maxImages})
          </p>
          <p className="text-xs text-gray-500">
            {allowVideos
              ? `Imágenes y videos (hasta ${maxVideoSize}MB)`
              : "Solo imágenes"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || mediaFiles.length >= maxImages}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? "Subiendo..." : "Agregar"}
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

      {mediaFiles.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaFiles.map((file) => (
            <Card key={file.id} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  {file.type === "image" ? (
                    <img
                      src={getOptimizedImageUrl(file.url, {
                        width: 300,
                        height: 300,
                      })}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                      <Play className="w-12 h-12 text-white opacity-70" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Arrastra archivos aquí, pega una imagen o haz clic para seleccionar
          </p>
        </div>
      )}
    </div>
  );
}

