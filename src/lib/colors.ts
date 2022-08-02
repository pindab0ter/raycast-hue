import assert from "assert";
import dotProp from "dot-prop";
import { Light } from "./types";

export interface CssColor {
  name: string;
  value: string;
}

export const COLORS: CssColor[] = [
  { name: "Alice Blue", value: "#f0f8ff" },
  { name: "Antique White", value: "#faebd7" },
  { name: "Aqua", value: "#00ffff" },
  { name: "Aqua Marine", value: "#7fffd4" },
  { name: "Azure", value: "#f0ffff" },
  { name: "Beige", value: "#f5f5dc" },
  { name: "Bisque", value: "#ffe4c4" },
  { name: "Blanched Almond", value: "#ffebcd" },
  { name: "Blue", value: "#0000ff" },
  { name: "Blue Violet", value: "#8a2be2" },
  { name: "Brown", value: "#a52a2a" },
  { name: "Burlywood", value: "#deb887" },
  { name: "Cadet Blue", value: "#5f9ea0" },
  { name: "Chartreuse", value: "#7fff00" },
  { name: "Chocolate", value: "#d2691e" },
  { name: "Coral", value: "#ff7f50" },
  { name: "Cornflower Blue", value: "#6495ed" },
  { name: "Cornsilk", value: "#fff8dc" },
  { name: "Crimson", value: "#dc143c" },
  { name: "Cyan", value: "#00ffff" },
  { name: "Dark Blue", value: "#00008b" },
  { name: "Dark Cyan", value: "#008b8b" },
  { name: "Dark Goldenrod", value: "#b8860b" },
  { name: "Dark Green", value: "#006400" },
  { name: "Dark Khaki", value: "#bdb76b" },
  { name: "Dark Magenta", value: "#8b008b" },
  { name: "Dark Olive Green", value: "#556b2f" },
  { name: "Dark Orange", value: "#ff8c00" },
  { name: "Dark Orchid", value: "#9932cc" },
  { name: "Dark Red", value: "#8b0000" },
  { name: "Dark Salmon", value: "#e9967a" },
  { name: "Dark Sea Green", value: "#8fbc8f" },
  { name: "Dark Slate Blue", value: "#483d8b" },
  { name: "Dark Turquoise", value: "#00ced1" },
  { name: "Dark Violet", value: "#9400d3" },
  { name: "Deep Pink", value: "#ff1493" },
  { name: "Deep Sky Blue", value: "#00bfff" },
  { name: "Dodger Blue", value: "#1e90ff" },
  { name: "Fire Brick", value: "#b22222" },
  { name: "Floral White", value: "#fffaf0" },
  { name: "Forest Green", value: "#228b22" },
  { name: "Fuchsia", value: "#ff00ff" },
  { name: "Gainsboro", value: "#dcdcdc" },
  { name: "Ghost White", value: "#f8f8ff" },
  { name: "Goldenrod", value: "#daa520" },
  { name: "Gold", value: "#ffd700" },
  { name: "Green", value: "#008000" },
  { name: "Green Yellow", value: "#adff2f" },
  { name: "Honey Dew", value: "#f0fff0" },
  { name: "Hot Pink", value: "#ff69b4" },
  { name: "Indian Red", value: "#cd5c5c" },
  { name: "Indigo", value: "#4b0082" },
  { name: "Ivory", value: "#fffff0" },
  { name: "Khaki", value: "#f0e68c" },
  { name: "Lavender Blush", value: "#fff0f5" },
  { name: "Lavender", value: "#e6e6fa" },
  { name: "Lawn Green", value: "#7cfc00" },
  { name: "Lemon Chiffon", value: "#fffacd" },
  { name: "Light Blue", value: "#add8e6" },
  { name: "Light Coral", value: "#f08080" },
  { name: "Light Cyan", value: "#e0ffff" },
  { name: "Light Goldenrod Yellow", value: "#fafad2" },
  { name: "Light Green", value: "#90ee90" },
  { name: "Light Pink", value: "#ffb6c1" },
  { name: "Light Salmon", value: "#ffa07a" },
  { name: "Light Sea Green", value: "#20b2aa" },
  { name: "Light Sky Blue", value: "#87cefa" },
  { name: "Light Steel Blue", value: "#b0c4de" },
  { name: "Light Yellow", value: "#ffffe0" },
  { name: "Lime", value: "#00ff00" },
  { name: "Lime Green", value: "#32cd32" },
  { name: "Linen", value: "#faf0e6" },
  { name: "Magenta", value: "#ff00ff" },
  { name: "Maroon", value: "#800000" },
  { name: "Medium Aqua Marine", value: "#66cdaa" },
  { name: "Medium Blue", value: "#0000cd" },
  { name: "Medium Orchid", value: "#ba55d3" },
  { name: "Medium Purple", value: "#9370db" },
  { name: "Medium Sea Green", value: "#3cb371" },
  { name: "Medium Slate Blue", value: "#7b68ee" },
  { name: "Medium Spring Green", value: "#00fa9a" },
  { name: "Medium Turquoise", value: "#48d1cc" },
  { name: "Medium Violet Red", value: "#c71585" },
  { name: "Midnight Blue", value: "#191970" },
  { name: "Mint Cream", value: "#f5fffa" },
  { name: "Misty Rose", value: "#ffe4e1" },
  { name: "Moccasin", value: "#ffe4b5" },
  { name: "Navajo White", value: "#ffdead" },
  { name: "Navy", value: "#000080" },
  { name: "Oldlace", value: "#fdf5e6" },
  { name: "Olive", value: "#808000" },
  { name: "Olive Drab", value: "#6b8e23" },
  { name: "Orange", value: "#ffa500" },
  { name: "Orange Red", value: "#ff4500" },
  { name: "Orchid", value: "#da70d6" },
  { name: "Pale Goldenrod", value: "#eee8aa" },
  { name: "Pale Green", value: "#98fb98" },
  { name: "Pale Turquoise", value: "#afeeee" },
  { name: "Pale Violet Red", value: "#db7093" },
  { name: "Papaya Whip", value: "#ffefd5" },
  { name: "Peach Puff", value: "#ffdab9" },
  { name: "Peru", value: "#cd853f" },
  { name: "Pink", value: "#ffc0cb" },
  { name: "Plum", value: "#dda0dd" },
  { name: "Powder Blue", value: "#b0e0e6" },
  { name: "Purple", value: "#800080" },
  { name: "Rebecca Purple", value: "#663399" },
  { name: "Red", value: "#ff0000" },
  { name: "Rosy Brown", value: "#bc8f8f" },
  { name: "Royal Blue", value: "#4169e1" },
  { name: "Saddle Brown", value: "#8b4513" },
  { name: "Salmon", value: "#fa8072" },
  { name: "Sandy Brown", value: "#f4a460" },
  { name: "Sea Green", value: "#2e8b57" },
  { name: "Sea Shell", value: "#fff5ee" },
  { name: "Sienna", value: "#a0522d" },
  { name: "Silver", value: "#c0c0c0" },
  { name: "Sky Blue", value: "#87ceeb" },
  { name: "Slate Blue", value: "#6a5acd" },
  { name: "Snow", value: "#fffafa" },
  { name: "Spring Green", value: "#00ff7f" },
  { name: "Steel Glue", value: "#4682b4" },
  { name: "Tan", value: "#d2b48c" },
  { name: "Teal", value: "#008080" },
  { name: "Thistle", value: "#d8bfd8" },
  { name: "Tomato", value: "#ff6347" },
  { name: "Turquoise", value: "#40e0d0" },
  { name: "Violet", value: "#ee82ee" },
  { name: "Wheat", value: "#f5deb3" },
  { name: "White", value: "#ffffff" },
  { name: "White Smoke", value: "#f5f5f5" },
  { name: "Yellow", value: "#ffff00" },
  { name: "Yellow Green", value: "#9acd32" },
];

export function convertToXY(color: string) {
  const [red, green, blue] = hexToRGB(color);
  return rgbToXy(red, green, blue);
}

export function getColor(light: Light) {
  return cieToRgb(light.state.xy[0], light.state.xy[1], light.state.brightness);
}

function hexToRGB(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// - Source: https://github.com/diyhue/diyHue/blob/1bbc4468069017356bda48321e1b77211361980e/BridgeEmulator/web-ui-src/src/color.js
// - Probably copied from somewhere else
// - Converted to TypeScript
function cieToRgb(x: number, y: number, brightness: number) {
  //Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
  if (brightness === undefined) {
    brightness = 254;
  }

  const z = 1.0 - x - y,
    Y = parseFloat((brightness / 254).toFixed(2)),
    X = (Y / y) * x,
    Z = (Y / y) * z;

  //Convert to RGB using Wide RGB D65 conversion
  let red = X * 1.656492 - Y * 0.354851 - Z * 0.255038,
    green = -X * 0.707196 + Y * 1.655397 + Z * 0.036152,
    blue = X * 0.051713 - Y * 0.121364 + Z * 1.01153;

  //If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
  if (red > blue && red > green && red > 1.0) {
    green = green / red;
    blue = blue / red;
    red = 1.0;
  } else if (green > blue && green > red && green > 1.0) {
    red = red / green;
    blue = blue / green;
    green = 1.0;
  } else if (blue > red && blue > green && blue > 1.0) {
    red = red / blue;
    green = green / blue;
    blue = 1.0;
  }

  //Reverse gamma correction
  red = red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, 1.0 / 2.4) - 0.055;
  green = green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, 1.0 / 2.4) - 0.055;
  blue = blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, 1.0 / 2.4) - 0.055;

  //Convert normalized decimal to decimal
  red = Math.round(red * 255);
  green = Math.round(green * 255);
  blue = Math.round(blue * 255);

  if (isNaN(red)) {
    red = 0;
  }

  if (isNaN(green)) {
    green = 0;
  }

  if (isNaN(blue)) {
    blue = 0;
  }

  const decColor = 0x1000000 + blue + 0x100 * green + 0x10000 * red;
  return "#" + decColor.toString(16).substr(1);
}

function rgbToXy(red: number, green: number, blue: number): [number, number] {
  //Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
  red = red > 0.04045 ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : red / 12.92;
  green = green > 0.04045 ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : green / 12.92;
  blue = blue > 0.04045 ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : blue / 12.92;

  //RGB values to XYZ using the Wide RGB D65 conversion formula
  const X = red * 0.664511 + green * 0.154324 + blue * 0.162028,
    Y = red * 0.283881 + green * 0.668433 + blue * 0.047685,
    Z = red * 0.000088 + green * 0.07231 + blue * 0.986039;

  //Calculate the xy values from the XYZ values
  let x = parseFloat((X / (X + Y + Z)).toFixed(4)),
    y = parseFloat((Y / (X + Y + Z)).toFixed(4));

  if (isNaN(x)) {
    x = 0;
  }

  if (isNaN(y)) {
    y = 0;
  }

  return [x, y];
}

interface Gamut {
  red: [number, number];
  green: [number, number];
  blue: [number, number];
}

interface XY {
  x: number;
  y: number;
}

export class ColorConverter {
  static getGamutRanges() {
    const gamutA: Gamut = {
      red: [0.704, 0.296],
      green: [0.2151, 0.7106],
      blue: [0.138, 0.08],
    };

    const gamutB: Gamut = {
      red: [0.675, 0.322],
      green: [0.409, 0.518],
      blue: [0.167, 0.04],
    };

    const gamutC: Gamut = {
      red: [0.692, 0.308],
      green: [0.17, 0.7],
      blue: [0.153, 0.048],
    };

    const defaultGamut: Gamut = {
      red: [1.0, 0],
      green: [0.0, 1.0],
      blue: [0.0, 0.0],
    };

    return { gamutA: gamutA, gamutB: gamutB, gamutC: gamutC, default: defaultGamut };
  }

  static getLightColorGamutRange(modelId?: string) {
    const ranges = ColorConverter.getGamutRanges(),
      gamutA = ranges.gamutA,
      gamutB = ranges.gamutB,
      gamutC = ranges.gamutC;

    const philipsModels = {
      LST001: gamutA,
      LLC010: gamutA,
      LLC011: gamutA,
      LLC012: gamutA,
      LLC006: gamutA,
      LLC005: gamutA,
      LLC007: gamutA,
      LLC014: gamutA,
      LLC013: gamutA,

      LCT001: gamutB,
      LCT007: gamutB,
      LCT002: gamutB,
      LCT003: gamutB,
      LLM001: gamutB,

      LCT010: gamutC,
      LCT014: gamutC,
      LCT015: gamutC,
      LCT016: gamutC,
      LCT011: gamutC,
      LLC020: gamutC,
      LST002: gamutC,
      LCT012: gamutC,
    };

    if (!modelId) {
      return ranges.default;
    }

    return dotProp.get(philipsModels, modelId, ranges.default);
  }

  static rgbToXy(red: number, green: number, blue: number, modelId?: string) {
    function getGammaCorrectedValue(value: number) {
      return value > 0.04045 ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4) : value / 12.92;
    }

    const colorGamut = ColorConverter.getLightColorGamutRange(modelId);

    red = red / 255;
    green = green / 255;
    blue = blue / 255;

    red = getGammaCorrectedValue(red);
    green = getGammaCorrectedValue(green);
    blue = getGammaCorrectedValue(blue);

    const x = red * 0.649926 + green * 0.103455 + blue * 0.197109,
      y = red * 0.234327 + green * 0.743075 + blue * 0.022598,
      z = red * 0.0 + green * 0.053077 + blue * 1.035763;

    let xy = {
      x: x / (x + y + z),
      y: y / (x + y + z),
    };

    if (!ColorConverter.xyIsInGamutRange(xy, colorGamut)) {
      xy = ColorConverter.getClosestColor(xy, colorGamut);
    }

    return xy;
  }

  static xyIsInGamutRange(xy: XY, gamut: Gamut) {
    gamut = gamut || ColorConverter.getGamutRanges().gamutC;

    const v0 = [gamut.blue[0] - gamut.red[0], gamut.blue[1] - gamut.red[1]],
      v1 = [gamut.green[0] - gamut.red[0], gamut.green[1] - gamut.red[1]],
      v2 = [xy.x - gamut.red[0], xy.y - gamut.red[1]];

    const dot00 = v0[0] * v0[0] + v0[1] * v0[1],
      dot01 = v0[0] * v1[0] + v0[1] * v1[1],
      dot02 = v0[0] * v2[0] + v0[1] * v2[1],
      dot11 = v1[0] * v1[0] + v1[1] * v1[1],
      dot12 = v1[0] * v2[0] + v1[1] * v2[1];

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

    const u = (dot11 * dot02 - dot01 * dot12) * invDenom,
      v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return u >= 0 && v >= 0 && u + v < 1;
  }

  static getClosestColor(xy: XY, gamut: Gamut) {
    function getLineDistance(pointA: XY, pointB: XY) {
      return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
    }

    function getClosestPoint(xy: XY, pointA: XY, pointB: XY) {
      const xy2a = [xy.x - pointA.x, xy.y - pointA.y],
        a2b = [pointB.x - pointA.x, pointB.y - pointA.y],
        a2bSqr = Math.pow(a2b[0], 2) + Math.pow(a2b[1], 2),
        xy2a_dot_a2b = xy2a[0] * a2b[0] + xy2a[1] * a2b[1],
        t = xy2a_dot_a2b / a2bSqr;

      return {
        x: pointA.x + a2b[0] * t,
        y: pointA.y + a2b[1] * t,
      };
    }

    const greenBlue = {
      a: {
        x: gamut.green[0],
        y: gamut.green[1],
      },
      b: {
        x: gamut.blue[0],
        y: gamut.blue[1],
      },
    };

    const greenRed = {
      a: {
        x: gamut.green[0],
        y: gamut.green[1],
      },
      b: {
        x: gamut.red[0],
        y: gamut.red[1],
      },
    };

    const blueRed = {
      a: {
        x: gamut.red[0],
        y: gamut.red[1],
      },
      b: {
        x: gamut.blue[0],
        y: gamut.blue[1],
      },
    };

    const closestColorPoints = {
      greenBlue: getClosestPoint(xy, greenBlue.a, greenBlue.b),
      greenRed: getClosestPoint(xy, greenRed.a, greenRed.b),
      blueRed: getClosestPoint(xy, blueRed.a, blueRed.b),
    };

    const distance = {
      greenBlue: getLineDistance(xy, closestColorPoints.greenBlue),
      greenRed: getLineDistance(xy, closestColorPoints.greenRed),
      blueRed: getLineDistance(xy, closestColorPoints.blueRed),
    };

    let closestDistance: number | undefined, closestColor: string | undefined;
    for (const i in distance) {
      // eslint-disable-next-line no-prototype-builtins
      if (distance.hasOwnProperty(i)) {
        if (!closestDistance) {
          closestDistance = dotProp.get(distance, i);
          closestColor = i;
        }

        if (closestDistance && closestDistance > (dotProp.get(distance, i) as number)) {
          closestDistance = dotProp.get(distance, i);
          closestColor = i;
        }
      }
    }

    assert(closestColor, "Cannot find closest color");

    return dotProp.get(closestColorPoints, closestColor) as XY;
  }

  static xyBriToRgb(x: number, y: number, bri: number) {
    function getReversedGammaCorrectedValue(value: number) {
      return value <= 0.0031308 ? 12.92 * value : (1.0 + 0.055) * Math.pow(value, 1.0 / 2.4) - 0.055;
    }

    const xy = {
      x: x,
      y: y,
    };

    const z = 1.0 - xy.x - xy.y,
      Y = bri / 255,
      X = (Y / xy.y) * xy.x,
      Z = (Y / xy.y) * z;

    let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038,
      g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152,
      b = X * 0.051713 - Y * 0.121364 + Z * 1.01153;

    r = getReversedGammaCorrectedValue(r);
    g = getReversedGammaCorrectedValue(g);
    b = getReversedGammaCorrectedValue(b);

    let red = r * 255 > 255 ? 255 : r * 255,
      green = g * 255 > 255 ? 255 : g * 255,
      blue = b * 255 > 255 ? 255 : b * 255;

    red = Math.abs(red);
    green = Math.abs(green);
    blue = Math.abs(blue);

    return { r: red, g: green, b: blue };
  }
}
