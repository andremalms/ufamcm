import React, { useEffect, useRef } from 'react';
import { Viewer } from 'mapillary-js';

const MAPILLARY_ACCESS_TOKEN = 'MLY|9269492676456633|a6293e72d833fa0f80c33e4fb48d14f5';

const MapillaryViewer = ({ onNodeChange }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = new Viewer({
      accessToken: MAPILLARY_ACCESS_TOKEN,
      container: viewerRef.current,
      imageId: '840083121440177',
      component: {
        cover: false,
        direction: false,
        sequence: false,
        zoom: false
      }
    });

    viewer.on('nodechanged', onNodeChange);

    return () => {
      viewer.off('nodechanged', onNodeChange);
      viewer.remove();
    };
  }, [onNodeChange]);

  return <div ref={viewerRef} className="w-1/2 h-full" />;
};

export default MapillaryViewer;