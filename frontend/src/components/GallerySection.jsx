import { useRef, useState } from "react";
import { api, tokenStore } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash, UploadSimple } from "@phosphor-icons/react";

/**
 * GallerySection — supports both URL-add and file-upload to object storage.
 * Shows seed (default) images first as inspiration, then user images.
 */
export default function GallerySection({
    categorySlug,
    images,
    setImages,
    seedImages = [],
}) {
    const [url, setUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const addUrl = async (e) => {
        e?.preventDefault?.();
        if (!url.trim()) return;
        try {
            const r = await api.post("/images", {
                category_slug: categorySlug,
                url: url.trim(),
                caption: caption.trim(),
            });
            setImages([r.data, ...images]);
            setUrl("");
            setCaption("");
            toast.success("Image added");
        } catch {
            toast.error("Could not add image");
        }
    };

    const onFileChosen = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const upload = await api.post("/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const r = await api.post("/images", {
                category_slug: categorySlug,
                storage_path: upload.data.storage_path,
                caption: caption.trim(),
            });
            setImages([r.data, ...images]);
            setCaption("");
            toast.success("Photo uploaded");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload failed");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const del = async (img) => {
        await api.delete(`/images/${img.id}`);
        setImages(images.filter((x) => x.id !== img.id));
    };

    const renderSrc = (img) => {
        if (img.storage_path) {
            const t = tokenStore.get();
            return `${process.env.REACT_APP_BACKEND_URL}/api/files/${img.storage_path}?auth=${t}`;
        }
        return img.url;
    };

    return (
        <div data-testid="gallery-section" className="space-y-8">
            {/* Inspiration row (seed) */}
            {seedImages.length > 0 && (
                <div>
                    <p className="tracking-eyebrow text-ink-muted mb-3">
                        Inspiration · curated for this chapter
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {seedImages.map((src, i) => (
                            <figure
                                key={i}
                                data-testid={`seed-image-${i}`}
                                className="relative aspect-[4/5] overflow-hidden border border-line rounded-md"
                            >
                                <img
                                    src={src}
                                    alt="Inspiration"
                                    className="absolute inset-0 w-full h-full object-cover opacity-95"
                                />
                            </figure>
                        ))}
                    </div>
                </div>
            )}

            {/* Add image form */}
            <div className="bg-paper-soft/40 border border-line rounded-md p-5">
                <p className="tracking-eyebrow text-ink-muted mb-4">Add your own</p>

                <div className="flex flex-col md:flex-row md:items-end gap-3">
                    <input
                        data-testid="image-url-input"
                        className="atlas-input flex-1"
                        placeholder="Paste an image URL…"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <input
                        data-testid="image-caption-input"
                        className="atlas-input flex-1"
                        placeholder="Caption (optional)"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={addUrl}
                        data-testid="image-add-url-btn"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-paper rounded-md tracking-wide text-sm hover:bg-forest-soft transition-colors"
                    >
                        <Plus size={14} weight="thin" /> Add by URL
                    </button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        data-testid="image-file-input"
                        onChange={onFileChosen}
                    />
                    <button
                        type="button"
                        data-testid="image-upload-btn"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-forest text-forest rounded-md tracking-wide text-sm hover:bg-forest hover:text-paper transition-colors disabled:opacity-50"
                    >
                        <UploadSimple size={14} weight="thin" />
                        {uploading ? "Uploading…" : "Upload from device"}
                    </button>
                    <p className="text-xs text-ink-muted">
                        JPG/PNG/WEBP/GIF, up to 8MB
                    </p>
                </div>
            </div>

            {/* User images */}
            <div>
                <p className="tracking-eyebrow text-ink-muted mb-3">
                    Your gallery · {images.length}
                </p>
                {images.length === 0 ? (
                    <p className="text-ink-muted italic font-display-italic">
                        No images yet. Curate the visuals that inspire this chapter.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((img) => (
                            <figure
                                key={img.id}
                                data-testid={`image-${img.id}`}
                                className="relative aspect-[4/5] overflow-hidden bg-paper-soft border border-line rounded-md group"
                            >
                                <img
                                    src={renderSrc(img)}
                                    alt={img.caption || "Atlas image"}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {img.caption && (
                                    <figcaption className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-paper text-sm italic font-display-italic">
                                        {img.caption}
                                    </figcaption>
                                )}
                                <button
                                    onClick={() => del(img)}
                                    data-testid={`image-delete-${img.id}`}
                                    className="absolute top-2 right-2 p-1.5 bg-paper/90 rounded-full text-ink-muted hover:text-terracotta opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash size={14} weight="thin" />
                                </button>
                            </figure>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
