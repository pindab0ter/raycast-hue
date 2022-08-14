import { Detail } from "@raycast/api";
import { failedToConnectMessage } from "../lib/markdown";

export default function FailedToConnect() {
  return <Detail key="hueBridgeNotFound" markdown={failedToConnectMessage} />;
}
