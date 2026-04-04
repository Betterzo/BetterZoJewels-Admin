import React, { useRef, useState } from "react";
import { uploadTourImage } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type ImageUploaderProps = {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  /** Disables add/remove and file picker (e.g. while form is submitting) */
  disabled?: boolean;
  /** Called when an upload starts (true) or finishes (false) */
  onUploadingChange?: (uploading: boolean) => void;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  multiple,
  disabled = false,
  onUploadingChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const busy = disabled || isUploading;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      if (multiple) {
        const arr = await Promise.all(Array.from(files).map((f) => uploadTourImage(f)));
        onChange([...(Array.isArray(value) ? value : []), ...arr]);
        toast.success(arr.length > 1 ? "Images uploaded" : "Image uploaded");
      } else {
        const imgUrl = await uploadTourImage(files[0]);
        if (!imgUrl) {
          toast.error("Upload did not return an image URL");
          return;
        }
        onChange(imgUrl);
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      e.target.value = "";
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  const handleRemove = (idx: number) => {
    if (busy) return;
    if (Array.isArray(value)) {
      onChange(value.filter((_, i) => i !== idx));
    }
  };

  return (
    <div>
      <label className="font-medium">{label}</label>
      {isUploading && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Uploading…
        </p>
      )}
      <div className="flex gap-2 mt-1 overflow-x-auto pb-2" style={{ maxWidth: 600 }}>
        {Array.isArray(value)
          ? value.map((img, idx) => (
              <div key={`${img}-${idx}`} className="relative w-24 h-24 flex-shrink-0">
                <img src={img} alt="" className="w-24 h-24 object-cover rounded" />
                <button
                  type="button"
                  disabled={busy}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs disabled:opacity-50"
                  onClick={() => handleRemove(idx)}
                >
                  ×
                </button>
              </div>
            ))
          : value && (
              <img src={value} alt="" className="w-24 h-24 object-cover rounded" />
            )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          disabled={busy}
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={busy}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 flex-shrink-0 disabled:pointer-events-none disabled:opacity-60"
          onClick={() => !busy && inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            "+"
          )}
        </button>
      </div>
    </div>
  );
};