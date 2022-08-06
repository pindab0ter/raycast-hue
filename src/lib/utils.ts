import { Icon, Image, showToast, Toast } from "@raycast/api";
import { CssColor, getRgbFrom } from "./colors";
import { LightState } from "./types";
import { getProgressIcon } from "@raycast/utils";
import Style = Toast.Style;

export async function showFailureToast<T>(
  error: T | Promise<T> | (() => T) | (() => Promise<T>),
  title = "Something went wrong"
) {
  if (!error) {
    return;
  }

  const unwrappedError = error instanceof Function ? error() : error;
  const resolvedError = await Promise.resolve(unwrappedError);
  const message = resolvedError
    ? resolvedError instanceof Error
      ? resolvedError.message
      : String(resolvedError)
    : undefined;

  await showToast(Style.Failure, title, message);
}

export function getLightIcon(lightState: LightState) {
  const progress = lightState.on ? (lightState.bri - 1) / 253 : 0;
  const color = getRgbFrom(lightState);
  return getProgressIcon(progress, color, { background: "green" });
}

export function getIconForColor(color: CssColor): Image {
  return { source: Icon.CircleFilled, tintColor: { light: color.value, dark: color.value, adjustContrast: false } };
}
