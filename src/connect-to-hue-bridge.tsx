import { Action, ActionPanel, Detail, LocalStorage, showToast, Toast } from "@raycast/api";
import { getAuthenticatedApi, getHueBridgeIpAddress, getHueBridgeUsername, getUnauthenticatedApi } from "./hue";
import { useCachedState, usePromise } from "@raycast/utils";
import Api from "node-hue-api/lib/api/Api";
import Style = Toast.Style;

const bridgeNotFound = `
# No Hue Bridge found.

Please check your network connection and make sure you have a Hue Bridge connected to your network.
`;

const configuredBridgeNotFound = `
# The configured Hue Bridge was not found.

Please check your network connection and make sure you are connected to the same network as your Hue Bridge.
`;

const bridgeFound = `
# Hue Bridge found!

Press the button on your Hue Bridge and press \`Return\` to connect when the light is blinking.
`;

const failedToAuthenticate = `
# Failed to connect with the configured Hue Bridge.

Press the button on your Hue Bridge and connect when the light is blinking.

Press \`Return\` to clear the local storage try again.
`;

const connected = `
# Connected to Hue Bridge!

You can now start using this extension.
`;

export default function Command() {
  const [ipAddress, setIpAddress] = useCachedState<string | undefined>("ipAddress");
  const [username, setUsername] = useCachedState<string | undefined>("username");

  // TODO: Attempt to connect to the bridge if we have the IP address and username

  const { data: unauthenticatedApi } = usePromise(async () => {
    let toast: Toast | undefined;
    if (ipAddress === undefined) toast = await showToast(Style.Animated, "Searching for Hue bridge…");
    return getHueBridgeIpAddress()
      .then(async (ipAddress) => {
        if (ipAddress) {
          setIpAddress(ipAddress);
          const unAuthenticatedApi = getUnauthenticatedApi(ipAddress);
          await toast?.hide();
          return unAuthenticatedApi;
        }
      })
      .catch(async (error) => {
        console.log(error);
        await showToast(
          Style.Failure,
          "Could not find any Hue Bridges",
          "Please check your network connection and make sure you have a Hue Bridge connected to your network."
        );
      });
  });

  const { data: authenticatedApi, revalidate: authenticate } = usePromise(
    async () => {
      let toast: Toast | undefined;
      if (username === undefined) toast = await showToast(Style.Animated, "Connecting with Hue bridge…");
      return getHueBridgeUsername()
        .then(async (username?) => {
          if (username) {
            setUsername(username);
            if (ipAddress) {
              const authenticatedConnection = getAuthenticatedApi(ipAddress, username);
              await toast?.hide();
              return authenticatedConnection;
            }
          }
        })
        .catch(async (error) => {
          console.error(error);
          await showToast(
            Style.Failure,
            "Could not connect to the Hue Bridge",
            "Please press the button to make sure the blue light is blinking and try again."
          );
          return null;
        });
    },
    [],
    { execute: ipAddress !== undefined && username !== undefined }
  );

  const clearLocalStorageAndAuthenticate = async () => {
    await LocalStorage.removeItem("username");
    authenticate();
  };

  let markdown;
  if (authenticatedApi) {
    markdown = connected;
  } else if (username != undefined && authenticatedApi === null) {
    markdown = failedToAuthenticate;
  } else if (unauthenticatedApi) {
    markdown = bridgeFound;
  } else if (ipAddress != undefined && unauthenticatedApi === null) {
    markdown = configuredBridgeNotFound;
  } else {
    markdown = bridgeNotFound;
  }

  console.log({ ipAddress, username, unauthenticatedApi: !!unauthenticatedApi, authenticatedApi: !!authenticatedApi });

  let connectAction;
  if (username && authenticatedApi) {
    connectAction = null;
  } else if (username && authenticatedApi === null) {
    connectAction = <Action title="Connect Again" onAction={clearLocalStorageAndAuthenticate} />;
  } else {
    connectAction = <Action title="Connect" onAction={authenticate} />;
  }

  // TODO: Prevent flicker when connecting by putting markdown in a state
  const shouldDisplayResult =
    ipAddress !== undefined && unauthenticatedApi !== undefined && !(!authenticatedApi && username);

  return (
    <Detail
      isLoading={!shouldDisplayResult}
      markdown={shouldDisplayResult ? markdown : null}
      actions={shouldDisplayResult && <ActionPanel>{connectAction}</ActionPanel>}
    />
  );
}
