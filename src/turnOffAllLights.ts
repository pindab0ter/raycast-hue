import { closeMainWindow, showHUD } from "@raycast/api";
import { turnOffAllLights } from "./lib/hue";
import { showFailureToast } from "./lib/utils";

export default async () => {
  try {
    await closeMainWindow();
    await turnOffAllLights();
    showHUD("Turned off all lights");
  } catch (error) {
    showFailureToast(error, "Failed turning off all lights");
  }
};
