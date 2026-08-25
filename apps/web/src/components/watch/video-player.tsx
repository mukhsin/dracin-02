import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  src: string | null;
  onRetry?: () => void;
}

interface PlayerOverlayProps {
  message: string;
  onRetry?: () => void;
}

function PlayerOverlay({ message, onRetry }: PlayerOverlayProps) {
  return (
    <div
      role="alert"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center"
    >
      <p className="text-sm font-medium text-white">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Coba Lagi
        </Button>
      ) : null}
    </div>
  );
}

const NATIVE_HLS_TYPE = "application/vnd.apple.mpegurl";

export function VideoPlayer({ src, onRetry }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setFailed(false);

    const handleNativeError = () => setFailed(true);
    let hls: Hls | null = null;

    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      hls = new Hls({ capLevelToPlayerSize: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setFailed(true);
      });
    } else if (
      src.endsWith(".m3u8") &&
      video.canPlayType(NATIVE_HLS_TYPE) !== ""
    ) {
      video.src = src;
      video.addEventListener("error", handleNativeError);
    } else if (!src.endsWith(".m3u8")) {
      video.src = src;
      video.addEventListener("error", handleNativeError);
    } else {
      setFailed(true);
    }

    return () => {
      video.removeEventListener("error", handleNativeError);
      if (hls) {
        hls.destroy();
      } else {
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {src ? (
        <>
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            className="size-full"
          />
          {failed ? (
            <PlayerOverlay message="Video gagal dimuat." onRetry={onRetry} />
          ) : null}
        </>
      ) : (
        <PlayerOverlay message="Video belum tersedia untuk episode ini." onRetry={onRetry} />
      )}
    </div>
  );
}
