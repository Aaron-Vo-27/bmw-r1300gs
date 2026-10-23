import { useState } from "react";

export function Cover({
  src,
  className = "",
  photoClassName = "media-photo",
}: {
  src: string;
  className?: string;
  photoClassName?: string;
}) {
  const [ok, setOk] = useState(Boolean(src));
  return (
    <div className={`grid overflow-hidden bg-line ${className}`}>
      {ok ? (
        <img
          src={src}
          alt=""
          onError={() => setOk(false)}
          className={`${photoClassName} h-full w-full object-cover [grid-area:1/1]`}
        />
      ) : (
        <div className="h-full min-h-24 w-full bg-[linear-gradient(160deg,#e4ddd0_0%,#faf8f4_70%)] [grid-area:1/1]" />
      )}
    </div>
  );
}
