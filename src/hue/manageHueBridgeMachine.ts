import { assign, createMachine } from "xstate";
import { discoverBridge, getAuthenticatedApi, linkWithBridge } from "./index";
import { LocalStorage, Toast } from "@raycast/api";
import {
  connectedMessage,
  failedToConnectMessage,
  failedToLinkMessage,
  linkWithBridgeMessage,
  noBridgeFoundMessage,
} from "../markdown";
import Style = Toast.Style;

const BRIDGE_IP_ADDRESS_KEY = "bridgeIpAddress";
const BRIDGE_USERNAME_KEY = "bridgeUsername";

export interface HueContext {
  bridgeIpAddress?: string;
  bridgeUsername?: string;
  shouldDisplay: boolean;
  markdown?: string;
  actions: Element[];
  toast: Toast;
}

export const manageHueBridgeMachine = createMachine<HueContext>(
  {
    id: "manage-hue-bridge",
    initial: "initial",
    context: {
      bridgeIpAddress: undefined,
      bridgeUsername: undefined,
      shouldDisplay: false,
      markdown: undefined,
      actions: [],
      toast: new Toast({ style: Style.Animated, title: "" }),
    },
    states: {
      initial: {
        invoke: {
          id: "getBridgeIpAddress",
          src: async () => {
            const bridgeIpAddress = await LocalStorage.getItem<string>(BRIDGE_IP_ADDRESS_KEY);
            if (bridgeIpAddress === undefined) throw Error("No bridge IP address stored");
            return bridgeIpAddress;
          },
          onDone: {
            target: "getBridgeUsername",
            actions: assign({ bridgeIpAddress: (context, event) => event.data }),
          },
          onError: {
            target: "discovering",
          },
        },
      },
      discovering: {
        entry: "discovering",
        exit: "hideToast",
        invoke: {
          id: "discoverBridge",
          src: discoverBridge,
          onDone: {
            target: "getBridgeUsername",
            actions: assign({ bridgeIpAddress: (context, event) => event.data }),
          },
          onError: {
            target: "noBridgeFound",
          },
        },
      },
      noBridgeFound: {
        entry: "displayNoBridgeFound",
        on: {
          RETRY: {
            target: "discovering",
          },
        },
      },
      getBridgeUsername: {
        invoke: {
          id: "getBridgeUsername",
          src: async () => {
            const bridgeIpAddress = await LocalStorage.getItem<string>(BRIDGE_USERNAME_KEY);
            if (bridgeIpAddress === undefined) throw Error("No bridge IP username stored");
            return bridgeIpAddress;
          },
          onDone: {
            target: "connecting",
            actions: assign({ bridgeUsername: (context, event) => event.data }),
          },
          onError: {
            target: "linkWithBridge",
          },
        },
      },
      linkWithBridge: {
        entry: "displayLinkWithBridge",
        on: {
          LINK: {
            target: "linking",
          },
        },
      },
      linking: {
        entry: "linking",
        invoke: {
          id: "linking",
          src: async (context) => {
            if (context.bridgeIpAddress === undefined) throw Error("No bridge IP address");
            return await linkWithBridge(context.bridgeIpAddress);
          },
          onDone: {
            target: "connecting",
            actions: async (context, event) => {
              context.bridgeUsername = event.data;
              if (context.bridgeIpAddress === undefined) throw Error("No bridge IP address");
              if (context.bridgeUsername === undefined) throw Error("No bridge username");
              LocalStorage.setItem(BRIDGE_IP_ADDRESS_KEY, context.bridgeIpAddress).then();
              LocalStorage.setItem(BRIDGE_USERNAME_KEY, context.bridgeUsername).then();
            },
          },
          onError: {
            target: "failedToLink",
          },
        },
      },
      failedToLink: {
        entry: "displayFailedToLink",
        on: {
          RETRY: {
            target: "linking",
          },
        },
      },
      connecting: {
        entry: "connecting",
        exit: "hideToast",
        invoke: {
          id: "connectToBridge",
          src: async (context) => {
            if (context.bridgeIpAddress === undefined) throw Error("No bridge IP address");
            if (context.bridgeUsername === undefined) throw Error("No bridge username");
            await getAuthenticatedApi(context.bridgeIpAddress, context.bridgeUsername);
          },
          onDone: {
            target: "connected",
          },
          onError: {
            target: "failedToConnect",
          },
        },
      },
      failedToConnect: {
        entry: "displayFailedToConnect",
        on: {
          RETRY: {
            target: "connecting",
          },
        },
      },
      connected: {
        entry: "displayConnected",
        on: {
          REMOVE: {
            target: "removing",
          },
        },
      },
      removing: {
        invoke: {
          id: "removing",
          src: async (context) => {
            context.bridgeIpAddress = undefined;
            context.bridgeUsername = undefined;
            await LocalStorage.removeItem(BRIDGE_IP_ADDRESS_KEY);
            await LocalStorage.removeItem(BRIDGE_USERNAME_KEY);
          },
          onDone: {
            target: "initial",
          },
        },
      },
    },
  },
  {
    actions: {
      discovering: async (context) => {
        context.toast.style = Style.Animated;
        context.toast.title = "Discovering…";
        context.toast.show().then();
      },
      linking: async (context) => {
        context.toast.style = Style.Animated;
        context.toast.title = "Linking";
        context.toast.show().then();
      },
      connecting: async (context) => {
        context.toast.style = Style.Animated;
        context.toast.title = "Connecting…";
        context.toast.show().then();
      },
      displayLinkWithBridge: (context) => {
        context.toast.style = Style.Success;
        context.toast.title = "Hue Bridge found";
        context.toast.show().then();
        context.shouldDisplay = true;
        context.markdown = linkWithBridgeMessage;
      },
      displayNoBridgeFound: (context) => {
        context.toast.style = Style.Failure;
        context.toast.title = "No Hue Bridge found";
        context.toast.show().then();
        context.shouldDisplay = true;
        context.markdown = noBridgeFoundMessage;
      },
      displayFailedToConnect: (context) => {
        context.toast.style = Style.Failure;
        context.toast.title = "Failed to connect";
        context.toast.show().then();
        context.shouldDisplay = true;
        context.markdown = failedToConnectMessage;
      },
      displayFailedToLink: (context) => {
        context.toast.style = Style.Failure;
        context.toast.title = "Failed to link";
        context.toast.show().then();
        context.shouldDisplay = true;
        context.markdown = failedToLinkMessage;
      },
      displayConnected: (context) => {
        context.toast.style = Style.Success;
        context.toast.title = "Connected";
        context.toast.show().then();
        context.shouldDisplay = true;
        context.markdown = connectedMessage;
      },
      hideToast: async (context) => {
        context.toast.hide().then();
      },
    },
  }
);
