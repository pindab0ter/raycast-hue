import { Action, ActionPanel, Alert, confirmAlert, Detail, popToRoot } from "@raycast/api";
import { useMachine } from "@xstate/react";
import { manageHueBridgeMachine } from "./hue/manageHueBridgeMachine";
import ActionStyle = Alert.ActionStyle;

export default function Command() {
  const [current, send] = useMachine(manageHueBridgeMachine);

  console.log({ currentState: current.value });

  const removeConfiguredBridge = async () => {
    await confirmAlert({
      title: "Are you sure you want to remove saved Hue Bridge?",
      primaryAction: { title: "Remove", style: ActionStyle.Destructive, onAction: () => send("REMOVE") },
    });
  };

  let contextActions: JSX.Element[] = [];
  switch (current.value) {
    case "linkWithBridge":
      contextActions = [<Action title="Link With Bridge" onAction={() => send("LINK")} />];
      break;
    case "noBridgeFound":
    case "failedToLink":
      contextActions = [<Action title="Retry" onAction={() => send("RETRY")} />];
      break;
    case "failedToConnect":
      contextActions = [
        <Action title="Retry" onAction={() => send("RETRY")} />,
        <Action title="Remove Saved Hue Bridge" onAction={removeConfiguredBridge} />,
      ];
      break;
    case "connected":
      contextActions = [
        <Action title="Done" onAction={popToRoot} />,
        <Action title="Remove Saved Hue Bridge" onAction={removeConfiguredBridge} />,
      ];
  }

  return (
    <Detail
      isLoading={!current.context.shouldDisplay}
      markdown={current.context.shouldDisplay ? current.context.markdown : null}
      actions={<ActionPanel>{contextActions}</ActionPanel>}
    />
  );
}
