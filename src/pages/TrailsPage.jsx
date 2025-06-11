
import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from 'mapillary-js';
import mapboxgl from 'mapbox-gl';
import 'mapillary-js/dist/mapillary.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ArrowLeft, ArrowRight, TreesIcon } from 'lucide-react';
import { trailData, getAllTrails } from '../utils/mapData.js';

const MAPILLARY_ACCESS_TOKEN = 'MLY|9269492676456633|a6293e72d833fa0f80c33e4fb48d14f5';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYW5kcmVtZW5kb25jYSIsImEiOiJjbGxrMmRidjYyaGk4M21tZ2hhanFjMjVwIn0.4_fHgnbXRc1Hxg--Bs_kkg';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const TrailsPage = () => {
  const mapillaryContainerRef = useRef(null);
  const mapboxContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [currentImageId, setCurrentImageId] = useState('840083121440177');
  const [selectedTrail, setSelectedTrail] = useState('trail1');

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
        style: 'mapbox://styles/mapbox/outdoors-v11', // Changed to outdoors style for trails
        center: [-59.9763193, -3.0989414],
        zoom: 15,
      });

      // Add scale bar
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      });
      mbx.addControl(scale);

      setViewer(mly);
      setMap(mbx);

      // Add all trail points on map load
      mbx.on('load', () => {
        const trails = getAllTrails();
        
        trails.forEach(trail => {
          const sourceId = `trail-${trail.id}`;
          const layerId = `trail-${trail.id}-points`;
          
          mbx.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: trail.points.map(point => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [point.lon, point.lat]
                },
                properties: {
                  imageId: point.imageId,
                  trailId: trail.id,
                  trailName: trail.name
                }
              }))
            }
          });

          mbx.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 6,
              'circle-color': trail.color,
              'circle-stroke-width': 2,
              'circle-stroke-color': 'white',
              'circle-opacity': 0.8
            }
          });

          // Add click event to trail points
          mbx.on('click', layerId, (e) => {
            if (e.features.length > 0) {
              const clickedImageId = e.features[0].properties.imageId;
              const clickedTrailId = e.features[0].properties.trailId;
              setSelectedTrail(clickedTrailId);
              mly.moveTo(clickedImageId).then(() => {
                console.log('Moved to trail image');
                setCurrentImageId(clickedImageId);
              });
            }
          });

          // Change cursor on hover
          mbx.on('mouseenter', layerId, () => {
            mbx.getCanvas().style.cursor = 'pointer';
          });
          mbx.on('mouseleave', layerId, () => {
            mbx.getCanvas().style.cursor = '';
          });
        });

        // Center map on first trail
        const firstTrail = trails[0];
        if (firstTrail.points.length > 0) {
          mbx.flyTo({
            center: [firstTrail.points[0].lon, firstTrail.points[0].lat],
            zoom: 15
          });
        }
      });

      const handleNodeChange = async (event) => {
        const { lat, lon } = event.nodeCamera;
        mbx.setCenter([lon, lat]);
        setCurrentImageId(event.image.id);
      };

      mly.on('nodechanged', handleNodeChange);

      return () => {
        mly.off('nodechanged', handleNodeChange);
        mly.remove();
        mbx.remove();
      };
    } catch (err) {
      console.error('Error initializing viewers:', err);
      setError('Failed to initialize trail view. Please try again later.');
    }
  }, [currentImageId]);

  const navigateImage = (direction) => {
    if (viewer) {
      const method = direction === 'next' ? 'moveToNextKey' : 'moveToPreviousKey';
      viewer[method]()
        .catch(error => {
          console.error(`Failed to navigate ${direction}:`, error);
          setError(`Failed to navigate ${direction}. Please try again.`);
        });
    }
  };

  const switchToTrail = (trailId) => {
    const trail = trailData[trailId];
    if (trail && trail.points.length > 0 && viewer && map) {
      const firstPoint = trail.points[0];
      setSelectedTrail(trailId);
      viewer.moveTo(firstPoint.imageId).then(() => {
        setCurrentImageId(firstPoint.imageId);
        map.flyTo({
          center: [firstPoint.lon, firstPoint.lat],
          zoom: 15
        });
      }).catch(error => {
        console.error('Failed to switch to trail:', error);
        setError('Failed to switch to trail. Please try again.');
      });
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const trails = getAllTrails();

  return (
    <div className="flex h-screen relative">
      {/* Trail Selection Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <TreesIcon className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Forest Trails</h3>
        </div>
        <div className="space-y-2">
          {trails.map(trail => (
            <button
              key={trail.id}
              onClick={() => switchToTrail(trail.id)}
              className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedTrail === trail.id 
                  ? 'bg-green-100 text-green-800 font-semibold' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: trail.color }}
                ></div>
                {trail.name}
              </div>
            </button>
          ))}
        </div>
      </div>

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

export default TrailsPage;
