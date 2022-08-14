import { environment } from "@raycast/api";
import { join } from "path";

const successImage = `file://${join(environment.assetsPath, "bridge-success.png")}`;
const failureImage = `file://${join(environment.assetsPath, "bridge-failure.png")}`;
const connectImage = `file://${join(environment.assetsPath, "bridge-connect.png")}`;
const buttonImage = `file://${join(environment.assetsPath, "bridge-button.png")}`;

export const noBridgeConfiguredMessage = `
# No Hue Bridge Configured

![Not Found](${connectImage})

Please use the ‘Manage Hue Bridge’ command to link your Hue Bridge.
`;

export const bridgeNotFoundMessage = `
# Could not find the Hue Bridge

![Failure](${failureImage})

Please check your network connection and make sure you are connected to the same network as your Hue Bridge.

You can remove your saved Hue Bridge from the ‘Manage Hue Bridge’ command.
`;

export const noBridgeFoundMessage = `
# No Hue Bridge found

![Not Found](${connectImage})

Your Hue Bridge must be switched on, plugged into your router via an Ethernet cable and connected to the same Wi-Fi network as your device. All three blue lights on the Hue Bridge should be on.
`;

export const linkWithBridgeMessage = `
# Hue Bridge found

![Press Button](${buttonImage})

Press the button in the center and use the ‘Link With Bridge’ action to connect.
`;

export const failedToLinkMessage = `
# Failed to link with the Hue Bridge

![Failure](${failureImage})

Press the button in the center and use the ‘Retry’ action to connect.
`;

export const failedToConnectMessage = `
# Could not find the saved Hue Bridge

![Failure](${failureImage})

Please check your network connection and make sure you are connected to the same network as your Hue Bridge.

You can remove your saved Hue Bridge by using the ‘Remove Saved Hue Bridge’ action.
`;

export const connectedMessage = `
# Connected to your Hue Bridge

![Success](${successImage})

The extension is now linked to your Hue Bridge.

You can remove your saved Hue Bridge by using the ‘Remove Saved Hue Bridge’ action.
`;
