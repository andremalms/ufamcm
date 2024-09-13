import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, transform } from 'ol/proj';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';

const ReportCrimePage = () => {
  const mapRef = useRef();
  const popupRef = useRef();
  const [map, setMap] = useState(null);
  const [vectorSource, setVectorSource] = useState(null);
  const [crimeType, setCrimeType] = useState('');
  const [crimeTime, setCrimeTime] = useState('');
  const [crimeDate, setCrimeDate] = useState('');
  const [crimeObservation, setCrimeObservation] = useState('');
  const [clickedCoord, setClickedCoord] = useState(null);

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([-59.9763193, -3.0989414]),
        zoom: 14,
      }),
    });

    const initialVectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: initialVectorSource,
      style: new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }),
    });

    initialMap.addLayer(vectorLayer);

    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });
    initialMap.addOverlay(popup);

    initialMap.on('click', (event) => {
      const clickedCoord = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      setClickedCoord(clickedCoord);
      popup.setPosition(event.coordinate);
      popupRef.current.style.display = 'block';
    });

    setMap(initialMap);
    setVectorSource(initialVectorSource);

    return () => initialMap.setTarget(undefined);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clickedCoord) {
      const feature = new Feature({
        geometry: new Point(fromLonLat(clickedCoord)),
        properties: {
          type: crimeType,
          time: crimeTime,
          date: crimeDate,
          observation: crimeObservation,
        },
      });
      vectorSource.addFeature(feature);
      popupRef.current.style.display = 'none';
      setCrimeType('');
      setCrimeTime('');
      setCrimeDate('');
      setCrimeObservation('');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Informar Ocorrências</h1>
      </div>
      <div ref={mapRef} className="flex-grow relative">
        <div ref={popupRef} className="absolute bg-white p-4 rounded shadow-md max-w-sm" style={{ display: 'none', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="crimeType" className="block text-sm font-medium text-gray-700">Tipo de Crime</label>
              <input
                type="text"
                id="crimeType"
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="crimeTime" className="block text-sm font-medium text-gray-700">Hora da Ocorrência</label>
              <input
                type="time"
                id="crimeTime"
                value={crimeTime}
                onChange={(e) => setCrimeTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="crimeDate" className="block text-sm font-medium text-gray-700">Data da Ocorrência</label>
              <input
                type="date"
                id="crimeDate"
                value={crimeDate}
                onChange={(e) => setCrimeDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="crimeObservation" className="block text-sm font-medium text-gray-700">Observação</label>
              <textarea
                id="crimeObservation"
                value={crimeObservation}
                onChange={(e) => setCrimeObservation(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-between">
              <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Submeter
              </button>
              <button type="button" onClick={() => popupRef.current.style.display = 'none'} className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportCrimePage;