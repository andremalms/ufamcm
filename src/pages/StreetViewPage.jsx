import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from 'mapillary-js';
import mapboxgl from 'mapbox-gl';
import 'mapillary-js/dist/mapillary.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import syncMove from '@mapbox/mapbox-gl-sync-move';

// Replace with your actual Mapillary and Mapbox access tokens
const MAPILLARY_ACCESS_TOKEN = 'YOUR_MAPILLARY_ACCESS_TOKEN';
const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const StreetViewPage = () => {
  const mapillaryContainerRef = useRef(null);
  const mapboxContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [map, setMap] = useState(null);
  const [currentImageId, setCurrentImageId] = useState('840083121440177');

  useEffect(() => {
    if (!mapillaryContainerRef.current || !mapboxContainerRef.current) return;

    const mly = new Viewer({
      accessToken: MAPILLARY_ACCESS_TOKEN,
      container: mapillaryContainerRef.current,
      imageId: currentImageId,
    });

    const mbx = new mapboxgl.Map({
      container: mapboxContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 17,
      pitch: 45,
      bearing: 0,
    });

    syncMove(mbx, mly);

    setViewer(mly);
    setMap(mbx);

    return () => {
      mly.remove();
      mbx.remove();
    };
  }, []);

  useEffect(() => {
    if (!viewer || !map) return;

    const handleNodeChange = (event) => {
      const { lat, lon, ca } = event.nodeCamera;
      map.setCenter([lon, lat]);
      map.setBearing(ca);
      setCurrentImageId(event.image.id);
    };

    viewer.on('nodechanged', handleNodeChange);

    return () => {
      viewer.off('nodechanged', handleNodeChange);
    };
  }, [viewer, map]);

  useEffect(() => {
    if (!map || !viewer) return;

    const updateMapMarkers = async () => {
      try {
        const position = await viewer.getPosition();
        const sequenceComponent = viewer.getComponent('sequence');
        const sequences = await sequenceComponent.getSequences();

        if (map.getSource('points')) {
          map.removeLayer('points');
          map.removeSource('points');
        }

        const features = sequences.flatMap(seq => seq.nodes.map(node => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [node.computedLatLon.lon, node.computedLatLon.lat],
          },
          properties: {
            id: node.id,
            isActive: node.id === currentImageId,
          },
        })));

        map.addSource('points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features,
          },
        });

        map.addLayer({
          id: 'points',
          type: 'circle',
          source: 'points',
          paint: {
            'circle-radius': 6,
            'circle-color': ['case', ['==', ['get', 'isActive'], true], 'red', 'blue'],
          },
        });

        map.on('click', 'points', (e) => {
          if (e.features.length > 0) {
            const clickedPointId = e.features[0].properties.id;
            viewer.moveTo(clickedPointId).catch(console.error);
          }
        });
      } catch (error) {
        console.error('Error updating map markers:', error);
      }
    };

    updateMapMarkers();
    viewer.on('nodechanged', updateMapMarkers);

    return () => {
      viewer.off('nodechanged', updateMapMarkers);
    };
  }, [map, viewer, currentImageId]);

  return (
    <div className="flex h-screen">
      <div ref={mapillaryContainerRef} className="w-1/2 h-full" />
      <div ref={mapboxContainerRef} className="w-1/2 h-full" />
    </div>
  );
};

export default StreetViewPage;