import { ActionPanel, Icon, List, showToast, ToastStyle } from "@raycast/api";
import dotProp from "dot-prop";
import useSWR, { SWRConfig } from "swr";
import { BRIGHTNESSES } from "./lib/brightness";
import { cacheConfig } from "./lib/cache";
import { COLORS, convertToXY, CssColor } from "./lib/colors";
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  calcDecreasedBrightness,
  calcIncreasedBrightness,
  createApi,
  decreaseBrightness,
  increaseBrightness,
  setBrightness,
  setColor,
  toggleLight,
} from "./lib/hue";
import { Light } from "./lib/types";
import { getAccessoryTitle, getIcon, getIconForColor } from "./lib/utils";

export default function Command() {
  return (
    <SWRConfig value={cacheConfig}>
      <LightList />
    </SWRConfig>
  );
}

function LightList() {
  const { data, isValidating, mutate } = useLights();

  // Ideally we can move all of that to a separate action, unfortunatley our current component tree doesn't work with SWR
  // The actoin wouldn't be part of the SWRConfig and therefore mutates a different cache
  async function handleToggle(index: number) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(ToastStyle.Animated, light.state.on ? "Turning light off" : "Turning light on");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: !light.state.on } };
      mutate(newLights, false);

      await toggleLight(light);

      mutate();

      toast.style = ToastStyle.Success;
      toast.title = light.state.on ? "Turned light off" : "Turned light on";
    } catch (e) {
      toast.style = ToastStyle.Failure;
      toast.title = light.state.on ? "Failed turning light off" : "Failed turning ligh on";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  async function handleIncreaseBrightness(index: number) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(ToastStyle.Animated, "Increasing brightness");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, brightness: calcIncreasedBrightness(light) } };
      mutate(newLights, false);

      await increaseBrightness(light);

      mutate();

      toast.style = ToastStyle.Success;
      toast.title = "Increased brightness";
    } catch (e) {
      toast.style = ToastStyle.Failure;
      toast.title = "Failed increasing brightness";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  async function handleDecreaseBrightness(index: number) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(ToastStyle.Animated, "Decreasing brightness");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, brightness: calcDecreasedBrightness(light) } };
      mutate(newLights, false);

      await decreaseBrightness(light);

      mutate();

      toast.style = ToastStyle.Success;
      toast.title = "Decreased brightness";
    } catch (e) {
      toast.style = ToastStyle.Failure;
      toast.title = "Failed decreasing brightness";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  async function handleSetBrightness(index: number, percentage: number) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(ToastStyle.Animated, "Setting brightness");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, brightness: (percentage / 100) * 255 } };
      mutate(newLights, false);

      await setBrightness(light, percentage);

      mutate();

      toast.style = ToastStyle.Success;
      toast.title = `Set brightness to ${(percentage / 100).toLocaleString("en", { style: "percent" })}`;
    } catch (e) {
      toast.style = ToastStyle.Failure;
      toast.title = "Failed setting brightness";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  async function handleSetColor(index: number, color: CssColor) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(ToastStyle.Animated, "Setting color");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, xy: convertToXY(color.value) } };
      mutate(newLights, false);

      await setColor(light, color.value);

      mutate();

      toast.style = ToastStyle.Success;
      toast.title = `Set color to ${color.name}`;
    } catch (e) {
      toast.style = ToastStyle.Failure;
      toast.title = "Failed setting color";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  return (
    <List isLoading={isValidating}>
      {data?.map((light, index: number) => (
        <List.Item
          key={light.id}
          title={light.name}
          icon={getIcon(light)}
          accessoryTitle={getAccessoryTitle(light)}
          actions={
            <ActionPanel title={light.name}>
              <ActionPanel.Section>
                <ToggleLightAction light={light} onToggle={() => handleToggle(index)} />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <SetColorAction light={light} onSet={(color) => handleSetColor(index, color)} />
                <SetBrightnessAction light={light} onSet={(percentage) => handleSetBrightness(index, percentage)} />
                <IncreaseBrightnessAction light={light} onIncrease={() => handleIncreaseBrightness(index)} />
                <DecreaseBrightnessAction light={light} onDecrease={() => handleDecreaseBrightness(index)} />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <RefreshAction onRefresh={() => mutate()} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function ToggleLightAction(props: { light: Light; onToggle?: () => void }) {
  return (
    <ActionPanel.Item
      title={props.light.state.on ? "Turn Off" : "Turn On"}
      icon={props.light.state.on ? "light-off.png" : "light-on.png"}
      onAction={props.onToggle}
    />
  );
}

function IncreaseBrightnessAction(props: { light: Light; onIncrease?: () => void }) {
  return props.light.state.brightness < BRIGHTNESS_MAX ? (
    <ActionPanel.Item
      title="Increase Brightness"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowUp" }}
      icon="increase.png"
      onAction={props.onIncrease}
    />
  ) : null;
}

function DecreaseBrightnessAction(props: { light: Light; onDecrease?: () => void }) {
  return props.light.state.brightness > BRIGHTNESS_MIN ? (
    <ActionPanel.Item
      title="Decrease Brightness"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowDown" }}
      icon="decrease.png"
      onAction={props.onDecrease}
    />
  ) : null;
}

function SetBrightnessAction(props: { light: Light; onSet: (percentage: number) => void }) {
  return (
    <ActionPanel.Submenu
      title="Set Brightness"
      icon="brightness.png"
      shortcut={{ modifiers: ["cmd", "shift"], key: "b" }}
    >
      {BRIGHTNESSES.map((brightness) => (
        <ActionPanel.Item
          key={brightness}
          title={`${brightness}% Brightness`}
          onAction={() => props.onSet(brightness)}
        />
      ))}
    </ActionPanel.Submenu>
  );
}

function SetColorAction(props: { light: Light; onSet: (color: CssColor) => void }) {
  return (
    <ActionPanel.Submenu title="Set Color" icon="color.png" shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}>
      {COLORS.map((color) => (
        <ActionPanel.Item
          key={color.name}
          title={color.name}
          icon={getIconForColor(color)}
          onAction={() => props.onSet(color)}
        />
      ))}
    </ActionPanel.Submenu>
  );
}

function RefreshAction(props: { onRefresh: () => void }) {
  return (
    <ActionPanel.Item
      title="Refresh"
      icon={Icon.ArrowClockwise}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
      onAction={props.onRefresh}
    />
  );
}

async function fetchLights(): Promise<Light[]> {
  const api = await createApi();
  const lights = await api.lights.getAll();
  return lights.map((light) => ({
    id: light.id,
    name: light.name,
    state: {
      on: dotProp.get(light, "state.on") ?? false,
      brightness: dotProp.get(light, "state.bri") ?? 1,
      xy: dotProp.get(light, "state.xy") ?? [0, 0],
      reachable: dotProp.get(light, "state.reachable") ?? false,
    },
  }));
}

function useLights() {
  return useSWR("lights", fetchLights);
}
