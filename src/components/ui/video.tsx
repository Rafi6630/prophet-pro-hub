interface VideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export default function Video({
  className,
  src,
  poster,
  autoPlay = false,
  muted = false,
  controls = true,
}: VideoProps) {
  return (
    <video
      className={className}
      src={src}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      controls={controls}
      playsInline
    />
  );
}
