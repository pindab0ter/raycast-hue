import { ActionPanel, Icon, List, Toast } from "@raycast/api";
import { hexToXy } from "./lib/colors";
import {
  calcDecreasedBrightness,
  calcDecreasedColorTemperature,
  calcIncreasedBrightness,
  calcIncreasedColorTemperature,
  decreaseLightBrightness,
  decreaseColorTemperature,
  increaseLightBrightness,
  increaseColorTemperature,
  setBrightness,
  setColor,
  toggleLight,
  useHue,
} from "./lib/hue";
import { getIconForColor, getLightIcon } from "./lib/utils";
import { MutatePromise } from "@raycast/utils";
import { CssColor, Light, Room } from "./lib/types";
import { BRIGHTNESS_MAX, BRIGHTNESS_MIN, BRIGHTNESSES, COLOR_TEMP_MAX, COLOR_TEMP_MIN, COLORS } from "./lib/constants";
import Style = Toast.Style;

export default function Command() {
  const { isLoading, lights, mutateLights, groups } = useHue();

  const rooms = groups.filter((group) => group.type == "Room") as Room[];

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
      icon={getLightIcon(props.light.state)}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <ToggleLightAction light={props.light} onToggle={() => handleToggle(props.light, props.mutateLights)} />
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
      icon={Icon.Plus}
      onAction={props.onIncrease}
    />
  ) : null;
}

function DecreaseBrightnessAction(props: { light: Light; onDecrease?: () => void }) {
  return props.light.state.bri > BRIGHTNESS_MIN ? (
    <ActionPanel.Item
      title="Decrease Brightness"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowDown" }}
      icon={Icon.Minus}
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
      icon={Icon.Plus}
      onAction={props.onIncrease}
    />
  ) : null;
}

function DecreaseColorTemperatureAction(props: { light: Light; onDecrease?: () => void }) {
  return props.light.state.bri < COLOR_TEMP_MAX ? (
    <ActionPanel.Item
      title="Decrease Color Temperature"
      shortcut={{ modifiers: ["cmd", "shift"], key: "arrowLeft" }}
      icon={Icon.Minus}
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

async function handleToggle(light: Light, mutateLights: MutatePromise<Light[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateLights(toggleLight(light), {
      optimisticUpdate(lights) {
        return lights?.map((it) => (it.id === light.id ? { ...it, state: { ...it.state, on: !light.state.on } } : it));
      },
    });

    toast.style = Style.Success;
    toast.title = light.state.on ? "Turned light off" : "Turned light on";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = light.state.on ? "Failed turning light off" : "Failed turning light on";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleSetBrightness(light: Light, mutateLights: MutatePromise<Light[]>, percentage: number) {
  const toast = new Toast({ title: "" });
  const brightness = (percentage / 100) * 253 + 1;

  try {
    await mutateLights(setBrightness(light, brightness), {
      optimisticUpdate(lights) {
        return lights.map((it) =>
          it.id === light.id ? { ...it, state: { ...it.state, on: true, bri: brightness } } : it
        );
      },
    });

    toast.style = Style.Success;
    toast.title = `Set brightness to ${(percentage / 100).toLocaleString("en", { style: "percent" })}`;
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed setting brightness";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleIncreaseBrightness(light: Light, mutateLights: MutatePromise<Light[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateLights(increaseLightBrightness(light), {
      optimisticUpdate(lights) {
        return lights?.map((it) =>
          it.id === light.id ? { ...it, state: { ...it.state, on: true, bri: calcIncreasedBrightness(light.state) } } : it
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Increased brightness";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed increasing brightness";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleDecreaseBrightness(light: Light, mutateLights: MutatePromise<Light[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateLights(decreaseLightBrightness(light), {
      optimisticUpdate(lights) {
        return lights.map((it) =>
          it.id === light.id ? { ...it, state: { ...it.state, on: true, bri: calcDecreasedBrightness(light.state) } } : it
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Decreased brightness";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed decreasing brightness";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleSetColor(light: Light, mutateLights: MutatePromise<Light[]>, color: CssColor) {
  const toast = new Toast({ title: "" });

  try {
    await mutateLights(setColor(light, color.value), {
      optimisticUpdate(lights) {
        return lights.map((it) =>
          it.id === light.id ? { ...it, state: { ...it.state, on: true, xy: hexToXy(color.value) } } : it
        );
      },
    });

    toast.style = Style.Success;
    toast.title = `Set color to ${color.name}`;
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed setting color";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleIncreaseColorTemperature(light: Light, mutateLights: MutatePromise<Light[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateLights(increaseColorTemperature(light), {
      optimisticUpdate(lights) {
        return lights?.map((it) =>
          it.id === light.id ? { ...it, state: { ...it.state, ct: calcIncreasedColorTemperature(light) } } : it
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Increased color temperature";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed increasing color temperature";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleDecreaseColorTemperature(light: Light, mutateLights: MutatePromise<Light[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateLights(decreaseColorTemperature(light), {
      optimisticUpdate(lights) {
        return lights.map((it) =>
          it.id === light.id ? { ...it, state: { ...it.state, ct: calcDecreasedColorTemperature(light) } } : it
        );
      },
    });

    toast.style = Style.Success;
    toast.title = "Decreased color temperature";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed decreasing color temperature";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}
