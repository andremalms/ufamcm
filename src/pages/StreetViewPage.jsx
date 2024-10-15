import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from 'mapillary-js';
import mapboxgl from 'mapbox-gl';
import 'mapillary-js/dist/mapillary.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPILLARY_ACCESS_TOKEN = 'MLY|9269492676456633|a6293e72d833fa0f80c33e4fb48d14f5';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYW5kcmVtZW5kb25jYSIsImEiOiJjbGxrMmRidjYyaGk4M21tZ2hhanFjMjVwIn0.4_fHgnbXRc1Hxg--Bs_kkg';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const StreetViewPage = () => {
  const mapillaryContainerRef = useRef(null);
  const mapboxContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);

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

      const handleNodeChange = async (event) => {
        const { lat, lon } = event.nodeCamera;
        mbx.setCenter([lon, lat]);
        setCurrentImageId(event.image.id);

        // Fetch and display sequence points
        try {
          const response = await fetch(`https://graph.mapillary.com/images?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=id,geometry,sequence&sequence_id=${event.image.sequenceId}`);
          const data = await response.json();

          // Remove existing markers
          document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

          // Add new markers for each image in the sequence
          data.data.forEach(image => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.width = '10px';
            el.style.height = '10px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = image.id === event.image.id ? 'red' : 'blue';

            const marker = new mapboxgl.Marker(el)
              .setLngLat([image.geometry.coordinates[0], image.geometry.coordinates[1]])
              .addTo(mbx);

            el.addEventListener('click', () => {
              mly.moveTo(image.id).then(() => {
                console.log('Moved to image');
                setCurrentImageId(image.id);
              });
            });
          });
        } catch (error) {
          console.error('Error fetching sequence data:', error);
          setError('Failed to fetch sequence data. Please try again later.');
        }
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