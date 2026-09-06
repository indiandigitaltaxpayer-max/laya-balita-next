import { jsonOk, handleApiError } from '../../lib/api';
import { getRoomImages, getRoomUnitImages } from '../../data/roomImages';
import { query } from '../../lib/db';

const villaRoomNames = new Set(['The Azure Villa', 'The Nook Villa', 'The Verdant Villa']);

function getRoomKind(roomName) {
  return villaRoomNames.has(roomName) ? 'villa' : 'room';
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const result = await query(
      `SELECT
        rt.id,
        rt.name,
        rt.description,
        rt.image,
        rt.rate_per_night,
        rt.breakfast_charge,
        rt.features,
        COALESCE((
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', ru.id, 'roomCode', ru.room_code, 'status', ru.status)
          )
          FROM room_units ru
          WHERE ru.room_type_id = rt.id AND ru.status = 'AVAILABLE'
        ), JSON_ARRAY()) AS units
       FROM room_types rt
       ORDER BY rt.name`,
    );

    return jsonOk({
      rooms: result.rows.map((room) => ({
        id: room.id,
        name: room.name,
        kind: getRoomKind(room.name),
        description: room.description,
        image: room.image,
        images: getRoomImages(room.name, room.image),
        ratePerNight: room.rate_per_night,
        breakfastCharge: room.breakfast_charge,
        features: parseJson(room.features, []),
        units: parseJson(room.units, []).map((unit) => ({
          ...unit,
          images: getRoomUnitImages(unit.roomCode, room.name, room.image),
        })),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
