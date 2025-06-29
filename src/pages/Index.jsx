import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, Map, Leaf, TreesIcon } from 'lucide-react';

const Index = () => {
  const options = [
    { title: 'Navegar no Mapa', icon: <MapPin className="h-12 w-12 mb-4" />, path: '/map' },
    { title: 'Informar Ocorrências', icon: <AlertTriangle className="h-12 w-12 mb-4" />, path: '/report-crime' },
    { title: 'Mapas de Rua', icon: <Map className="h-12 w-12 mb-4" />, path: '/street-view' },
    { title: 'TRAILS', icon: <TreesIcon className="h-12 w-12 mb-4" />, path: '/trails' },
    { title: 'Árvores AHPICE', icon: <Leaf className="h-12 w-12 mb-4" />, path: '/trees' },
  ];

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundImage: 'url(https://i.ibb.co/NZ9dGqS/cmufam.png)'}}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-12 shadow-text">CAMPUS MAP UFAM</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {options.map((option, index) => (
            <Link key={index} to={option.path} className="block">
              <div className="bg-white bg-opacity-80 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center h-full">
                {option.icon}
                <h2 className="text-xl font-semibold text-gray-900">{option.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
