import { List } from "@raycast/api";
import { useState } from "react";
import { getBridgeIpAddress } from "./hue";

export default function Command() {
  const [bridgeIpAddress, setBridgeIpAddress] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  getBridgeIpAddress().then((bridgeIpAddress) => {
    setIsLoading(false);
    setBridgeIpAddress(bridgeIpAddress);
  });

  return <List isLoading={isLoading}>{bridgeIpAddress && <List.Item title={bridgeIpAddress} />}</List>;
}
