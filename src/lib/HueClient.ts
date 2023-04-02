/* eslint-disable @typescript-eslint/no-explicit-any */

import https from "https";
import fs from "fs";
import { environment } from "@raycast/api";
import axios, { AxiosRequestConfig, Method } from "axios";
import { Light, Room, Scene } from "./types";

// TODO: Implement rate limiting of max 10 requests per second for lights and
//  1 request per second for groups and scenes
// TODO: Use HTTP/2 (https://iotech.blog/posts/philips-http2/)
export default class HueClient {
  public bridgeIpAddress: string;
  public bridgeId: string;
  public bridgeUsername: string;
  private readonly httpsAgent: https.Agent;
  private readonly config: AxiosRequestConfig;

  constructor(bridgeIpAddress: string, bridgeId: string, bridgeUsername: string) {
    this.bridgeIpAddress = bridgeIpAddress;
    this.bridgeId = bridgeId;
    this.bridgeUsername = bridgeUsername;
    this.httpsAgent = new https.Agent({
      ca: fs.readFileSync(environment.assetsPath + "/philips-hue-cert.pem"),
      checkServerIdentity: (hostname, cert) => {
        if (cert.subject.CN === bridgeId?.toLowerCase()) {
          return;
        } else {
          return new Error("Server identity check failed. CN does not match bridgeId.");
        }
      },
    });

    this.config = {
      headers: {
        "hue-application-key": this.bridgeUsername,
      },
      httpsAgent: this.httpsAgent,
    };
  }

  private async request(method: Method, path: string, data?: any): Promise<any> {
    const response = await axios.request({
      ...this.config,
      baseURL: `https://${this.bridgeIpAddress}`,
      url: path,
      method,
      data,
    });

    if (response.data["errors"] != null && response.data["errors"].length > 0) {
      throw new Error(response.data["errors"]);
    }

    return response.data["data"];
  }

  public async getLights(): Promise<Light[]> {
    return this.request("GET", "/clip/v2/resource/light");
  }

  public async getScenes(): Promise<Scene[]> {
    return this.request("GET", "/clip/v2/resource/scene");
  }

  public async getRooms(): Promise<Room[]> {
    return this.request("GET", "/clip/v2/resource/room");
  }

  public async toggleLight(light: Light): Promise<any> {
    return await this.request("PUT", `clip/v2/resource/light/${light.id}`, {
      on: {
        on: !light.on.on,
      },
      // TODO: Figure out why transition time causes the light to turn on at 1% brightness
      // dynamics: {
      //   duration: parseInt(getPreferenceValues().transitionTime),
      // }
    });
  }

  public async setBrightness(light: Light, brightness: number): Promise<any> {
    return await this.request("PUT", `clip/v2/resource/light/${light.id}`, {
      ...(light.on.on ? {} : { on: { on: true } }),
      dimming: { brightness: brightness },
    });
  }
}
