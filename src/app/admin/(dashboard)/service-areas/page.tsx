import { Metadata } from 'next';
import ServiceAreasClient from './ServiceAreasClient';

export const metadata: Metadata = {
  title: 'Service Areas | Benva Healthcare',
};

export default function ServiceAreasPage() {
  return (
    <div>
      <ServiceAreasClient />
    </div>
  );
}
