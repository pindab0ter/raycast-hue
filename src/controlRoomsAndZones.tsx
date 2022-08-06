import { ActionPanel, Icon, List, Toast } from "@raycast/api";
import { setScene, turnAllLightsOff, turnAllLightsOn, useHue } from "./lib/hue";
import { MutatePromise } from "@raycast/utils";
import { Group, Room, Scene } from "./lib/types";
import { getLightIcon } from "./lib/utils";
import Style = Toast.Style;

export default function Command() {
  const { isLoading, groups, mutateGroups, scenes } = useHue();

  const rooms = groups.filter((group) => group.type == "Room") as Room[];
  const zones = groups.filter((group) => group.type == "Zone");

  return (
    <List isLoading={isLoading}>
      {rooms.length > 0 && (
        <List.Section title="Rooms">
          {rooms.map((room: Room) => {
            const groupScenes = scenes.filter((scene) => scene.group == room.id);
            return <Group key={room.id} group={room} mutateGroups={mutateGroups} scenes={groupScenes} />;
          })}
        </List.Section>
      )}
      {zones.length > 0 && (
        <List.Section title="Zones">
          {zones.map((zone: Group) => {
            return <Group key={zone.id} group={zone} mutateGroups={mutateGroups} />;
          })}
        </List.Section>
      )}
    </List>
  );
}

function Group(props: { group: Group; mutateGroups: MutatePromise<Group[]>; scenes?: Scene[] }) {
  return (
    <List.Item
      key={props.group.id}
      title={props.group.name}
      icon={getLightIcon(props.group.action)}
      actions={
        <ActionPanel>
          {!props.group.state.all_on && (
            <TurnAllOnAction onTurnAllOn={() => handleTurnAllOn(props.group, props.mutateGroups)} />
          )}
          {props.group.state.any_on && (
            <TurnAllOffAction onTurnAllOff={() => handleTurnAllOff(props.group, props.mutateGroups)} />
          )}
          {(props.scenes?.length ?? 0) > 0 && (
            <SetSceneAction
              group={props.group}
              scenes={props.scenes ?? []}
              onSetScene={(scene: Scene) => scene && handleSetScene(props.group, scene, props.mutateGroups)}
            />
          )}

          {/*<ActionPanel.Section>*/}
          {/*  <SetBrightnessAction*/}
          {/*    group={props.group}*/}
          {/*    onSet={(percentage: number) => handleSetBrightness(props.group, props.mutateLights, percentage)}*/}
          {/*  />*/}
          {/*  /!* TODO: Handle holding the key combo properly *!/*/}
          {/*  <IncreaseBrightnessAction*/}
          {/*    group={props.group}*/}
          {/*    onIncrease={() => handleIncreaseBrightness(props.group, props.mutateLights)}*/}
          {/*  />*/}
          {/*  <DecreaseBrightnessAction*/}
          {/*    group={props.group}*/}
          {/*    onDecrease={() => handleDecreaseBrightness(props.group, props.mutateLights)}*/}
          {/*  />*/}
          {/*</ActionPanel.Section>*/}
          {/*<ActionPanel.Section>*/}
          {/*  {props.group.state.colormode == "xy" && (*/}
          {/*    <SetColorAction*/}
          {/*      group={props.group}*/}
          {/*      onSet={(color: CssColor) => handleSetColor(props.group, props.mutateLights, color)}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*  {props.group.state.colormode == "ct" && (*/}
          {/*    <IncreaseColorTemperatureAction*/}
          {/*      group={props.group}*/}
          {/*      onIncrease={() => handleIncreaseColorTemperature(props.group, props.mutateLights)}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*  {props.group.state.colormode == "ct" && (*/}
          {/*    <DecreaseColorTemperatureAction*/}
          {/*      group={props.group}*/}
          {/*      onDecrease={() => handleDecreaseColorTemperature(props.group, props.mutateLights)}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*</ActionPanel.Section>*/}

          {/*<ActionPanel.Section>*/}
          {/*  <RefreshAction onRefresh={() => props.mutateLights()} />*/}
          {/*</ActionPanel.Section>*/}
        </ActionPanel>
      }
    />
  );
}

function TurnAllOnAction({ onTurnAllOn }: { onTurnAllOn?: () => void }) {
  return <ActionPanel.Item title="Turn All On" icon={Icon.LightBulb} onAction={onTurnAllOn} />;
}

function TurnAllOffAction({ onTurnAllOff }: { onTurnAllOff?: () => void }) {
  return <ActionPanel.Item title="Turn All Off" icon={Icon.LightBulbOff} onAction={onTurnAllOff} />;
}

function SetSceneAction(props: { group: Group; scenes: Scene[]; onSetScene: (scene: Scene) => void }) {
  return (
    <ActionPanel.Submenu title="Set Scene" icon={Icon.Image}>
      {props.scenes.map((scene) => (
        <ActionPanel.Item key={scene.id} title={scene.name} onAction={() => props.onSetScene(scene)} />
      ))}
    </ActionPanel.Submenu>
  );
}

// function SetBrightnessAction(props: { group: Light; onSet: (percentage: number) => void }) {
//   return (
//     <ActionPanel.Submenu
//       title="Set Brightness"
//       icon={Icon.CircleProgress}
//       shortcut={{ modifiers: ["cmd", "shift"], key: "b" }}
//     >
//       {BRIGHTNESSES.map((brightness) => (
//         <ActionPanel.Item
//           key={brightness}
//           title={`${brightness}% Brightness`}
//           onAction={() => props.onSet(brightness)}
//         />
//       ))}
//     </ActionPanel.Submenu>
//   );
// }
//
// function IncreaseBrightnessAction(props: { group: Light; onIncrease?: () => void }) {
//   return props.group.state.bri < BRIGHTNESS_MAX ? (
//     <ActionPanel.Item
//       title="Increase Brightness"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowUp" }}
//       icon={Icon.Plus}
//       onAction={props.onIncrease}
//     />
//   ) : null;
// }
//
// function DecreaseBrightnessAction(props: { group: Light; onDecrease?: () => void }) {
//   return props.group.state.bri > BRIGHTNESS_MIN ? (
//     <ActionPanel.Item
//       title="Decrease Brightness"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowDown" }}
//       icon={Icon.Minus}
//       onAction={props.onDecrease}
//     />
//   ) : null;
// }
//
// function SetColorAction(props: { group: Light; onSet: (color: CssColor) => void }) {
//   return (
//     <ActionPanel.Submenu title="Set Color" icon={Icon.Swatch} shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}>
//       {COLORS.map((color) => (
//         <ActionPanel.Item
//           key={color.name}
//           title={color.name}
//           icon={getIconForColor(color)}
//           onAction={() => props.onSet(color)}
//         />
//       ))}
//     </ActionPanel.Submenu>
//   );
// }
//
// function IncreaseColorTemperatureAction(props: { group: Light; onIncrease?: () => void }) {
//   return props.group.state.bri > COLOR_TEMP_MIN ? (
//     <ActionPanel.Item
//       title="Increase Color Temperature"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowRight" }}
//       icon={Icon.Plus}
//       onAction={props.onIncrease}
//     />
//   ) : null;
// }
//
// function DecreaseColorTemperatureAction(props: { group: Light; onDecrease?: () => void }) {
//   return props.group.state.bri < COLOR_TEMP_MAX ? (
//     <ActionPanel.Item
//       title="Decrease Color Temperature"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowLeft" }}
//       icon={Icon.Minus}
//       onAction={props.onDecrease}
//     />
//   ) : null;
// }
//
// function RefreshAction(props: { onRefresh: () => void }) {
//   return (
//     <ActionPanel.Item
//       title="Refresh"
//       icon={Icon.ArrowClockwise}
//       shortcut={{ modifiers: ["cmd"], key: "r" }}
//       onAction={props.onRefresh}
//     />
//   );
// }

async function handleTurnAllOn(group: Group, mutateGroups: MutatePromise<Group[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateGroups(turnAllLightsOn(group), {
      optimisticUpdate(groups) {
        // TODO: Figure out why this doesn't update the state
        return groups.map((it) => (it.id === group.id ? { ...it, state: { any_on: true, all_on: true } } : it));
      },
    });

    toast.style = Style.Success;
    toast.title = "Turned group on";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed turning group on";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleTurnAllOff(group: Group, mutateGroups: MutatePromise<Group[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateGroups(turnAllLightsOff(group), {
      optimisticUpdate(groups) {
        return groups?.map((it) => (it.id === group.id ? { ...it, state: { any_on: false, all_on: false } } : it));
      },
    });

    toast.style = Style.Success;
    toast.title = "Turned group off";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed turning group off";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

async function handleSetScene(group: Group, scene: Scene, mutateGroups: MutatePromise<Group[]>) {
  const toast = new Toast({ title: "" });

  try {
    await mutateGroups(setScene(scene));

    toast.style = Style.Success;
    toast.title = "Set scene";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed set scene";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

// async function handleSetBrightness(group: Light, mutateGroups: MutatePromise<Light[]>, percentage: number) {
//   const toast = new Toast({ title: "" });
//   const brightness = (percentage / 100) * 253 + 1;
//
//   try {
//     await mutateGroups(setBrightness(group, brightness), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) => (it.id === group.id ? { ...it, stat: { ...it.state, on: true, bri: brightness } } : it));
//       },
//     });
//
//     toast.style = Style.Success;
//     toast.title = `Set brightness to ${(percentage / 100).toLocaleString("en", { style: "percent" })}`;
//     await toast.show();
//   } catch (e) {
//     toast.style = Style.Failure;
//     toast.title = "Failed setting brightness";
//     toast.message = e instanceof Error ? e.message : undefined;
//     await toast.show();
//   }
// }
//
// async function handleIncreaseBrightness(group: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(increaseBrightness(group), {
//       optimisticUpdate(rooms) {
//         return rooms?.map((it) =>
//           it.id === group.id ? { ...it, stat: { ...it.state, on: true, bri: calcIncreasedBrightness(group) } } : it
//         );
//       },
//     });
//
//     toast.style = Style.Success;
//     toast.title = "Increased brightness";
//     await toast.show();
//   } catch (e) {
//     toast.style = Style.Failure;
//     toast.title = "Failed increasing brightness";
//     toast.message = e instanceof Error ? e.message : undefined;
//     await toast.show();
//   }
// }
//
// async function handleDecreaseBrightness(group: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(decreaseBrightness(group), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) =>
//           it.id === group.id ? { ...it, stat: { ...it.state, on: true, bri: calcDecreasedBrightness(group) } } : it
//         );
//       },
//     });
//
//     toast.style = Style.Success;
//     toast.title = "Decreased brightness";
//     await toast.show();
//   } catch (e) {
//     toast.style = Style.Failure;
//     toast.title = "Failed decreasing brightness";
//     toast.message = e instanceof Error ? e.message : undefined;
//     await toast.show();
//   }
// }
//
// async function handleSetColor(group: Light, mutateGroups: MutatePromise<Light[]>, color: CssColor) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(setColor(group, color.value), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) =>
//           it.id === group.id ? { ...it, stat: { ...it.state, on: true, xy: hexToXy(color.value) } } : it
//         );
//       },
//     });
//
//     toast.style = Style.Success;
//     toast.title = `Set color to ${color.name}`;
//     await toast.show();
//   } catch (e) {
//     toast.style = Style.Failure;
//     toast.title = "Failed setting color";
//     toast.message = e instanceof Error ? e.message : undefined;
//     await toast.show();
//   }
// }
//
// async function handleIncreaseColorTemperature(group: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(increaseColorTemperature(group), {
//       optimisticUpdate(rooms) {
//         return rooms?.map((it) =>
//           it.id === group.id ? { ...it, stat: { ...it.state, ct: calcIncreasedColorTemperature(group) } } : it
//         );
//       },
//     });
//
//     console.log(group.state.ct);
//
//     toast.style = Style.Success;
//     toast.title = "Increased color temperature";
//     await toast.show();
//   } catch (e) {
//     toast.style = Style.Failure;
//     toast.title = "Failed increasing color temperature";
//     toast.message = e instanceof Error ? e.message : undefined;
//     await toast.show();
//   }
// }
//
// async function handleDecreaseColorTemperature(group: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(decreaseColorTemperature(group), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) =>
//           it.id === group.id ? { ...it, stat: { ...it.state, ct: calcDecreasedColorTemperature(group) } } : it
//         );
//       },
//     });
//
//     console.log(group.state.ct);
//
//     toast.style = Style.Success;
//     toast.title = "Decreased color temperature";
//     await toast.show();
//   } catch (e) {
//     toast.style = Style.Failure;
//     toast.title = "Failed decreasing color temperature";
//     toast.message = e instanceof Error ? e.message : undefined;
//     await toast.show();
//   }
// }
