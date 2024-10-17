import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from 'mapillary-js';
import mapboxgl from 'mapbox-gl';
import 'mapillary-js/dist/mapillary.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ArrowLeft, ArrowRight } from 'lucide-react'; // Import arrow icons

const MAPILLARY_ACCESS_TOKEN = 'MLY|9269492676456633|a6293e72d833fa0f80c33e4fb48d14f5';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYW5kcmVtZW5kb25jYSIsImEiOiJjbGxrMmRidjYyaGk4M21tZ2hhanFjMjVwIn0.4_fHgnbXRc1Hxg--Bs_kkg';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const StreetViewPage = () => {
  const mapillaryContainerRef = useRef(null);
  const mapboxContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [currentImageId, setCurrentImageId] = useState('840083121440177'); // Initial image ID

  useEffect(() => {
    if (!mapillaryContainerRef.current || !mapboxContainerRef.current) return;

    let mly, mbx;

    try {
      mly = new Viewer({
        accessToken: MAPILLARY_ACCESS_TOKEN,
        container: mapillaryContainerRef.current,
        imageId: currentImageId,
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

      // Add scale bar
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      });
      mbx.addControl(scale);

      setViewer(mly);
      setMap(mbx);

      // Add initial vector point
      mbx.on('load', () => {
        fetch(`https://graph.mapillary.com/${currentImageId}?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=geometry`)
          .then(response => response.json())
          .then(data => {
            const [lon, lat] = data.geometry.coordinates;
            mbx.addSource('initial-point', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [lon, lat]
                  }
                }]
              }
            });

            mbx.addLayer({
              id: 'initial-point',
              type: 'circle',
              source: 'initial-point',
              paint: {
                'circle-radius': 6,
                'circle-color': 'red',
                'circle-stroke-width': 2,
                'circle-stroke-color': 'white'
              }
            });

            mbx.flyTo({
              center: [lon, lat],
              zoom: 17
            });
          })
          .catch(err => {
            console.error('Error fetching initial image data:', err);
            setError('Failed to fetch initial image data. Please try again later.');
          });
      });

      const handleNodeChange = async (event) => {
        const { lat, lon } = event.nodeCamera;
        mbx.setCenter([lon, lat]);
        setCurrentImageId(event.image.id);

        try {
          const response = await fetch(`https://graph.mapillary.com/images?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=id,geometry,sequence&sequence_id=${event.image.sequenceId}`);
          const data = await response.json();

          // Remove existing layers and sources
          if (mbx.getLayer('sequence-points')) mbx.removeLayer('sequence-points');
          if (mbx.getSource('sequence-points')) mbx.removeSource('sequence-points');

          // Add new source and layer for sequence points
          mbx.addSource('sequence-points', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: data.data.map(image => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: image.geometry.coordinates
                },
                properties: {
                  id: image.id,
                  isCurrentImage: image.id === event.image.id
                }
              }))
            }
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
                console.log('Moved to image');
                setCurrentImageId(clickedImageId);
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
  }, [currentImageId]);

  const navigateImage = (direction) => {
    if (viewer) {
      const method = direction === 'next' ? 'moveToNextImage' : 'moveToPrevImage';
      viewer[method]()
        .catch(error => {
          console.error(`Failed to navigate ${direction}:`, error);
          // You can set an error state here if you want to display it to the user
        });
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex h-screen relative">
      <div ref={mapillaryContainerRef} className="w-1/2 h-full relative">
        {/* Navigation arrows */}
        <button 
          onClick={() => navigateImage('prev')} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
        >
          <ArrowLeft className="h-6 w-6 text-gray-800" />
        </button>
        <button 
          onClick={() => navigateImage('next')} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
        >
          <ArrowRight className="h-6 w-6 text-gray-800" />
        </button>
      </div>
      <div ref={mapboxContainerRef} className="w-1/2 h-full" />
    </div>
  );
};

export default StreetViewPage;