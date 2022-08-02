export interface Light {
  id: string | number;
  name: string;
  state: {
    on: boolean;
    brightness: number;
    xy: [number, number];
    reachable: boolean;
  };
}
