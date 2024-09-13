import React from 'react';
import { Link } from 'react-router-dom';
import { MapIcon, AlertTriangle, Map, Leaf } from 'lucide-react';

const Index = () => {
  const options = [
    { title: 'Navegar no Mapa', icon: <MapIcon className="h-12 w-12 mb-4" />, path: '/map' },
    { title: 'Informar Ocorrências', icon: <AlertTriangle className="h-12 w-12 mb-4" />, path: '/report-crime' },
    { title: 'Mapas de Rua', icon: <Map className="h-12 w-12 mb-4" />, path: '/street-view' },
    { title: 'Árvores AHPICE', icon: <Leaf className="h-12 w-12 mb-4" />, path: '/trees' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">CAMPUS MAP UFAM</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {options.map((option, index) => (
            <Link key={index} to={option.path} className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center h-full">
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