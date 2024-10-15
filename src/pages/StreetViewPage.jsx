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

    const initializeViewers = async () => {
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

        await addSequenceToMap(mbx, 'HdQIKnlOYGBktx7paDVMcs');

        mly.on('nodechanged', handleNodeChange);
      } catch (err) {
        console.error('Error initializing viewers:', err);
        setError('Failed to initialize street view. Please try again later.');
      }
    };

    initializeViewers();

    return () => {
      if (mly) {
        mly.off('nodechanged', handleNodeChange);
        mly.remove();
      }
      if (mbx) {
        mbx.remove();
      }
    };
  }, []);

  const handleNodeChange = async (event) => {
    try {
      const { lat, lon } = event.nodeCamera;
      map.setCenter([lon, lat]);
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

      updateMapWithSequenceData(data, event.image.id);

    } catch (err) {
      console.error('Error processing data or adding layer:', err);
      setError('An error occurred while updating the map. Please try again later.');
    }
  };

  const updateMapWithSequenceData = (data, currentImageId) => {
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
            isCurrentImage: image.id === currentImageId
          }
        };
      }).filter(feature => feature !== null)
    };

    console.log('Processed GeoJSON:', geoJsonData);

    if (map.getLayer('sequence-points')) map.removeLayer('sequence-points');
    if (map.getSource('sequence-points')) map.removeSource('sequence-points');

    map.addSource('sequence-points', {
      type: 'geojson',
      data: geoJsonData
    });

    map.addLayer({
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

    map.on('click', 'sequence-points', (e) => {
      if (e.features.length > 0) {
        const clickedImageId = e.features[0].properties.id;
        viewer.moveTo(clickedImageId).then(() => {
          console.log('Moved to image:', clickedImageId);
          setCurrentImageId(clickedImageId);
        }).catch(err => {
          console.error('Error moving to image:', err);
          setError('Failed to move to the selected image. Please try again.');
        });
      }
    });

    map.on('mouseenter', 'sequence-points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'sequence-points', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  const addSequenceToMap = async (map, sequenceId) => {
    try {
      const response = await fetch(`https://graph.mapillary.com/images?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=id,geometry&sequence_id=${sequenceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid API response format');
      }

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
              id: image.id
            }
          };
        }).filter(feature => feature !== null)
      };

      map.addSource('sequence-points', {
        type: 'geojson',
        data: geoJsonData
      });

      map.addLayer({
        id: 'sequence-points',
        type: 'circle',
        source: 'sequence-points',
        paint: {
          'circle-radius': 6,
          'circle-color': 'green',
          'circle-stroke-width': 2,
          'circle-stroke-color': 'white'
        }
      });

      map.on('click', 'sequence-points', (e) => {
        if (e.features.length > 0) {
          const clickedImageId = e.features[0].properties.id;
          viewer.moveTo(clickedImageId).then(() => {
            console.log('Moved to image:', clickedImageId);
            setCurrentImageId(clickedImageId);
          }).catch(err => {
            console.error('Error moving to image:', err);
            setError('Failed to move to the selected image. Please try again.');
          });
        }
      });

      map.on('mouseenter', 'sequence-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'sequence-points', () => {
        map.getCanvas().style.cursor = '';
      });

      // Fit the map to the bounds of the sequence
      const coordinates = geoJsonData.features.map(f => f.geometry.coordinates);
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.fitBounds(bounds, { padding: 50 });

    } catch (err) {
      console.error('Error adding sequence to map:', err);
      setError('Failed to add sequence to map. Please try again later.');
    }
  };

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