import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Fill, Style, Stroke } from "ol/style";
import { Draw, Modify, Snap } from "ol/interaction";
import { getArea, getLength } from 'ol/sphere';
import { Geometry } from 'ol/geom';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<{ distance: number | null, area: number | null }>({ distance: null, area: null });

  useEffect(() => {
    if (mapRef.current) {
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });

      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: "#ffcc33",
            }),
          }),
        }),
      });
      map.addLayer(vectorLayer);

      const drawInteraction = new Draw({
        source: vectorSource,
        type: "Polygon",
      });

      drawInteraction.on('drawend', (event) => {
        const geometry: Geometry | undefined = event.feature?.getGeometry();
        if (geometry) {
          const area = getArea(geometry);
          const distance = getLength(geometry, { projection: 'EPSG:3857' });
          setMeasurement({ distance, area });
        }
      });

      map.addInteraction(drawInteraction);

      const modifyInteraction = new Modify({
        source: vectorSource,
      });
      map.addInteraction(modifyInteraction);

      const snapInteraction = new Snap({ source: vectorSource });
      map.addInteraction(snapInteraction);

      return () => {
        map.dispose();
      };
    }
  }, []);

  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "90vh",overflow:"auto" }}
      />
      <div>
        {measurement.distance && (
          <p>Distance: {measurement.distance.toFixed(2)} meters</p>
        )}
        {measurement.area && (
          <p>Area: {measurement.area.toFixed(2)} square meters</p>
        )}
      </div>
    </div>
  );
};

export default MapComponent;