import { ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { COLORS, convertToXY, CssColor } from "./lib/colors";
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  BRIGHTNESSES,
  calcDecreasedBrightness,
  calcDecreasedColorTemperature,
  calcIncreasedBrightness,
  calcIncreasedColorTemperature,
  COLOR_TEMP_MAX,
  COLOR_TEMP_MIN,
  decreaseBrightness,
  decreaseColorTemperature,
  increaseBrightness,
  increaseColorTemperature,
  setBrightness,
  setColor,
  toggleLight,
  useHue,
} from "./lib/hue";
import { getIconForColor, getLightIcon } from "./lib/utils";
import { MutatePromise } from "@raycast/utils";
import { Light, Room } from "./lib/types";
import Style = Toast.Style;

export default function Command() {
  const { isLoading, lights, mutateLights, groups } = useHue();

  const rooms = groups.filter((group) => group.type == "Room") as unknown as Room[];

  return (
    <List isLoading={isLoading}>
      {rooms.map((room: Room) => {
        const roomLights =
          lights.filter((light: Light) => {
            return room.lights.includes(`${light.id}`);
          }) ?? [];

        return <Room key={room.id} lights={roomLights} room={room} mutateLights={mutateLights} />;
      })}
    </List>
  );
}

function Room(props: { lights: Light[]; room: Room; mutateLights: MutatePromise<Light[]> }) {
  return (
    <List.Section title={props.room.name}>
      {props.lights.map((light) => (
        <Light key={light.id} light={light} mutateLights={props.mutateLights} />
      ))}
    </List.Section>
  );
}

function Light(props: { light: Light; mutateLights: MutatePromise<Light[]> }) {
  return (
    <List.Item
      title={props.light.name}
      icon={getLightIcon(props.light)}
      actions={
        <ActionPanel>
          <ActionPanel.Section></ActionPanel.Section>

          <ToggleLightAction light={props.light} onToggle={() => handleToggle(props.light, props.mutateLights)} />
          <ActionPanel.Section>
            <SetBrightnessAction
              light={props.light}
              onSet={(percentage: number) => handleSetBrightness(props.light, props.mutateLights, percentage)}
            />
            {/* TODO: Handle holding the key combo properly */}
            <IncreaseBrightnessAction
              light={props.light}
              onIncrease={() => handleIncreaseBrightness(props.light, props.mutateLights)}
            />
            <DecreaseBrightnessAction
              light={props.light}
              onDecrease={() => handleDecreaseBrightness(props.light, props.mutateLights)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            {props.light.state.colormode == "xy" && (
              <SetColorAction
                light={props.light}
                onSet={(color: CssColor) => handleSetColor(props.light, props.mutateLights, color)}
              />
            )}
            {props.light.state.colormode == "ct" && (
              <IncreaseColorTemperatureAction
                light={props.light}
                onIncrease={() => handleIncreaseColorTemperature(props.light, props.mutateLights)}
              />
            )}
            {props.light.state.colormode == "ct" && (
              <DecreaseColorTemperatureAction
                light={props.light}
                onDecrease={() => handleDecreaseColorTemperature(props.light, props.mutateLights)}
              />
            )}
          </ActionPanel.Section>

          <ActionPanel.Section>
            {/* TODO: Fix this only updating the selected light for some reason */}
            <RefreshAction onRefresh={() => props.mutateLights()} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function ToggleLightAction({ light, onToggle }: { light: Light; onToggle?: () => void }) {
  return (
    <ActionPanel.Item
      title={light.state.on ? "Turn Off" : "Turn On"}
      icon={light.state.on ? Icon.LightBulbOff : Icon.LightBulb}
      onAction={onToggle}
    />
  );
}

function SetBrightnessAction(props: { light: Light; onSet: (percentage: number) => void }) {
  return (
    <ActionPanel.Submenu
      title="Set Brightness"
      icon={Icon.CircleProgress}
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

function IncreaseBrightnessAction(props: { light: Light; onIncrease?: () => void }) {
  return props.light.state.bri < BRIGHTNESS_MAX ? (
    <ActionPanel.Item
      title="Increase Brightness"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowUp" }}
      icon={Icon.PlusCircle}
      onAction={props.onIncrease}
    />
  ) : null;
}

function DecreaseBrightnessAction(props: { light: Light; onDecrease?: () => void }) {
  return props.light.state.bri > BRIGHTNESS_MIN ? (
    <ActionPanel.Item
      title="Decrease Brightness"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowDown" }}
      icon={Icon.MinusCircle}
      onAction={props.onDecrease}
    />
  ) : null;
}

function SetColorAction(props: { light: Light; onSet: (color: CssColor) => void }) {
  return (
    <ActionPanel.Submenu title="Set Color" icon={Icon.Swatch} shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}>
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

function IncreaseColorTemperatureAction(props: { light: Light; onIncrease?: () => void }) {
  return props.light.state.bri > COLOR_TEMP_MIN ? (
    <ActionPanel.Item
      title="Increase Color Temperature"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowRight" }}
      icon={Icon.PlusCircle}
      onAction={props.onIncrease}
    />
  ) : null;
}

function DecreaseColorTemperatureAction(props: { light: Light; onDecrease?: () => void }) {
  return props.light.state.bri < COLOR_TEMP_MAX ? (
    <ActionPanel.Item
      title="Decrease Color Temperature"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowLeft" }}
      icon={Icon.MinusCircle}
      onAction={props.onDecrease}
    />
  ) : null;
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

async function handleToggle(light: Light, mutateHueState: MutatePromise<Light[]>) {
  const toast = await showToast(Style.Animated, light.state.on ? "Turning light off" : "Turning light on");

  try {
    await mutateHueState(toggleLight(light), {
      optimisticUpdate(lights) {
        return lights?.map((x) => (x.id === light.id ? { ...x, state: { ...x.state, on: !light.state.on } } : x));
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

async function handleSetBrightness(light: Light, mutateHueState: MutatePromise<Light[]>, percentage: number) {
  const toast = await showToast(Style.Animated, "Setting brightness");
  const brightness = (percentage / 100) * 253 + 1;

  try {
    await mutateHueState(setBrightness(light, brightness), {
      optimisticUpdate(lights) {
        return lights.map((x) => (x.id === light.id ? { ...x, stat: { ...x.state, on: true, bri: brightness } } : x));
      },
    });

    toast.style = Style.Success;
    toast.title = `Set brightness to ${(percentage / 100).toLocaleString("en", { style: "percent" })}`;
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed setting brightness";
    toast.message = e instanceof Error ? e.message : undefined;
  }
}

async function handleIncreaseBrightness(light: Light, mutateHueState: MutatePromise<Light[]>) {
  const toast = await showToast(Style.Animated, "Increasing brightness");

  try {
    await mutateHueState(increaseBrightness(light), {
      optimisticUpdate(lights) {
        return lights?.map((x) =>
          x.id === light.id ? { ...x, stat: { ...x.state, on: true, bri: calcIncreasedBrightness(light) } } : x
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Increased brightness";
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed increasing brightness";
    toast.message = e instanceof Error ? e.message : undefined;
  }
}

async function handleDecreaseBrightness(light: Light, mutateHueState: MutatePromise<Light[]>) {
  const toast = await showToast(Style.Animated, "Increasing brightness");

  try {
    await mutateHueState(decreaseBrightness(light), {
      optimisticUpdate(lights) {
        return lights.map((x) =>
          x.id === light.id ? { ...x, stat: { ...x.state, on: true, bri: calcDecreasedBrightness(light) } } : x
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Decreased brightness";
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed decreasing brightness";
    toast.message = e instanceof Error ? e.message : undefined;
  }
}

async function handleSetColor(light: Light, mutateHueState: MutatePromise<Light[]>, color: CssColor) {
  const toast = await showToast(Style.Animated, "Setting color");

  try {
    await mutateHueState(setColor(light, color.value), {
      optimisticUpdate(lights) {
        return lights.map((x) =>
          x.id === light.id ? { ...x, stat: { ...x.state, on: true, xy: convertToXY(color.value) } } : x
        );
      },
    });

    toast.style = Style.Success;
    toast.title = `Set color to ${color.name}`;
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed setting color";
    toast.message = e instanceof Error ? e.message : undefined;
  }
}

async function handleIncreaseColorTemperature(light: Light, mutateHueState: MutatePromise<Light[]>) {
  const toast = await showToast(Style.Animated, "Increasing color temperature");

  try {
    await mutateHueState(increaseColorTemperature(light), {
      optimisticUpdate(lights) {
        return lights?.map((x) =>
          x.id === light.id ? { ...x, stat: { ...x.state, ct: calcIncreasedColorTemperature(light) } } : x
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Increased color temperature";
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed increasing color temperature";
    toast.message = e instanceof Error ? e.message : undefined;
  }
}

async function handleDecreaseColorTemperature(light: Light, mutateHueState: MutatePromise<Light[]>) {
  const toast = await showToast(Style.Animated, "Increasing color temperature");

  try {
    await mutateHueState(decreaseColorTemperature(light), {
      optimisticUpdate(lights) {
        return lights.map((x) =>
          x.id === light.id ? { ...x, stat: { ...x.state, ct: calcDecreasedColorTemperature(light) } } : x
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Decreased color temperature";
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed decreasing color temperature";
    toast.message = e instanceof Error ? e.message : undefined;
  }
}
