import { closeMainWindow, showHUD } from "@raycast/api";
import { turnOffAllLights } from "./lib/hue";
import { showFailureToast } from "./lib/utils";

export default async () => {
  try {
    await closeMainWindow();
    await turnOffAllLights();
    await showHUD("Turned off all lights");
  } catch (error) {
    await showFailureToast(error, "Failed turning off all lights");
  }
};
