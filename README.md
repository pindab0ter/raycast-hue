# Hue

Quickly and easily control Philips Hue lights

## Setup

Before using the extension, you need to link with your Philips Hue bridge.

Please follow the instructions in the Manage Hue Bridge command.

## Icons

The icons used in the “Control Lights” command are from
the [Philips Hue Icon Pack](https://developers.meethue.com/develop/application-design-guidance/icon-pack/).

## What makes this interesting?

This extension is used by over 1000 people and was featured in the [Raycast Store](https://www.raycast.com/pindab0ter/hue) on 2022-04-28.

![2023-04-28 Hue featured in Raycast store](https://user-images.githubusercontent.com/5128166/235182003-d9d9ca17-c5d6-40aa-bf55-ab314d039b24.png)

Technical features:

* A fast and responsive UI using ‘stale-while-revalidate’ and ‘optimistic updates’.
* A [state machine](https://github.com/pindab0ter/raycast-hue/blob/4c84ee73ce9471a0566dbe84ab5a25d3198e2922/src/lib/hueBridgeMachine.ts) for managing the Hue Bridge connection status (see [visualisation](https://stately.ai/viz/ee0edf94-7a82-4d65-a6a8-324e2f1eca49)).
* An HTTP/2 client with
  * Custom certificate validation with support for older Hue Bridge models
  * Rate limited queue for requests depending on the documented rate limits
  * Eventstream listener for live updating of the UI
* Custom image generation to display multicolor scene gradients
