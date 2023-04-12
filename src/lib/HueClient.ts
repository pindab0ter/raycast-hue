/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from "fs";
import { environment, LocalStorage } from "@raycast/api";
import {
  GroupedLight,
  HasId,
  Light,
  LightRequest,
  Method,
  ParsedUpdateEvent,
  Room,
  Scene,
  SceneRequest,
  Zone,
} from "./types";
import {
  ClientHttp2Session,
  connect,
  constants,
  IncomingHttpHeaders,
  IncomingHttpStatusHeader,
  sensitiveHeaders,
} from "http2";
import React from "react";
import RateLimitedQueue from "./RateLimitedQueue";
import StreamArray from "stream-json/streamers/StreamArray";
import Chain from "stream-chain";
import "./arrayExtensions";
import * as tls from "tls";
import { BRIDGE_CERT_FINGERPRINT } from "./constants";
import dns from "dns";

const DATA_PREFIX = "data: ";
const CONNECTION_TIMEOUT_MS = 5000;
const { HTTP2_HEADER_METHOD, HTTP2_HEADER_PATH, HTTP2_HEADER_ACCEPT } = constants;

type Response = {
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader;
  data: {
    errors: { description: string }[];
    data: any[];
  };
};

export default class HueClient {
  public bridgeIpAddress: string;
  public bridgeId: string;
  public bridgeUsername: string;
  public bridgeCertFingerprint?: string;
  private readonly setLights?: React.Dispatch<React.SetStateAction<Light[]>>;
  private readonly setGroupedLights?: React.Dispatch<React.SetStateAction<GroupedLight[]>>;
  private readonly setRooms?: React.Dispatch<React.SetStateAction<Room[]>>;
  private readonly setZones?: React.Dispatch<React.SetStateAction<Zone[]>>;
  private readonly setScenes?: React.Dispatch<React.SetStateAction<Scene[]>>;
  private readonly http2Session: ClientHttp2Session;
  private readonly lightsQueue = new RateLimitedQueue(10);
  private readonly groupedLightsQueue = new RateLimitedQueue(1, 1);

  private constructor(
    bridgeIpAddress: string,
    bridgeId: string,
    bridgeUsername: string,
    bridgeCertFingerprint: string | undefined,
    http2Session: ClientHttp2Session,
    setLights?: React.Dispatch<React.SetStateAction<Light[]>>,
    setGroupedLights?: React.Dispatch<React.SetStateAction<GroupedLight[]>>,
    setRooms?: React.Dispatch<React.SetStateAction<Room[]>>,
    setZones?: React.Dispatch<React.SetStateAction<Zone[]>>,
    setScenes?: React.Dispatch<React.SetStateAction<Scene[]>>
  ) {
    this.bridgeUsername = bridgeUsername;
    this.http2Session = http2Session;
    this.bridgeIpAddress = bridgeIpAddress;
    this.bridgeCertFingerprint = bridgeCertFingerprint;
    this.bridgeId = bridgeId;
    this.setLights = setLights;
    this.setGroupedLights = setGroupedLights;
    this.setRooms = setRooms;
    this.setZones = setZones;
    this.setScenes = setScenes;
    this.listenToEventSource();
  }

  public static async createInstance(
    bridgeIpAddress: string,
    bridgeId: string,
    bridgeUsername: string,
    bridgeCertFingerprint: string | undefined = undefined,
    setLights?: React.Dispatch<React.SetStateAction<Light[]>>,
    setGroupedLights?: React.Dispatch<React.SetStateAction<GroupedLight[]>>,
    setRooms?: React.Dispatch<React.SetStateAction<Room[]>>,
    setZones?: React.Dispatch<React.SetStateAction<Zone[]>>,
    setScenes?: React.Dispatch<React.SetStateAction<Scene[]>>
  ) {
    const http2Session = await new Promise<ClientHttp2Session>((resolve, reject) => {
      // Connect to the Hue Bridge using the Bridge ID as the hostname, which we then resolve to the Bridge IP address.
      const session = connect(`https://${bridgeId}`, {
        ca: fs.readFileSync(environment.assetsPath + "/huebridge_cacert.pem"),
        checkServerIdentity: (hostname, cert) => {
          /*
           * If both the certificate issuer’s Common Name field, and the certificate subject’s Common Name field are
           * equal to the Bridge ID, the Bridge is running an older firmware version.
           * In that case, we need to store the certificate’s fingerprint and check future connections against it.
           * Source: https://developers.meethue.com/develop/application-design-guidance/using-https/#Self-signed%20certificates
           */
          if (cert.issuer.CN === bridgeId.toLowerCase() && cert.subject.CN === bridgeId.toLowerCase()) {
            if (bridgeCertFingerprint === undefined) {
              console.log("Self-signed Hue Bridge certificate detected. Storing fingerprint for future connections.");
              LocalStorage.setItem(BRIDGE_CERT_FINGERPRINT, cert.fingerprint);
            } else {
              if (bridgeCertFingerprint !== cert.fingerprint) {
                return new Error(
                  "Server identity check failed. " +
                    "Fingerprint does not match known fingerprint. " +
                    "If you trust this certificate, please unlink and relink your Bridge."
                );
              }
              console.log(
                "Self-signed Hue Bridge certificate detected. " +
                  "Certificate fingerprint matches known fingerprint. " +
                  "Continuing connection."
              );
            }

            // Certificate is deemed valid, even though it is self-signed.
            return undefined;
          }

          /*
           * In case of a more up-to-date firmware version, we need to check the certificate’s Common Name field against
           * the bridgeId and check the certificate against the Hue Bridge Root CA.
           */
          if (cert.subject.CN === bridgeId.toLowerCase() && cert.issuer.CN === "root-bridge") {
            tls.checkServerIdentity(hostname, cert);
          } else {
            return new Error(
              "Server identity check failed. Certificate subject’s Common Name does not match bridgeId " +
                "or certificate issuer’s Common Name does not match “root-bridge”."
            );
          }
        },
        lookup: (hostname, options, callback) => {
          /*
           * Resolve the Bridge ID to the Bridge IP address to prevent the following warning:
           * [DEP0123] DeprecationWarning: Setting the TLS ServerName to an IP address is not permitted by RFC 6066.
           */
          if (hostname.toLowerCase() === bridgeId?.toLowerCase() && bridgeIpAddress !== undefined) {
            console.log(
              `Overriding DNS lookup for host name "${hostname}" (Bridge ID) to ${bridgeIpAddress} to avoid TLS ServerName IP warning.`
            );
            callback(null, bridgeIpAddress, 4);
          } else {
            dns.lookup(hostname, options, callback);
          }
        },
      });

      session.setTimeout(CONNECTION_TIMEOUT_MS, () => {
        reject(new Error("Connection timed out."));
      });

      session.once("connect", () => {
        resolve(session);
      });

      session.once("error", (error) => {
        reject(error);
      });
    });

    return new HueClient(
      bridgeIpAddress,
      bridgeId,
      bridgeUsername,
      bridgeCertFingerprint,
      http2Session,
      setLights,
      setGroupedLights,
      setRooms,
      setZones,
      setScenes
    );
  }

  public async getLights(): Promise<Light[]> {
    const response = await this.makeRequest("GET", "/clip/v2/resource/light");
    return response.data.data;
  }

  public async getGroupedLights(): Promise<GroupedLight[]> {
    const response = await this.makeRequest("GET", "/clip/v2/resource/grouped_light");
    return response.data.data;
  }

  public async getScenes(): Promise<Scene[]> {
    const response = await this.makeRequest("GET", "/clip/v2/resource/scene");
    return response.data.data;
  }

  public async getRooms(): Promise<Room[]> {
    const response = await this.makeRequest("GET", "/clip/v2/resource/room");
    return response.data.data;
  }

  public async getZones(): Promise<Zone[]> {
    const response = await this.makeRequest("GET", "/clip/v2/resource/zone");
    return response.data.data;
  }

  public async updateLight(light: Light, properties: LightRequest): Promise<Partial<Light>[]> {
    const response = await this.lightsQueue.enqueueRequest(() =>
      this.makeRequest("PUT", `/clip/v2/resource/light/${light.id}`, properties)
    );

    return response.data.data;
  }

  public async updateGroupedLight(groupedLight: GroupedLight, properties: Partial<GroupedLight>): Promise<any> {
    const response = await this.groupedLightsQueue.enqueueRequest(() =>
      this.makeRequest("PUT", `/clip/v2/resource/grouped_light/${groupedLight.id}`, properties)
    );

    return response.data.data;
  }

  public async updateScene(scene: Scene, properties: SceneRequest): Promise<any> {
    const response = await this.makeRequest("PUT", `/clip/v2/resource/scene/${scene.id}`, properties);

    return response.data.data;
  }

  private makeRequest(method: Method, path: string, body?: any): Promise<Response> {
    return new Promise((resolve, reject) => {
      const stream = this.http2Session.request({
        [HTTP2_HEADER_METHOD]: method,
        [HTTP2_HEADER_PATH]: path,
        "hue-application-key": this.bridgeUsername,
        [sensitiveHeaders]: ["hue-application-key"],
      });

      let data = "";

      if (body !== undefined) {
        stream.write(JSON.stringify(body), "utf8");
      }

      stream.setEncoding("utf8");

      const response: Response = {
        headers: {},
        data: {
          errors: [],
          data: [],
        },
      };

      stream.on("response", (responseHeaders: IncomingHttpHeaders & IncomingHttpStatusHeader) => {
        response.headers = responseHeaders;
      });

      stream.on("data", (chunk) => {
        data += chunk;
      });

      stream.on("end", () => {
        stream.close();

        try {
          if (response.headers[":status"] !== 200 && response.headers["content-type"] === "text/html") {
            const errorMatch = data.match(/(?<=<div class="error">)(.*?)(?=<\/div>)/);
            if (errorMatch && errorMatch[0]) {
              console.error({ headers: response.headers, message: errorMatch[0] });
              reject(new Error(errorMatch[0]));
            }
          }

          response.data = JSON.parse(data);

          if (response.data.errors != null && response.data.errors.length > 0) {
            const errorMessage = response.data.errors.map((error) => error.description).join(", ");
            console.error({ headers: response.headers, message: errorMessage });
            reject(new Error(errorMessage));
          }

          resolve(response);
        } catch (e) {
          reject(e);
        }
      });

      stream.on("error", (e) => {
        reject(e);
      });

      stream.end();
    });
  }

  private listenToEventSource(): void {
    const stream = this.http2Session.request({
      [HTTP2_HEADER_METHOD]: "GET",
      [HTTP2_HEADER_PATH]: "/eventstream/clip/v2",
      [HTTP2_HEADER_ACCEPT]: "text/event-stream",
      "hue-application-key": this.bridgeUsername,
      [sensitiveHeaders]: ["hue-application-key"],
    });

    let parser: Chain | null = null;

    const onParsedUpdateEvent = ({ value: updateEvent }: ParsedUpdateEvent) => {
      this.setLights?.((lights) => {
        const lightUpdates = updateEvent.data.filter((resource) => {
          return resource.type === "light";
        }) as (Partial<Light> & HasId)[];

        return lights.replaceItems(lightUpdates.mergeObjectsById());
      });

      this.setGroupedLights?.((groupedLights) => {
        const updatedGroupedLights = updateEvent.data.filter((resource) => {
          return resource.type === "grouped_light";
        }) as (Partial<GroupedLight> & HasId)[];
        return groupedLights.replaceItems(updatedGroupedLights);
      });

      this.setRooms?.((rooms) => {
        const updatedRooms = updateEvent.data.filter((resource) => {
          return resource.type === "room";
        }) as (Partial<Room> & HasId)[];
        return rooms.replaceItems(updatedRooms);
      });

      this.setZones?.((zones) => {
        const updatedZones = updateEvent.data.filter((resource) => {
          return resource.type === "zone";
        }) as (Partial<Zone> & HasId)[];
        return zones.replaceItems(updatedZones);
      });

      this.setScenes?.((scenes) => {
        const updatedScenes = updateEvent.data.filter((resource) => {
          return resource.type === "scene";
        }) as (Partial<Scene> & HasId)[];
        return scenes.replaceItems(updatedScenes);
      });

      // If the parser encounters a new JSON array, it will throw an error
      // because two successive arrays is not valid JSON.
      // To prevent this, a new parser is created for each new array.
      parser = null;
    };

    stream.setEncoding("utf8");

    stream.on("data", (chunk) => {
      parser ??= createNewParser(parser, onParsedUpdateEvent);

      const lines = chunk.split("\n");

      for (const line of lines) {
        const dataPrefixIndex = line.indexOf(DATA_PREFIX);
        if (dataPrefixIndex === -1) continue;
        const dataString: string = line.substring(dataPrefixIndex + DATA_PREFIX.length);
        parser.write(dataString);
      }
    });

    stream.on("end", () => {
      parser?.end();
      stream.close();
    });

    stream.on("error", (error) => {
      console.error(error);
      parser?.end();
      stream.close();
    });
  }
}

function createNewParser(parser: Chain | null, callback: (data: ParsedUpdateEvent) => void): Chain {
  parser = StreamArray.withParser();

  parser.on("data", (data) => {
    callback(data);
    parser = null;
  });

  parser.on("error", (err) => {
    console.error(`Parser error: ${err}`);
  });

  return parser;
}
