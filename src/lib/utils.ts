import { Color, Icon, Image, showToast, Toast } from "@raycast/api";
import { CssColor, getHexFrom } from "./colors";
import { Light } from "./types";
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

export function getIcon(light: Light): Image {
  if (!light.state.reachable) {
    return { source: Icon.Plug, tintColor: Color.SecondaryText };
  }

  const color = getHexFrom(light);
  return {
    source: light.state.on ? Icon.LightBulb : Icon.LightBulbOff,
    tintColor: { light: color, dark: color, adjustContrast: false },
  };
}

export function getLightIcon(light: Light) {
  const progress = light.state.on ? (light.state.bri - 1) / 253 : 0;

  if (light.state.colormode === "xy") {
    const color = getHexFrom(light);
    return getProgressIcon(progress, color);
  }

  if (light.state.colormode === "ct") {
    // TODO: Convert from CT to RGB
  }

  return getProgressIcon(progress);
}

export function getIconForColor(color: CssColor): Image {
  return { source: Icon.CircleFilled, tintColor: { light: color.value, dark: color.value, adjustContrast: false } };
}
