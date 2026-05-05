import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash } from "@phosphor-icons/react";

export default function GallerySection({ categorySlug, images, setImages }) {
    const [url, setUrl] = useState("");
    const [caption, setCaption] = useState("");

    const add = async (e) => {
        e.preventDefault();
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
        } catch {
            toast.error("Could not add image");
        }
    };

    const del = async (img) => {
        await api.delete(`/images/${img.id}`);
        setImages(images.filter((x) => x.id !== img.id));
    };

    return (
        <div data-testid="gallery-section" className="space-y-6">
            <form
                onSubmit={add}
                className="flex flex-col md:flex-row md:items-end gap-3"
            >
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
                    type="submit"
                    data-testid="image-add-btn"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-paper rounded-md tracking-wide text-sm hover:bg-forest-soft transition-colors"
                >
                    <Plus size={14} weight="thin" /> Add
                </button>
            </form>
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
                                src={img.url}
                                alt={img.caption || "Atlas image"}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {img.caption && (
                                <figcaption className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-ink/80 to-transparent text-paper text-sm italic font-display-italic">
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
    );
}
