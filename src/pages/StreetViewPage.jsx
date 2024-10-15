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
        component: {
          cover: false,
          direction: false,
          sequence: false,
          zoom: false
        }
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
        try {
          const { lat, lon } = event.nodeCamera;
          mbx.setCenter([lon, lat]);
          setCurrentImageId(event.image.id);

          console.log('Current Mapillary Image Coordinates:', { lat, lon });

          const response = await fetch(`https://graph.mapillary.com/images?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=id,geometry,sequence&sequence_id=${event.image.sequenceId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          console.log('API Response:', data);

          if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid API response format');
          }

          // Process the data into GeoJSON
          const geoJsonData = {
            type: 'FeatureCollection',
            features: data.data.map(image => {
              if (!image.geometry || !image.geometry.coordinates) {
                console.warn('Invalid image data:', image);
                return null;
              }
              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: image.geometry.coordinates
                },
                properties: {
                  id: image.id,
                  isCurrentImage: image.id === event.image.id
                }
              };
            }).filter(feature => feature !== null)
          };

          console.log('Processed GeoJSON:', geoJsonData);

          // Remove existing layers and sources
          if (mbx.getLayer('sequence-points')) mbx.removeLayer('sequence-points');
          if (mbx.getSource('sequence-points')) mbx.removeSource('sequence-points');

          // Add new source and layer for sequence points
          mbx.addSource('sequence-points', {
            type: 'geojson',
            data: geoJsonData
          });

          mbx.addLayer({
            id: 'sequence-points',
            type: 'circle',
            source: 'sequence-points',
            paint: {
              'circle-radius': 6,
              'circle-color': ['case', ['==', ['get', 'isCurrentImage'], true], 'red', 'blue'],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'white'
            }
          });

          // Add click event to the points
          mbx.on('click', 'sequence-points', (e) => {
            if (e.features.length > 0) {
              const clickedImageId = e.features[0].properties.id;
              mly.moveTo(clickedImageId).then(() => {
                console.log('Moved to image:', clickedImageId);
                setCurrentImageId(clickedImageId);
              }).catch(err => {
                console.error('Error moving to image:', err);
                setError('Failed to move to the selected image. Please try again.');
              });
            }
          });

          // Change cursor on hover
          mbx.on('mouseenter', 'sequence-points', () => {
            mbx.getCanvas().style.cursor = 'pointer';
          });
          mbx.on('mouseleave', 'sequence-points', () => {
            mbx.getCanvas().style.cursor = '';
          });

        } catch (err) {
          console.error('Error processing data or adding layer:', err);
          setError('An error occurred while updating the map. Please try again later.');
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