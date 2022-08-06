import { Color, environment, Icon, Image, showToast, Toast } from "@raycast/api";
import { CssColor, getHexFrom } from "./colors";
import { Light, LightState } from "./types";
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

  const color = getHexFrom(light.state);
  return {
    source: light.state.on ? Icon.LightBulb : Icon.LightBulbOff,
    tintColor: { light: color, dark: color, adjustContrast: false },
  };
}

export function getLightIcon(lightState: LightState) {
  const progress = lightState.on ? (lightState.bri - 1) / 253 : 0;

  if (lightState.colormode === "xy") {
    const color = getHexFrom(lightState);
    return getProgressIcon(progress, color);
  }

  if (lightState.colormode === "ct") {
    // TODO: Convert from CT to RGB
    return getProgressIcon(progress, environment.theme == "dark" ? "#fff" : "#000");
  }

  return getProgressIcon(progress);
}

export function getIconForColor(color: CssColor): Image {
  return { source: Icon.CircleFilled, tintColor: { light: color.value, dark: color.value, adjustContrast: false } };
}
