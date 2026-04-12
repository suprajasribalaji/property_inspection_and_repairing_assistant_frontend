import { useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  files: File[];
  previews: string[];
  onFilesSelect: (files: File[]) => void;
  onRemove: (index: number) => void;
}

const MAX_IMAGES = 10;

const ImageUploader = ({ files, previews, onFilesSelect, onRemove }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (dropped.length) onFilesSelect(dropped);
    },
    [onFilesSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (selected.length) onFilesSelect(selected);
    // Reset input so same files can be re-selected
    e.target.value = "";
  };

  const hasFiles = files.length > 0;
  const canAddMore = files.length < MAX_IMAGES;

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {/* Empty state — drag & drop zone */}
      {!hasFiles && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative mx-auto w-full max-w-md cursor-pointer rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-card shadow-card transition-all hover:border-primary/50 hover:bg-secondary/50"
        >
          <div className="flex flex-col items-center gap-4 px-6 py-10">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">
                Drag & drop your house images
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse — up to {MAX_IMAGES} images
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>JPG, PNG, JPEG, WebP supported</span>
            </div>
          </div>
        </div>
      )}

      {/* Image grid */}
      {hasFiles && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-full"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <AnimatePresence>
              {previews.map((preview, index) => (
                <motion.div
                  key={preview}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative overflow-hidden rounded-xl border border-border bg-card shadow-card"
                >
                  <img
                    src={preview}
                    alt={`Image ${index + 1}`}
                    className="h-36 w-full object-cover"
                  />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
                    className="absolute right-1.5 top-1.5 rounded-full bg-foreground/70 p-1 text-background transition hover:bg-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {/* Image number badge */}
                  <div className="absolute bottom-1.5 left-1.5 rounded-md bg-foreground/60 px-1.5 py-0.5 text-xs text-background">
                    {index + 1}
                  </div>
                </motion.div>
              ))}

              {/* Add more tile */}
              {canAddMore && (
                <motion.div
                  key="add-more"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => inputRef.current?.click()}
                  className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card transition-all hover:border-primary/50 hover:bg-secondary/50"
                >
                  <PlusCircle className="h-7 w-7 text-primary/60" />
                  <span className="text-xs text-muted-foreground">Add more</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{files.length} image{files.length > 1 ? "s" : ""} selected</span>
            <span>{MAX_IMAGES - files.length} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;