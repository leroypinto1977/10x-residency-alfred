/* A single photograph from the sessions, dropped into a text section.

   Deliberately not next/image, for the same reason the photo wall isn't:
   these files are already cut to the one size they are displayed at, so
   the optimizer has nothing left to decide, and a static file carries no
   generated srcset for a crawler to walk up to the 3840px entry. That
   srcset is what produced this project's transfer blowout once already.

   Sized attributes are required rather than optional — without them the
   section reflows when the photograph decodes, and every one of these
   sits above the fold of something. */

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /* Omit for a photograph that is purely atmospheric — a caption that only
     restates the alt text is noise read twice. */
  caption?: string;
  priority?: boolean;
};

export default function RoomPhoto({
  src,
  alt,
  width,
  height,
  className = "",
  caption,
  priority = false,
}: Props) {
  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
