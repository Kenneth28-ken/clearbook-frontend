
import React from 'react';
import { useParams } from 'react-router-dom';
import PublicDigitalMenu from './PublicDigitalMenu';

const PublicDigitalMenuWrapper: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();

  if (!businessId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10 text-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">INVALID MENU</h1>
          <p className="text-gray-500">This digital menu link appears to be broken.</p>
        </div>
      </div>
    );
  }

  return <PublicDigitalMenu businessUid={businessId} />;
};

export default PublicDigitalMenuWrapper;
