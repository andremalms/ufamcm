import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYW5kcmVtZW5kb25jYSIsImEiOiJjbGxrMmRidjYyaGk4M21tZ2hhanFjMjVwIn0.4_fHgnbXRc1Hxg--Bs_kkg';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const MapboxMap = ({ onMapLoad }) => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-59.9763193, -3.0989414],
      zoom: 17,
    });

    map.on('load', () => onMapLoad(map));

    return () => map.remove();
  }, [onMapLoad]);

  return <div ref={mapContainerRef} className="w-1/2 h-full" />;
};

export default MapboxMap;