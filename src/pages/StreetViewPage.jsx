import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const StreetViewPage = () => {
  const [showFrame, setShowFrame] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we're on HTTPS
    if (window.location.protocol === 'https:') {
      setError('Mixed content blocked. The street view map uses an insecure HTTP connection.');
    }
  }, []);

  const handleLoadFrame = () => {
    setShowFrame(true);
    setError(null);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Mapas de Rua UFAM</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!showFrame && (
        <Button onClick={handleLoadFrame} className="mb-4">
          Load Street View Map
        </Button>
      )}
      
      {showFrame && (
        <iframe
          src="http://18.116.82.248/cmufam/"
          title="Mapas de Rua UFAM"
          className="w-full h-full border-none"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default StreetViewPage;