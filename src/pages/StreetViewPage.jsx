import React from 'react';

const StreetViewPage = () => {
  return (
    <div className="h-screen w-full">
      <iframe
        src="http://18.116.82.248/cmufam/#/p/840083121440177"
        title="Mapas de Rua UFAM"
        className="w-full h-full border-none"
        allowFullScreen
      />
    </div>
  );
};

export default StreetViewPage;