import { notFound } from 'next/navigation';
import RoomDetail from '../../../components/RoomDetail';
import { getRoomDetail, roomDetailList } from '../../../data/roomDetails';

export function generateStaticParams() {
  return roomDetailList.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const detail = getRoomDetail(slug);

  if (!detail) {
    return {};
  }

  return {
    title: `${detail.name} | Laya Balita`,
    description: `${detail.name} at Laya Balita near Varkala South Cliff.`,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const detail = getRoomDetail(slug);

  if (!detail) {
    notFound();
  }

  return <RoomDetail detail={detail} />;
}
