"use client";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/imagekit-client";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpg" | "png";
  crop?: "maintain_ratio" | "force" | "at_least" | "at_max";
  focus?: "auto" | "face" | "center";
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = "webp",
  crop = "maintain_ratio",
  focus = "auto",
  className,
  fill,
  sizes,
  priority,
}: OptimizedImageProps) {
  const optimizedSrc = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format,
    crop,
    focus,
  });

  if (fill) {
    return (
      <Image
        src={optimizedSrc || "/placeholder.svg"}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={optimizedSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
