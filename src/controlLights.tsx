import { ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { BRIGHTNESSES } from "./lib/brightness";
import { COLORS, convertToXY, CssColor } from "./lib/colors";
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  calcDecreasedBrightness,
  calcIncreasedBrightness,
  decreaseBrightness,
  HueState,
  increaseBrightness,
  setBrightness,
  setColor,
  toggleLight,
  useHue,
} from "./lib/hue";
import { getIcon, getIconForColor, getLightIcon } from "./lib/utils";
import { Light } from "@peter-murray/hue-bridge-model/dist/esm/model/Light";
import { mutate } from "swr";
import { model } from "@peter-murray/hue-bridge-model";
import LightGroup from "node-hue-api/lib/model/groups/LightGroup";
import { MutatePromise } from "@raycast/utils";
import Style = Toast.Style;

export default function Command() {
  const { isLoadingHueState, hueState, mutateHueState } = useHue();

  if (hueState === undefined) {
    return <List isLoading={true} />;
  }

  const rooms = hueState?.groups.filter((group) => group.type == "Room") as unknown as LightGroup[];

  return (
    <List isLoading={isLoadingHueState}>
      {rooms.map((room: LightGroup) => {
        const lights =
          hueState?.lights.filter((light: model.Light) => {
            return room.lights.includes(`${light.id}`);
          }) ?? [];

        return <Room key={room.id} state={hueState} mutateHueState={mutateHueState} room={room} lights={lights} />;
      })}
    </List>
  );
}

function Room(props: { state: HueState; mutateHueState: MutatePromise<HueState | undefined>; room: LightGroup; lights: model.Light[] }) {
  return (
    <List.Section title={props.room.name}>
      {props.lights.map((light) => (
        <Light
          key={light.id}
          room={props.room}
          light={light}
          handleToggle={() => handleToggle(props.state, props.mutateHueState, props.room, light)}
        />
      ))}
    </List.Section>
  );
}

function Light(props: { room: LightGroup; light: model.Light; handleToggle: () => void }) {
  return (
    <List.Item
      title={props.light.name}
      icon={getLightIcon(props.light)}
      actions={
        <ActionPanel>
          <ToggleLightAction light={props.light} onToggle={props.handleToggle} />
        </ActionPanel>
      }
    />
  );
}

async function handleToggle(
  hueState: HueState,
  mutateHueState: MutatePromise<HueState | undefined>,
  room: LightGroup,
  light: model.Light
) {
  const toast = await showToast(Style.Animated, light.state.on ? "Turning light off" : "Turning light on");

  try {
    const newLights = [...hueState.lights];

    await mutateHueState(toggleLight(light), {
      optimisticUpdate(data) {
        if (data === undefined) {
          return data;
        }
        return {
          ...data,
          lights: data?.lights?.map((x) => (x.id === light.id ? { ...x, state: { ... x.state, on: !light.state.on} } : x)),
        };
      },
    });

    toast.style = Style.Success;
    toast.title = light.state.on ? "Turned light off" : "Turned light on";
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = light.state.on ? "Failed turning light off" : "Failed turning light on";
    toast.message = e instanceof Error ? e.message : undefined;
  }
}

function LightList() {
  // const { data, isValidating, mutate } = useLights();

  // Ideally we can move all of that to a separate action, unfortunately our current component tree doesn't work with SWR
  // The action wouldn't be part of the SWRConfig and therefore mutates a different cache

  async function handleIncreaseBrightness(index: number) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(Style.Animated, "Increasing brightness");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, brightness: calcIncreasedBrightness(light) } };
      mutate(newLights, false);

      await increaseBrightness(light);

      mutate();

      toast.style = Style.Success;
      toast.title = "Increased brightness";
    } catch (e) {
      toast.style = Style.Failure;
      toast.title = "Failed increasing brightness";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  async function handleDecreaseBrightness(index: number) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(Style.Animated, "Decreasing brightness");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, brightness: calcDecreasedBrightness(light) } };
      mutate(newLights, false);

      await decreaseBrightness(light);

      mutate();

      toast.style = Style.Success;
      toast.title = "Decreased brightness";
    } catch (e) {
      toast.style = Style.Failure;
      toast.title = "Failed decreasing brightness";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  async function handleSetBrightness(index: number, percentage: number) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(Style.Animated, "Setting brightness");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, brightness: (percentage / 100) * 255 } };
      mutate(newLights, false);

      await setBrightness(light, percentage);

      mutate();

      toast.style = Style.Success;
      toast.title = `Set brightness to ${(percentage / 100).toLocaleString("en", { style: "percent" })}`;
    } catch (e) {
      toast.style = Style.Failure;
      toast.title = "Failed setting brightness";
      toast.message = e instanceof Error ? e.message : undefined;
    }
  }

  async function handleSetColor(index: number, color: CssColor) {
    if (!data) {
      return;
    }

    const light = data[index];
    const toast = await showToast(Style.Animated, "Setting color");

    try {
      const newLights = [...data];
      newLights[index] = { ...light, state: { ...light.state, on: true, xy: convertToXY(color.value) } };
      mutate(newLights, false);

      await setColor(light, color.value);

      mutate();

      toast.style = Style.Success;
      toast.title = `Set color to ${color.name}`;
    } catch (e) {
      toast.style = Style.Failure;
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

function ToggleLightAction({ light, onToggle }: { light: Light; onToggle?: () => void }) {
  return (
    <ActionPanel.Item
      title={light.state.on ? "Turn Off" : "Turn On"}
      icon={light.state.on ? "light-off.png" : "light-on.png"}
      onAction={onToggle}
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
