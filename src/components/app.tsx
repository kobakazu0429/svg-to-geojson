import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./app.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
import { pathologize } from "../pathologize";
import { Coord, pathToCoords } from "../path-to-coordinates";

const svgo = new Worker("../web-workers/svgo.js");
mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

let currentFile: File;

const SCALE = 1;

export const App: React.VFC = () => {
  const mouseCoordinates = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const mapContainer = useRef<HTMLDivElement>(null);
  const [helpText, setHelpText] = useState("Drag and drop an SVG on the map.");
  const segmentCount = useRef(250);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw>(new MapboxDraw());

  useEffect(() => {
    if (mapContainer.current) {
      const mymap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v9",
        center: [0, 0],
        zoom: 1,
      });

      mymap.on("load", () => {
        mymap.addControl(draw.current);
        // Triggers a map redraw once the component has finished mounting to ensure the rendered map fills the entire container. See: https://www.mapbox.com/help/blank-tiles/#mapbox-gl-js
        mymap.resize();
      });

      map.current = mymap;
    }
  }, [mapContainer, draw]);

  const updateHandle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!draw.current) return;
      segmentCount.current = e.target.valueAsNumber;

      draw.current.deleteAll();

      if (currentFile) {
        const reader = new FileReader();
        reader.addEventListener("load", (d) => {
          svgo.postMessage({
            svg: d.target?.result,
          });
        });

        reader.readAsText(currentFile);
      }
    },
    [draw]
  );

  const download = useCallback(() => {
    const blob = new Blob([JSON.stringify(draw.current.getAll(), null, 2)], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "features.geojson");
  }, [draw]);

  const trackCoordinates = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      mouseCoordinates.current = {
        x: e.screenX,
        y: e.screenY,
      };
    },
    []
  );

  const calculateCoords = useCallback(
    (svg) => {
      const { x, y } = mouseCoordinates.current;

      // Attempt a couple methods to get width/height values on the SVG element
      // to return reasonable x/y coordinates on the map.
      let { width, height } = svg.getBBox();

      if (width === 0 && svg.getAttribute("width")) {
        width = parseInt(svg.getAttribute("width"), 10);
      }

      if (height === 0 && svg.getAttribute("height")) {
        height = parseInt(svg.getAttribute("height"), 10);
      }

      return {
        x: x - width / 2,
        y: y - height / 2,
      };
    },
    [mouseCoordinates]
  );

  const buildFeature = (data: Coord) => {
    if (!map.current) return;
    const { path, coords } = data;

    const feature: {
      type: "Feature";
      properties: {
        id?: string;
        fill?: string | null;
      };
      geometry: {
        type?: "Polygon" | "MultiPolygon" | "LineString";
        coordinates?: any;
      };
    } = {
      type: "Feature",
      properties: {},
      geometry: {},
    };

    if (path.id) {
      feature.properties.id = path.id;
    }

    if (path.getAttribute("fill")) {
      feature.properties.fill = path.getAttribute("fill");
    }

    // If the first and last coords match it should be drawn as a polygon
    if (
      coords[0][0] === coords[coords.length - 1][0] &&
      coords[0][1] === coords[coords.length - 1][1]
    ) {
      feature.geometry = {
        type: "Polygon",
        coordinates: [
          coords.map((d) => {
            const c = map.current!.unproject(d);
            return [c.lng, c.lat];
          }),
        ],
      };
    } else {
      try {
        // try to see if it should be a multipolygon
        let distances: number[] = [];
        let splits: number[] = [];
        coords.forEach((c, idx) => {
          if (idx > 0) {
            const from = turf.point([
              map.current!.unproject(coords[idx - 1])["lng"],
              map.current!.unproject(coords[idx - 1])["lat"],
            ]);
            const to = turf.point([
              map.current!.unproject(c)["lng"],
              map.current!.unproject(c)["lat"],
            ]);
            const distance = turf.distance(from, to, { units: "miles" });
            // get distances between points
            distances.push(distance);
          }
        });

        const distAvg =
          distances.reduce((total, num) => total + num) / distances.length;
        coords.forEach((c, idx) => {
          if (idx > 0) {
            const from = turf.point([
              map.current!.unproject(coords[idx - 1])["lng"],
              map.current!.unproject(coords[idx - 1])["lat"],
            ]);
            const to = turf.point([
              map.current!.unproject(c)["lng"],
              map.current!.unproject(c)["lat"],
            ]);

            const distance = turf.distance(from, to, { units: "miles" });
            // if the following coordinate is ~2.5 farther away than average, it is most likely a new polygon
            if (distance > distAvg * 2.5) {
              splits.push(idx);
            }
          }
        });

        // idx only gets to last split - needs to get to the end of the shape
        splits.push(segmentCount.current);

        let newShapeArray: any[] = [];
        splits.forEach((s, idx) => {
          let shape: [number, number][] = [];
          if (idx === 0) {
            for (let i = 0; i < s; i++) {
              shape.push([
                map.current!.unproject(coords[i])["lng"],
                map.current!.unproject(coords[i])["lat"],
              ]);
            }
          } else {
            for (let i = splits[idx - 1]; i < s; i++) {
              shape.push([
                map.current!.unproject(coords[i])["lng"],
                map.current!.unproject(coords[i])["lat"],
              ]);
            }
          }
          newShapeArray.push([shape]);
        });

        newShapeArray.forEach((shape) => {
          shape[0].push(shape[0][0]);
        });

        feature.geometry = {
          type: "MultiPolygon",
          coordinates: newShapeArray,
        };
      } catch (err) {
        feature.geometry = {
          type: "LineString",
          coordinates: coords.map((d) => {
            const c = map.current!.unproject(d);
            return [c.lng, c.lat];
          }),
        };
      }
    }

    return feature;
  };

  const svgToGeoJSON = useCallback(
    (svgString: string) => {
      if (!draw.current) return;
      // Create an empty container to fetch paths using the dom
      const empty = document.createElement("div");
      empty.innerHTML = svgString;

      const coordinates = calculateCoords(empty.querySelector("svg"));
      const paths = empty.querySelectorAll("path");

      if (!paths.length) {
        setHelpText("No paths were found in this SVG");
        return;
      }

      const pathsCoord = Array.from(paths)
        .map((path) =>
          pathToCoords(
            path,
            segmentCount.current,
            SCALE,
            coordinates.x,
            coordinates.y
          )
        )
        .map(buildFeature);

      pathsCoord.forEach((coord) => {
        draw.current.add(coord);
      });

      setHelpText("Drag and drop an SVG on the map.");
    },
    [segmentCount, draw]
  );

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    currentFile = file;
    const { type } = file;

    setHelpText((<span className="loading loading--s loading--dark" />) as any);

    if (type !== "image/svg+xml") {
      setHelpText("File type must be SVG");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", (d) => {
      svgo.postMessage({
        svg: d.target?.result,
      });

      svgo.addEventListener("message", (e) => {
        pathologize(e.data)
          .then(svgToGeoJSON)
          .catch((err: any) => {
            console.error(err);
            setHelpText("Error parsing SVG");
            return;
          });
      });
    });

    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <div {...getRootProps()}>
      <div className="pointHolder">
        <input type="number" defaultValue={250} onChange={updateHandle} />
        points
      </div>
      <div onMouseMove={trackCoordinates}>
        <div className="flex-parent flex-parent--end-cross flex-parent--center-main absolute top right bottom left">
          <div className="flex-child mb24 z1 txt-s txt-bold flex-parent">
            <div className="flex-child bg-darken75 color-white inline-block pl24 pr12 py12 round-l-full">
              {helpText}
            </div>
            <button
              className="flex-child btn btn--purple px24 round-r-full"
              onClick={download}
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {isDragActive && (
        <div className="bg-darken25 fixed left right top bottom events-none z5" />
      )}
      <div ref={mapContainer} className="absolute top right left bottom" />
    </div>
  );
};
