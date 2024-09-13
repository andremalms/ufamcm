import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';

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
    terrain: new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
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
    });

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, []);

  const changeBasemap = (basemapKey) => {
    if (map) {
      map.getLayers().setAt(0, basemaps[basemapKey]);
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
            className={`px-4 py-2 rounded ${currentBasemap === 'terrain' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => changeBasemap('terrain')}
          >
            Terrain
          </button>
        </div>
      </div>
      <div ref={mapRef} className="flex-grow" />
    </div>
  );
};

export default MapPage;