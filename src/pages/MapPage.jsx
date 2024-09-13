import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import ScaleLine from 'ol/control/ScaleLine';

const MapPage = () => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [currentBasemap, setCurrentBasemap] = useState('osm');

  const basemaps = {
    osm: new TileLayer({
      source: new OSM(),
    }),
    satellite: new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      }),
    }),
    urban3d: new TileLayer({
      source: new XYZ({
        url: 'https://tiles.osmbuildings.org/OSMBuildings/tiles/osmbuildings/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous',
        maxZoom: 19,
      }),
    }),
  };

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [basemaps.osm],
      view: new View({
        center: fromLonLat([-59.9763193, -3.0989414]),
        zoom: 14,
      }),
      controls: [new ScaleLine()],
    });

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, []);

  const changeBasemap = (basemapKey) => {
    if (map) {
      if (basemapKey === 'urban3d') {
        map.getLayers().clear();
        map.addLayer(basemaps.osm);
        map.addLayer(basemaps.urban3d);
      } else {
        map.getLayers().clear();
        map.addLayer(basemaps[basemapKey]);
      }
      setCurrentBasemap(basemapKey);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Navegar no Mapa</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${currentBasemap === 'osm' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => changeBasemap('osm')}
          >
            OpenStreetMap
          </button>
          <button
            className={`px-4 py-2 rounded ${currentBasemap === 'satellite' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => changeBasemap('satellite')}
          >
            Satellite
          </button>
          <button
            className={`px-4 py-2 rounded ${currentBasemap === 'urban3d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => changeBasemap('urban3d')}
          >
            3D Urban (OSM Buildings)
          </button>
        </div>
      </div>
      <div ref={mapRef} className="flex-grow" />
    </div>
  );
};

export default MapPage;