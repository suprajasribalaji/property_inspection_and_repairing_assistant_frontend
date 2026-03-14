import { useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  file: File | null;
  preview: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

const ImageUploader = ({ file, preview, onFileSelect, onRemove }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) onFileSelect(f);
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`relative mx-auto w-full max-w-md rounded-2xl border-2 border-dashed transition-all ${
        file
          ? "border-primary/30 bg-card"
          : "cursor-pointer border-muted-foreground/20 bg-card hover:border-primary/50 hover:bg-secondary/50"
      } shadow-card`}
    >
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      <AnimatePresence mode="wait">
        {preview && file ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img src={preview} alt="Preview" className="w-full rounded-xl object-cover" style={{ maxHeight: 256 }} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute right-2 top-2 rounded-full bg-foreground/70 p-1.5 text-background transition hover:bg-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 truncate text-center text-sm text-muted-foreground">{file.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="mx-auto mt-2 block text-xs text-primary underline"
            >
              Change image
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 px-6 py-10"
          >
            <div className="rounded-2xl bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">Drag & drop your house image</p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse files</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>JPG, PNG, JPEG, WebP supported</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
