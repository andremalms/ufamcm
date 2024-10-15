import React, { useState, useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import MapillaryViewer from '../components/MapillaryViewer';
import MapboxMap from '../components/MapboxMap';

const MAPILLARY_ACCESS_TOKEN = 'MLY|9269492676456633|a6293e72d833fa0f80c33e4fb48d14f5';

const StreetViewPage = () => {
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);

  const handleMapLoad = useCallback((loadedMap) => {
    setMap(loadedMap);
    addSequenceToMap(loadedMap, 'HdQIKnlOYGBktx7paDVMcs');
  }, []);

  const handleNodeChange = useCallback(async (event) => {
    if (!map) return;

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

      updateMapWithSequenceData(map, data, event.image.id);
    } catch (err) {
      console.error('Error processing data or adding layer:', err);
      setError('An error occurred while updating the map. Please try again later.');
    }
  }, [map]);

  const updateMapWithSequenceData = (map, data, currentImageId) => {
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

    console.log('Processed GeoJSON:', geoJsonData);

    if (map.getSource('sequence-points')) {
      map.removeLayer('sequence-points');
      map.removeSource('sequence-points');
    }

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

    console.log('Sequence added to map successfully');
  };

  const addSequenceToMap = async (map, sequenceId) => {
    try {
      console.log('Fetching sequence data for ID:', sequenceId);
      const response = await fetch(`https://graph.mapillary.com/images?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=id,geometry&sequence_id=${sequenceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sequence data received:', data);

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

      // Fit the map to the bounds of the sequence
      const coordinates = geoJsonData.features.map(f => f.geometry.coordinates);
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.fitBounds(bounds, { padding: 50 });

    } catch (err) {
      console.error('Error adding sequence to map:', err);
      setError(`Failed to add sequence to map: ${err.message}`);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex h-screen">
      <MapillaryViewer onNodeChange={handleNodeChange} />
      <MapboxMap onMapLoad={handleMapLoad} />
    </div>
  );
};

export default StreetViewPage;
