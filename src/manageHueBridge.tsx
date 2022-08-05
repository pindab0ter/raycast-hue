import { Action, ActionPanel, Alert, confirmAlert, Detail, Icon, popToRoot } from "@raycast/api";
import { useMachine } from "@xstate/react";
import { manageHueBridgeMachine } from "./lib/manageHueBridgeMachine";
import ActionStyle = Alert.ActionStyle;

export default function Command() {
  const [current, send] = useMachine(manageHueBridgeMachine);

  const unlinkSavedBridge = async () => {
    await confirmAlert({
      title: "Are you sure you want to unlink the configured Hue Bridge?",
      primaryAction: { title: "Remove", style: ActionStyle.Destructive, onAction: () => send("UNLINK") },
    });
  };

  let contextActions: JSX.Element[] = [];
  switch (current.value) {
    case "linkWithBridge":
      contextActions = [<Action title="Link With Bridge" onAction={() => send("LINK")} icon={Icon.Plug} />];
      break;
    case "noBridgeFound":
    case "failedToLink":
      contextActions = [<Action title="Retry" onAction={() => send("RETRY")} icon={Icon.Repeat} />];
      break;
    case "failedToConnect":
      contextActions = [
        <Action title="Retry" onAction={() => send("RETRY")} icon={Icon.Repeat} />,
        <Action title="Unlink Saved Hue Bridge" onAction={unlinkSavedBridge} icon={Icon.Trash} />,
      ];
      break;
    case "connected":
      contextActions = [
        <Action title="Done" onAction={popToRoot} icon={Icon.Check} />,
        <Action title="Unlink Saved Hue Bridge" onAction={unlinkSavedBridge} icon={Icon.Trash} />,
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
