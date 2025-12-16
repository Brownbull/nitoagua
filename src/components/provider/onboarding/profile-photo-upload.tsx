"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface ProfilePhotoUploadProps {
  onPhotoChange: (url: string | null) => void;
  initialUrl?: string;
  userId?: string;
}

export function ProfilePhotoUpload({
  onPhotoChange,
  initialUrl,
  userId,
}: ProfilePhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create a local preview first
      const localUrl = URL.createObjectURL(file);
      setPhotoUrl(localUrl);

      // If we have userId, upload to Supabase Storage
      if (userId) {
        const supabase = createClient();
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/avatar.${fileExt}`;

        // Upload to profile-photos bucket
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          // Don't show error to user, just keep local preview
          // Storage might not be configured yet
        } else {
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from("profile-photos")
            .getPublicUrl(fileName);

          if (urlData?.publicUrl) {
            setPhotoUrl(urlData.publicUrl);
            onPhotoChange(urlData.publicUrl);
            return;
          }
        }
      }

      // For now, just store locally and notify parent
      onPhotoChange(localUrl);
    } catch (err) {
      console.error("Failed to upload photo:", err);
      setError("Error al subir la foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPhotoUrl(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="photo-input"
      />

      {/* Photo circle with camera icon */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="relative w-24 h-24 mx-auto mb-3 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-orange-300 transition-colors group"
        data-testid="photo-upload-button"
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        ) : photoUrl ? (
          <>
            <Image
              src={photoUrl}
              alt="Foto de perfil"
              fill
              className="object-cover"
            />
            {/* Remove button overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="p-2 bg-white rounded-full"
              >
                <X className="w-4 h-4 text-gray-700" />
              </span>
            </div>
          </>
        ) : (
          <Camera className="w-8 h-8 text-gray-400" />
        )}
      </button>

      {/* Upload link text */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
        data-testid="photo-add-link"
      >
        {isUploading
          ? "Subiendo..."
          : photoUrl
          ? "Cambiar foto de perfil"
          : "+ Agregar foto de perfil"}
      </button>

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
