import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from 'mapillary-js';
import mapboxgl from 'mapbox-gl';
import 'mapillary-js/dist/mapillary.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace these with your actual tokens or use environment variables
const MAPILLARY_ACCESS_TOKEN = 'YOUR_MAPILLARY_ACCESS_TOKEN';
const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const StreetViewPage = () => {
  const mapillaryContainerRef = useRef(null);
  const mapboxContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapillaryContainerRef.current || !mapboxContainerRef.current) return;

    let mly, mbx;

    try {
      mly = new Viewer({
        accessToken: MAPILLARY_ACCESS_TOKEN,
        container: mapillaryContainerRef.current,
        imageId: '840083121440177',
      });

      mbx = new mapboxgl.Map({
        container: mapboxContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-59.9763193, -3.0989414],
        zoom: 17,
      });

      setViewer(mly);
      setMap(mbx);

      const handleNodeChange = (event) => {
        const { lat, lon } = event.nodeCamera;
        mbx.setCenter([lon, lat]);
      };

      mly.on('nodechanged', handleNodeChange);

      return () => {
        mly.off('nodechanged', handleNodeChange);
        mly.remove();
        mbx.remove();
      };
    } catch (err) {
      console.error('Error initializing viewers:', err);
      setError('Failed to initialize street view. Please try again later.');
    }
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex h-screen">
      <div ref={mapillaryContainerRef} className="w-1/2 h-full" />
      <div ref={mapboxContainerRef} className="w-1/2 h-full" />
    </div>
  );
};

export default StreetViewPage;