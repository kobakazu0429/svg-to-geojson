declare module "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw" {
  import { Control } from "mapbox-gl";

  export default class MapboxDraw extends Control {
    public add(coord: any): void;
    public getAll(): void;
    public deleteAll(): void;
  }
}
