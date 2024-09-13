import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import ImageWMS from 'ol/source/ImageWMS';
import { fromLonLat, transform } from 'ol/proj';
import { ScaleLine, Zoom, defaults as defaultControls } from 'ol/control';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Compass, Crosshair } from 'lucide-react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Icon } from 'ol/style';

const MapPage = () => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [currentBasemap, setCurrentBasemap] = useState('osm');
  const [wmsLayers, setWmsLayers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const basemaps = {
    osm: new TileLayer({ source: new OSM() }),
    satellite: new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        crossOrigin: 'anonymous',
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

  const availableWmsLayers = [
    { name: 'Árvores', layer: 'cmufam:arvores' },
    { name: 'Edificações', layer: 'cmufam:edificacoes' },
    { name: 'Vias', layer: 'cmufam:vias' },
  ];

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [basemaps.osm],
      view: new View({
        center: fromLonLat([-59.9763193, -3.0989414]),
        zoom: 14,
      }),
      controls: defaultControls().extend([
        new ScaleLine(),
        new Zoom(),
      ]),
    });

    // Add North Arrow
    const northArrow = new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature({
            geometry: new Point(fromLonLat([-59.9763193, -3.0989414])),
          }),
        ],
      }),
      style: new Style({
        image: new Icon({
          src: 'https://cdn.jsdelivr.net/npm/compass-icon@1.0.2/compass-icon.svg',
          scale: 0.05,
          anchor: [0.5, 1],
        }),
      }),
    });
    initialMap.addLayer(northArrow);

    setMap(initialMap);

    const initialWmsLayers = {};
    availableWmsLayers.forEach(({ name, layer }) => {
      const wmsLayer = new ImageLayer({
        source: new ImageWMS({
          url: 'http://18.116.82.248:8080/geoserver/cmufam/wms',
          params: { 'LAYERS': layer, 'TILED': true },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
        visible: false,
      });
      initialMap.addLayer(wmsLayer);
      initialWmsLayers[name] = wmsLayer;
    });
    setWmsLayers(initialWmsLayers);

    return () => initialMap.setTarget(undefined);
  }, []);

  const changeBasemap = (basemapKey) => {
    if (map) {
      map.getLayers().setAt(0, basemaps[basemapKey]);
      setCurrentBasemap(basemapKey);
    }
  };

  const toggleWmsLayer = (layerName) => {
    const layer = wmsLayers[layerName];
    if (layer) {
      layer.setVisible(!layer.getVisible());
      setWmsLayers({ ...wmsLayers });
    }
  };

  const handleSearch = async () => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
    const data = await response.json();
    if (data.length > 0) {
      const [lon, lat] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      map.getView().animate({
        center: fromLonLat([lon, lat]),
        zoom: 16,
      });
    }
  };

  const handleLocationClick = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        map.getView().animate({
          center: fromLonLat([longitude, latitude]),
          zoom: 16,
        });
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Navegar no Mapa</h1>
        <div className="flex space-x-4 mb-4">
          {Object.keys(basemaps).map((key) => (
            <button
              key={key}
              className={`px-4 py-2 rounded ${currentBasemap === key ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => changeBasemap(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          {availableWmsLayers.map(({ name }) => (
            <div key={name} className="flex items-center space-x-2">
              <Checkbox
                id={name}
                checked={wmsLayers[name]?.getVisible()}
                onCheckedChange={() => toggleWmsLayer(name)}
              />
              <Label htmlFor={name}>{name}</Label>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Search for a location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" /> Search</Button>
          <Button onClick={handleLocationClick}><Crosshair className="h-4 w-4 mr-2" /> Where I am</Button>
        </div>
      </div>
      <div ref={mapRef} className="flex-grow relative">
        <div className="absolute top-2 right-2 z-10">
          <Compass className="h-8 w-8 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default MapPage;