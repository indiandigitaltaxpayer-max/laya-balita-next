import VillaDetail from '../../components/VillaDetail';
import { villas } from '../../data/villas';

export const metadata = {
  title: 'The Nook Villa | Laya Balita',
  description: 'Explore The Nook Villa at Laya Balita near Varkala South Cliff.',
};

export default function Page() {
  return <VillaDetail villa={villas.nook} />;
}
