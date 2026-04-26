import { useMemo, useState } from "react";
import { Expand, Map, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  url: string;
}

export function PropertyGallery({
  title,
  images,
  videoUrl,
  mapEmbedUrl,
}: {
  title: string;
  images: GalleryImage[];
  videoUrl?: string | null;
  mapEmbedUrl?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [tab, setTab] = useState<"photos" | "video" | "map">("photos");
  const activeImage = useMemo(() => images[activeIndex] ?? images[0], [activeIndex, images]);

  return (
    <>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 md:px-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "photos", label: "Gallery" },
              { id: "video", label: "Video", disabled: !videoUrl },
              { id: "map", label: "Map", disabled: !mapEmbedUrl },
            ].map((entry) => (
              <button
                key={entry.id}
                type="button"
                disabled={entry.disabled}
                onClick={() => setTab(entry.id as "photos" | "video" | "map")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === entry.id
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
          {tab === "photos" ? (
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setFullscreenOpen(true)}>
              <Expand className="h-4 w-4" />
              Fullscreen
            </Button>
          ) : null}
        </div>

        {tab === "photos" ? (
          <div className="p-4 md:p-6">
            <div className="overflow-hidden rounded-[1.75rem] bg-slate-100">
              <img src={activeImage?.url} alt={title} className="h-[320px] w-full object-cover md:h-[520px]" />
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    index === activeIndex ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={image.url} alt={title} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "video" && videoUrl ? (
          <div className="p-4 md:p-6">
            <div className="overflow-hidden rounded-[1.75rem] bg-slate-950">
              <div className="aspect-video">
                <iframe
                  src={videoUrl}
                  title={`${title} video`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === "map" && mapEmbedUrl ? (
          <div className="p-4 md:p-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200">
              <iframe title={`${title} map`} src={mapEmbedUrl} className="h-[320px] w-full md:h-[520px]" loading="lazy" />
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-6xl border-slate-200 bg-white p-4 sm:rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
            <img src={activeImage?.url} alt={title} className="max-h-[78vh] w-full object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PropertyGallery;
