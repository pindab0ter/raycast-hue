import { LocalStorage, showToast, Toast } from "@raycast/api";
import { discovery } from "node-hue-api";
import Style = Toast.Style;

export async function getBridgeIpAddress(): Promise<string | undefined> {
  try {
    const fromLocalStorage = await LocalStorage.getItem<string>("bridgeIpAddress");
    if (fromLocalStorage) {
      return fromLocalStorage;
    }

    const discoveryResults = await discovery.nupnpSearch();
    if (discoveryResults.length === 0) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error("No bridges found");
    }

    // Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
    const fromDiscovery = discoveryResults[0].ipaddress;
    LocalStorage.setItem("bridgeIpAddress", fromDiscovery).then();

    return discoveryResults[0].ipaddress;
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      showToast(Style.Failure, error.name, error.message).then();
    } else {
      showToast(
        Style.Failure,
        "Could not find any Hue Bridges",
        "Please check your network connection and make sure you have a Hue Bridge connected to your network."
      ).then();
    }
    return undefined;
  }
}
