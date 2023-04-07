import { useMemo, useState } from "react";
import { createGradientPngUri } from "../lib/utils";
import { GradientUriCache, GradientUri, Id, Palette } from "../lib/types";
import { Cache } from "@raycast/api";

const gradientCache = new Cache({ namespace: "hue-scene-gradients" });

export default function useGradientUris(idsToPalettes: Map<Id, Palette>, width: number, height: number) {
  const [gradientUris, setGradientUris] = useState<GradientUriCache>(new Map<Id, GradientUri>());

  useMemo(() => {
    idsToPalettes.forEach((palette, id) => {
      if (palette.length === 0) {
        return;
      }

      const key = `${width}x${height}_${palette.join("_")}`;
      const cached = gradientCache.get(key);

      if (cached) {
        setGradientUris((gradients) => new Map(gradients).set(id, JSON.parse(cached)));
      } else {
        createGradientPngUri(palette, width, height).then((gradientUri) => {
          gradientCache.set(key, JSON.stringify(gradientUri));
          setGradientUris((gradients) => new Map(gradients).set(id, gradientUri));
        });
      }
    });
  }, [idsToPalettes]);

  return { gradientUris: gradientUris };
}