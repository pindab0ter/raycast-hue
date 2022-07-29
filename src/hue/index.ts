import { discovery, v3 } from "node-hue-api";
import Api from "node-hue-api/lib/api/Api";

const APP_NAME = "raycast_hue_extension";

export function getUnauthenticatedApi(bridgeIpAddress: string): Promise<Api> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return v3.api.createLocal(bridgeIpAddress).connect();
}

export async function getAuthenticatedApi(bridgeIpAddress: string, username: string): Promise<Api> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (await v3.api.createLocal(bridgeIpAddress).connect(username.username)) as Api;
}

/**
 * Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
 */
export async function discoverBridge(): Promise<string> {
  try {
    console.info("Discovering bridge using MeetHue's public API…");
    const hueApiResults = await discovery.nupnpSearch();

    if (hueApiResults.length === 0) {
      throw new Error("Could not find a Hue Bridge");
    }

    console.info("Discovered Hue Bridge using MeetHue's public API:", hueApiResults[0].ipaddress);

    return hueApiResults[0].ipaddress;
  } catch {
    console.info("Could not find a Hue Bridge using MeetHue's public API");
    console.info("Discovering bridge using UPnP…");

    const upnpResults = await discovery.upnpSearch();
    if (upnpResults.length === 0) {
      throw new Error("Could not find a Hue Bridge");
    }

    const ipAddress = upnpResults[0].ipaddress;

    if (ipAddress === undefined) {
      throw new Error("Could not find a Hue Bridge");
    }

    console.info("Discovered Hue Bridge using UPnP:", ipAddress);

    return ipAddress;
  }
}

export async function linkWithBridge(ipAddress: string): Promise<string> {
  // Create an unauthenticated instance of the Hue API so that we can create a new user
  const unauthenticatedApi = await getUnauthenticatedApi(ipAddress);
  const createdUser = await unauthenticatedApi.users.createUser(APP_NAME, "");

  return createdUser.username;
}
