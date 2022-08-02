import { Color, ImageLike, showToast, ToastStyle } from "@raycast/api";
import { CssColor, getColor } from "./colors";
import { Light } from "./types";

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

  await showToast(ToastStyle.Failure, title, message);
}

export function getIcon(light: Light): ImageLike {
  if (!light.state.reachable) {
    return { source: "light-disconnected.png", tintColor: Color.SecondaryText };
  }

  const color = getColor(light);
  return {
    source: light.state.on ? "light-on.png" : "light-off.png",
    tintColor: { light: color, dark: color, adjustContrast: false },
  };
}

export function getAccessoryTitle(light: Light) {
  const percentage = light.state.brightness / 255;
  return percentage.toLocaleString("en", { style: "percent" });
}

export function getAccessoryIcon(light: Light): ImageLike {
  return { source: "circle.png", tintColor: getColor(light) };
}

export function getIconForColor(color: CssColor): ImageLike {
  return { source: "circle.png", tintColor: { light: color.value, dark: color.value, adjustContrast: false } };
}
