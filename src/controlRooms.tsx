import { ActionPanel, Icon, List, Toast } from "@raycast/api";
import { turnAllLightsOff, turnAllLightsOn, useHue } from "./lib/hue";
import { MutatePromise } from "@raycast/utils";
import { Group, Room } from "./lib/types";
import { getLightIcon } from "./lib/utils";
import Style = Toast.Style;

export default function Command() {
  const { isLoading, groups, mutateGroups } = useHue();

  const rooms = groups.filter((group) => group.type == "Room") as Room[];

  return (
    <List isLoading={isLoading}>
      {rooms.map((room: Room) => {
        return <Room key={room.id} room={room} mutateGroups={mutateGroups} />;
      })}
    </List>
  );
}

function Room(props: { room: Room; mutateGroups: MutatePromise<Group[]> }) {
  return (
    <List.Item
      key={props.room.id}
      title={props.room.name}
      icon={getLightIcon(props.room.action)}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            {!props.room.state.all_on && (
              <TurnAllOnAction onTurnAllOn={() => handleTurnAllOn(props.room, props.mutateGroups)} />
            )}
            {props.room.state.any_on && (
              <TurnAllOffAction onTurnAllOff={() => handleTurnAllOff(props.room, props.mutateGroups)} />
            )}
          </ActionPanel.Section>

          {/*<ActionPanel.Section>*/}
          {/*  <SetBrightnessAction*/}
          {/*    room={props.room}*/}
          {/*    onSet={(percentage: number) => handleSetBrightness(props.room, props.mutateLights, percentage)}*/}
          {/*  />*/}
          {/*  /!* TODO: Handle holding the key combo properly *!/*/}
          {/*  <IncreaseBrightnessAction*/}
          {/*    room={props.room}*/}
          {/*    onIncrease={() => handleIncreaseBrightness(props.room, props.mutateLights)}*/}
          {/*  />*/}
          {/*  <DecreaseBrightnessAction*/}
          {/*    room={props.room}*/}
          {/*    onDecrease={() => handleDecreaseBrightness(props.room, props.mutateLights)}*/}
          {/*  />*/}
          {/*</ActionPanel.Section>*/}
          {/*<ActionPanel.Section>*/}
          {/*  {props.room.state.colormode == "xy" && (*/}
          {/*    <SetColorAction*/}
          {/*      room={props.room}*/}
          {/*      onSet={(color: CssColor) => handleSetColor(props.room, props.mutateLights, color)}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*  {props.room.state.colormode == "ct" && (*/}
          {/*    <IncreaseColorTemperatureAction*/}
          {/*      room={props.room}*/}
          {/*      onIncrease={() => handleIncreaseColorTemperature(props.room, props.mutateLights)}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*  {props.room.state.colormode == "ct" && (*/}
          {/*    <DecreaseColorTemperatureAction*/}
          {/*      room={props.room}*/}
          {/*      onDecrease={() => handleDecreaseColorTemperature(props.room, props.mutateLights)}*/}
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

// function SetBrightnessAction(props: { room: Light; onSet: (percentage: number) => void }) {
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
// function IncreaseBrightnessAction(props: { room: Light; onIncrease?: () => void }) {
//   return props.room.state.bri < BRIGHTNESS_MAX ? (
//     <ActionPanel.Item
//       title="Increase Brightness"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowUp" }}
//       icon={Icon.PlusCircle}
//       onAction={props.onIncrease}
//     />
//   ) : null;
// }
//
// function DecreaseBrightnessAction(props: { room: Light; onDecrease?: () => void }) {
//   return props.room.state.bri > BRIGHTNESS_MIN ? (
//     <ActionPanel.Item
//       title="Decrease Brightness"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowDown" }}
//       icon={Icon.MinusCircle}
//       onAction={props.onDecrease}
//     />
//   ) : null;
// }
//
// function SetColorAction(props: { room: Light; onSet: (color: CssColor) => void }) {
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
// function IncreaseColorTemperatureAction(props: { room: Light; onIncrease?: () => void }) {
//   return props.room.state.bri > COLOR_TEMP_MIN ? (
//     <ActionPanel.Item
//       title="Increase Color Temperature"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowRight" }}
//       icon={Icon.PlusCircle}
//       onAction={props.onIncrease}
//     />
//   ) : null;
// }
//
// function DecreaseColorTemperatureAction(props: { room: Light; onDecrease?: () => void }) {
//   return props.room.state.bri < COLOR_TEMP_MAX ? (
//     <ActionPanel.Item
//       title="Decrease Color Temperature"
//       shortcut={{ modifiers: ["cmd", "shift"], key: "arrowLeft" }}
//       icon={Icon.MinusCircle}
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
    toast.title = "Turned room on";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed turning room on";
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
    toast.title = "Turned room off";
    await toast.show();
  } catch (e) {
    toast.style = Style.Failure;
    toast.title = "Failed turning room off";
    toast.message = e instanceof Error ? e.message : undefined;
    await toast.show();
  }
}

// async function handleSetBrightness(room: Light, mutateGroups: MutatePromise<Light[]>, percentage: number) {
//   const toast = new Toast({ title: "" });
//   const brightness = (percentage / 100) * 253 + 1;
//
//   try {
//     await mutateGroups(setBrightness(room, brightness), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) => (it.id === room.id ? { ...it, stat: { ...it.state, on: true, bri: brightness } } : it));
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
// async function handleIncreaseBrightness(room: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(increaseBrightness(room), {
//       optimisticUpdate(rooms) {
//         return rooms?.map((it) =>
//           it.id === room.id ? { ...it, stat: { ...it.state, on: true, bri: calcIncreasedBrightness(room) } } : it
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
// async function handleDecreaseBrightness(room: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(decreaseBrightness(room), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) =>
//           it.id === room.id ? { ...it, stat: { ...it.state, on: true, bri: calcDecreasedBrightness(room) } } : it
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
// async function handleSetColor(room: Light, mutateGroups: MutatePromise<Light[]>, color: CssColor) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(setColor(room, color.value), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) =>
//           it.id === room.id ? { ...it, stat: { ...it.state, on: true, xy: convertToXY(color.value) } } : it
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
// async function handleIncreaseColorTemperature(room: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(increaseColorTemperature(room), {
//       optimisticUpdate(rooms) {
//         return rooms?.map((it) =>
//           it.id === room.id ? { ...it, stat: { ...it.state, ct: calcIncreasedColorTemperature(room) } } : it
//         );
//       },
//     });
//
//     console.log(room.state.ct);
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
// async function handleDecreaseColorTemperature(room: Light, mutateGroups: MutatePromise<Light[]>) {
//   const toast = new Toast({ title: "" });
//
//   try {
//     await mutateGroups(decreaseColorTemperature(room), {
//       optimisticUpdate(rooms) {
//         return rooms.map((it) =>
//           it.id === room.id ? { ...it, stat: { ...it.state, ct: calcDecreasedColorTemperature(room) } } : it
//         );
//       },
//     });
//
//     console.log(room.state.ct);
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
