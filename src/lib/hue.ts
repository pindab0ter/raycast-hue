import { discovery, v3 } from "node-hue-api";
import { Api } from "node-hue-api/dist/esm/api/Api";
import { convertToXY } from "./colors";
import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { model } from "@peter-murray/hue-bridge-model";
import { Light } from "@peter-murray/hue-bridge-model/dist/esm/model/Light";

const APP_NAME = "raycast_hue_extension";
export const BRIDGE_IP_ADDRESS_KEY = "bridgeIpAddress";
export const BRIDGE_USERNAME_KEY = "bridgeUsername";

const BRIGHTNESS_STEP = 25.4;
export const BRIGHTNESS_MAX = 254;
export const BRIGHTNESS_MIN = 1;

let _api: Api;

export type HueState = {
  lights: model.Light[];
  groups: model.Group[];
  scenes: model.Scene[];
};

export function useHue() {
  const { data, isLoading, mutate } = useCachedPromise<() => Promise<HueState>>(
    async () => {
      const api = await getAuthenticatedApi();
      const lights = await api.lights.getAll();
      const groups = await api.groups.getAll();
      const scenes = await api.scenes.getAll();

      return {
        lights: lights.map((light) => light["data"] as model.Light).filter((light) => light != null),
        groups: groups.map((group) => group["data"] as model.Group).filter((group) => group != null),
        scenes: scenes.map((scene) => scene["data"] as model.Scene).filter((scene) => scene != null),
      };
    },
    [],
    {
      keepPreviousData: true,
      initialData: { lights: [], groups: [], scenes: [] },
    }
  );

  return {
    hueState: data,
    isLoadingHueState: isLoading,
    mutateHueState: mutate,
  }
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
