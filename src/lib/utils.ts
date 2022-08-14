import { Icon, Image } from "@raycast/api";
import { getRgbFrom } from "./colors";
import { CssColor, LightState } from "./types";
import { getProgressIcon } from "@raycast/utils";

export function getLightIcon(lightState: LightState) {
  const progress = lightState.on ? (lightState.bri - 1) / 253 : 0;
  const color = getRgbFrom(lightState);
  return getProgressIcon(progress, color, { background: "green" });
}

export function getIconForColor(color: CssColor): Image {
  return { source: Icon.CircleFilled, tintColor: { light: color.value, dark: color.value, adjustContrast: false } };
}
