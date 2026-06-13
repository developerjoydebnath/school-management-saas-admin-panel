import NextImage from "next/image";
import React from "react";

export default function Image(props: React.ComponentProps<typeof NextImage>) {
  return (
    <NextImage
      {...props}
      placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8Ug8AAk0BZU1+kw8AAAAASUVORK5CYII="
    />
  );
}
