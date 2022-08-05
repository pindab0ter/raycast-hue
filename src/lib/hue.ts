import { discovery, v3 } from "node-hue-api";
import { Api } from "node-hue-api/dist/esm/api/Api";
import { convertToXY } from "./colors";
import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { Group, Light, Scene } from "./types";

const APP_NAME = "raycast_hue_extension";
export const BRIDGE_IP_ADDRESS_KEY = "bridgeIpAddress";
export const BRIDGE_USERNAME_KEY = "bridgeUsername";

export const BRIGHTNESSES = [1].concat(Array.from(Array(10).keys()).map((i) => i * 10 + 10)).reverse();
// TODO: Change into lookup table so that each step corresponds to a 10% value
const BRIGHTNESS_STEP = 25.4;
export const BRIGHTNESS_MAX = 254;
export const BRIGHTNESS_MIN = 1;
const COLOR_TEMPERATURE_STEP = (500.0 - 153.0) / 10.0;
export const COLOR_TEMP_MAX = 500;
export const COLOR_TEMP_MIN = 153;

let _api: Api;

export function useHue() {
  const {
    isLoading: isLoadingLights,
    data: lights,
    mutate: mutateLights,
  } = useCachedPromise(
    async () => {
      const api = await getAuthenticatedApi();
      const lights = await api.lights.getAll();
      return lights.map((light) => light["data"] as Light).filter((light) => light != null);
    },
    [],
    {
      keepPreviousData: true,
      initialData: [] as Light[],
    }
  );

  const { isLoading: isLoadingGroups, data: groups } = useCachedPromise(
    async () => {
      const api = await getAuthenticatedApi();
      const groups = await api.groups.getAll();
      return groups.map((group) => group["data"] as Group).filter((group) => group != null);
    },
    [],
    {
      keepPreviousData: true,
      initialData: [] as Group[],
    }
  );

  const { isLoading: isLoadingScenes, data: scenes } = useCachedPromise(
    async () => {
      const api = await getAuthenticatedApi();
      const scenes = await api.scenes.getAll();
      return scenes.map((scene) => scene["data"] as Scene).filter((scene) => scene != null);
    },
    [],
    {
      keepPreviousData: true,
      initialData: [] as Scene[],
    }
  );

  return {
    isLoading: isLoadingLights || isLoadingGroups || isLoadingScenes,
    lights,
    mutateLights,
    groups,
    scenes,
  };
}

export async function getAuthenticatedApi(): Promise<Api> {
  if (_api) return _api;

  const bridgeIpAddress = await LocalStorage.getItem<string>(BRIDGE_IP_ADDRESS_KEY);
  const bridgeUsername = await LocalStorage.getItem<string>(BRIDGE_USERNAME_KEY);

  if (!bridgeIpAddress || !bridgeUsername) throw new Error("No Hue Bridge configured");

  _api = await v3.api.createLocal(bridgeIpAddress).connect(bridgeUsername);

  return _api;
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
  const unauthenticatedApi = await v3.api.createLocal(ipAddress).connect();
  const createdUser = await unauthenticatedApi.users.createUser(APP_NAME, "");

  return createdUser.username;
}

export async function turnOffAllLights() {
  const api = await getAuthenticatedApi();

  const lights = await api.lights.getAll();
  for await (const light of lights) {
    await api.lights.setLightState(light.id, { on: false });
  }
}

export async function toggleLight(light: Light) {
  const api = await getAuthenticatedApi();
  await api.lights.setLightState(light.id, { on: !light.state.on });
}

export async function increaseBrightness(light: Light) {
  const api = await getAuthenticatedApi();
  const newLightState = new v3.model.lightStates.LightState().on().bri_inc(BRIGHTNESS_STEP);
  await api.lights.setLightState(light.id, newLightState);
}

export function calcIncreasedBrightness(light: Light) {
  return Math.min(Math.max(BRIGHTNESS_MIN, light.state.bri + BRIGHTNESS_STEP), BRIGHTNESS_MAX);
}

export async function decreaseBrightness(light: Light) {
  const api = await getAuthenticatedApi();
  const newLightState = new v3.model.lightStates.LightState().on().bri_inc(-BRIGHTNESS_STEP);
  await api.lights.setLightState(light.id, newLightState);
}

export function calcDecreasedBrightness(light: Light) {
  return Math.min(Math.max(BRIGHTNESS_MIN, light.state.bri - BRIGHTNESS_STEP), BRIGHTNESS_MAX);
}

export async function setBrightness(light: Light, percentage: number) {
  const api = await getAuthenticatedApi();
  const newLightState = new v3.model.lightStates.LightState().on().bri(percentage);
  await api.lights.setLightState(light.id, newLightState);
}

export async function setColor(light: Light, color: string) {
  const api = await getAuthenticatedApi();
  const xy = convertToXY(color);
  const newLightState = new v3.model.lightStates.LightState().on().xy(xy);
  await api.lights.setLightState(light.id, newLightState);
}

export async function increaseColorTemperature(light: Light) {
  const api = await getAuthenticatedApi();
  const newLightState = new v3.model.lightStates.LightState().on().ct_inc(-COLOR_TEMPERATURE_STEP);
  await api.lights.setLightState(light.id, newLightState);
}

export function calcIncreasedColorTemperature(light: Light) {
  return Math.min(Math.max(COLOR_TEMP_MIN, light.state.bri - COLOR_TEMPERATURE_STEP), COLOR_TEMP_MAX);
}

export async function decreaseColorTemperature(light: Light) {
  const api = await getAuthenticatedApi();
  const newLightState = new v3.model.lightStates.LightState().on().ct_inc(COLOR_TEMPERATURE_STEP);
  await api.lights.setLightState(light.id, newLightState);
}

export function calcDecreasedColorTemperature(light: Light) {
  return Math.min(Math.max(COLOR_TEMP_MIN, light.state.bri + COLOR_TEMPERATURE_STEP), COLOR_TEMP_MAX);
}
