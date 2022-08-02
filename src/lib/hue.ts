import { discovery, v3 } from "node-hue-api";
import { Api } from "node-hue-api/dist/esm/api/Api";
import { Light } from "./types";
import { convertToXY } from "./colors";
import { LocalStorage } from "@raycast/api";

const APP_NAME = "raycast_hue_extension";
export const BRIDGE_IP_ADDRESS_KEY = "bridgeIpAddress";
export const BRIDGE_USERNAME_KEY = "bridgeUsername";

const BRIGHTNESS_STEP = 10;
export const BRIGHTNESS_MAX = 254;
export const BRIGHTNESS_MIN = 1;

export async function getUnauthenticatedApi(bridgeIpAddress: string): Promise<Api> {
  return await v3.api.createLocal(bridgeIpAddress).connect();
}

export async function getAuthenticatedApi(bridgeIpAddress: string, username: string): Promise<Api> {
  return await v3.api.createLocal(bridgeIpAddress).connect(username);
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

export async function turnOffAllLights() {
  const api = await createApi();

  const lights = await api.lights.getAll();
  for await (const light of lights) {
    await api.lights.setLightState(light.id, { on: false });
  }
}

export async function toggleLight(light: Light) {
  const api = await createApi();
  await api.lights.setLightState(light.id, { on: !light.state.on });
}

export async function increaseBrightness(light: Light) {
  const api = await createApi();
  const newLightState = new v3.model.lightStates.LightState().on().bri_inc(BRIGHTNESS_STEP);
  await api.lights.setLightState(light.id, newLightState);
}

export function calcIncreasedBrightness(light: Light) {
  return Math.min(Math.max(BRIGHTNESS_MIN, light.state.brightness + BRIGHTNESS_STEP), BRIGHTNESS_MAX);
}

export async function decreaseBrightness(light: Light) {
  const api = await createApi();
  const newLightState = new v3.model.lightStates.LightState().on().bri_inc(-BRIGHTNESS_STEP);
  await api.lights.setLightState(light.id, newLightState);
}

export function calcDecreasedBrightness(light: Light) {
  return Math.min(Math.max(BRIGHTNESS_MIN, light.state.brightness - BRIGHTNESS_STEP), BRIGHTNESS_MAX);
}

export async function setBrightness(light: Light, percentage: number) {
  const api = await createApi();
  const newLightState = new v3.model.lightStates.LightState().on().brightness(percentage);
  await api.lights.setLightState(light.id, newLightState);
}

export async function setColor(light: Light, color: string) {
  const api = await createApi();
  const xy = convertToXY(color);
  const newLightState = new v3.model.lightStates.LightState().on().xy(xy);
  await api.lights.setLightState(light.id, newLightState);
}

export async function createApi() {
  const ipAddress = await LocalStorage.getItem<string>(BRIDGE_IP_ADDRESS_KEY);
  const username = await LocalStorage.getItem<string>(BRIDGE_USERNAME_KEY);

  if (ipAddress === undefined || username === undefined) {
    throw new Error("No Bridge configured");
  }

  return await v3.api.createLocal(ipAddress).connect(username);
}
