import { LocalStorage, showToast, Toast } from "@raycast/api";
import { discovery, v3 } from "node-hue-api";
import Style = Toast.Style;
import Api from "node-hue-api/lib/api/Api";

const appName = "raycast_hue_extension";

export async function getHueBridgeIpAddress(): Promise<string> {
  const fromLocalStorage = await LocalStorage.getItem<string>("bridgeIpAddress");
  if (fromLocalStorage !== undefined) {
    return fromLocalStorage;
  }

  const discoveryResults = await discovery.nupnpSearch();
  if (discoveryResults.length === 0) {
    throw new Error("Could not find a Hue Bridge");
  }

  // Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
  const fromDiscovery = discoveryResults[0].ipaddress;
  LocalStorage.setItem("bridgeIpAddress", fromDiscovery).then();

  return discoveryResults[0].ipaddress;
}

export function getUnauthenticatedApi(bridgeIpAddress: string): Promise<Api> {
  return v3.api.createLocal(bridgeIpAddress).connect();
}

export async function getHueBridgeUsername(): Promise<string> {
  const bridgeIpAddress = await getHueBridgeIpAddress();

  const localStorageUsername = await LocalStorage.getItem<string>("username");

  if (localStorageUsername !== undefined) {
    return localStorageUsername;
  }

  // Create an unauthenticated instance of the Hue API so that we can create a new user
  const unauthenticatedApi = await getUnauthenticatedApi(bridgeIpAddress);
  const createdUser = await unauthenticatedApi.users.createUser(appName, "");

  if (createdUser === undefined) {
    throw new Error("Could not create a new user");
  }

  LocalStorage.setItem("username", createdUser.username).then();
  return createdUser.username;
}

export async function getAuthenticatedApi(bridgeIpAddress: string, username: string): Promise<Api | undefined> {
  return await v3.api.createLocal(bridgeIpAddress).connect(username.username);
}
