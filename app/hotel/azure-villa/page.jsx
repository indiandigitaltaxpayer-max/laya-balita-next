import VillaDetail from '../../components/VillaDetail';
import { villas } from '../../data/villas';

export const metadata = {
  title: 'The Azure Villa | Laya Balita',
  description: 'Explore The Azure Villa at Laya Balita near Varkala South Cliff.',
};

export default function Page() {
  return <VillaDetail villa={villas.azure} />;
}
