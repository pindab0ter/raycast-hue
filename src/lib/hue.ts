import { v3 } from "node-hue-api";
import { Light } from "./types";
import { convertToXY } from "./colors";
import { getPreferenceValues } from "@raycast/api";

const BRIGHTNESS_STEP = 10;
export const BRIGHTNESS_MAX = 254;
export const BRIGHTNESS_MIN = 1;

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
  const preferences = getPreferenceValues<{ ipAddress: string; username: string }>();
  return await v3.api.createLocal(preferences.ipAddress).connect(preferences.username);
}
