import { rooms } from './rooms';

const baseIncluded = ['Free Wi-Fi', 'Fresh Linen', 'Towels', 'Drinking Water', 'Housekeeping', 'Reception Support', 'Garden Access', 'Parking', 'Inverter Backup'];
const baseRules = [
  'Check-in: 1:00 PM onwards',
  'Check-out: Before 11:00 AM',
  'Quiet hours: 09:00 PM - 08:00 AM',
  'Smoking inside rooms is not permitted.',
  'Pets are currently not allowed.',
  'Extra guests are subject to availability and additional charges.',
];
const locationHighlights = ['4-5 minute walk to South Cliff', 'Cafes and restaurants nearby', 'Quiet residential neighbourhood', 'Easy access to Varkala Beach', 'Parking available'];

export const roomDetails = {
  'balcony-king-room': {
    name: 'Balcony King Room',
    headline: 'King room with your own private balcony.',
    intro: 'A spacious room designed for couples who appreciate a little extra space and the comfort of a private balcony. Available across our villas, with each room offering its own unique outlook.',
    availableIn: ['The Azure Villa', 'The Nook Villa', 'The Verdant Villa'],
    quickFacts: [['fa-user', 'Up to 2 Guests'], ['fa-bed', 'King Bed'], ['fa-home', 'Private Balcony'], ['fa-snowflake-o', 'Air Conditioning'], ['fa-bath', 'Attached Bathroom'], ['fa-wifi', 'Complimentary Wi-Fi']],
    about: 'The Balcony King Room combines a comfortable king-size bed with your own private balcony, creating a restful indoor-outdoor stay near Varkala South Cliff. It is well suited for couples, long weekends, and travellers who like a little more space to slow down.',
    amenities: { Bathroom: ['Attached Bathroom', 'Hot Water', 'Towels', 'Soap', 'Toilet Paper'], Bedroom: ['King Bed', 'Wardrobe', 'Clothes Hangers', 'Bedside Tables', 'Mirror'], Comfort: ['Air Conditioning', 'Private Balcony', 'Complimentary Wi-Fi', 'Inverter Backup', 'Garden Access'] },
    goodToKnow: ['Room layouts and decor vary slightly between villas.', 'Room allocation depends on availability.', 'Every room includes an attached private bathroom.', 'Housekeeping is included.', 'Smoking is not permitted indoors.'],
    perfectFor: ['Couples', 'Remote Workers', 'Long Weekends', 'Guests who enjoy a private balcony'],
    faqs: [['Can I request a specific Balcony King Room?', "You're welcome to request one during booking, and we'll do our best to accommodate it based on availability."], ['Is hot water available?', 'Yes. Hot water is available throughout your stay.'], ['Can we add an extra mattress?', 'Subject to availability and additional charges.']],
  },
  'king-room': {
    name: 'King Room',
    headline: 'Comfortable, spacious and thoughtfully designed for a relaxing stay in Varkala.',
    intro: 'Enjoy a king-size bed, attached private bathroom, air conditioning and all the comforts of Laya Balita, ideal for couples, solo travellers and longer stays.',
    availableIn: ['The Azure Villa'],
    quickFacts: [['fa-user', 'Up to 2 Guests'], ['fa-bed', 'King Bed'], ['fa-bath', 'Attached Bathroom'], ['fa-snowflake-o', 'Air Conditioning'], ['fa-wifi', 'Complimentary Wi-Fi'], ['fa-fire', 'Hot Water']],
    about: 'Our King Rooms offer the same spacious layout and comfortable king-size bed as our Balcony King Rooms, with a more private indoor setting. They are designed for restful nights and relaxed mornings after a day exploring Varkala.',
    amenities: { Bathroom: ['Attached Bathroom', 'Hot Water', 'Towels', 'Soap', 'Toilet Paper'], Bedroom: ['King Bed', 'Wardrobe', 'Clothes Hangers', 'Bedside Tables', 'Mirror'], Comfort: ['Air Conditioning', 'Complimentary Wi-Fi', 'Inverter Backup', 'Garden Access'] },
    goodToKnow: ['Room layouts and decor vary slightly.', 'Room allocation depends on availability.', 'All King Rooms include attached bathrooms.', 'Housekeeping is included.', 'Smoking is not permitted indoors.'],
    perfectFor: ['Couples', 'Remote Workers', 'Solo Travellers', 'Long Weekends'],
    faqs: [['Is this room different from the Balcony King Room?', 'Yes. King Rooms offer the same king-size bed and core amenities but do not include a private balcony.'], ['Which villas have King Rooms?', 'King Rooms are available in The Azure Villa.'], ['Is hot water available?', 'Yes. All King Rooms provide hot water.']],
  },
  'queen-room': {
    name: 'Queen Room',
    headline: 'Comfortable, cosy and thoughtfully designed for a peaceful stay.',
    intro: "Perfect for couples or solo travellers, our Queen Rooms combine comfort, privacy and everything you need for a relaxing stay just a short walk from Varkala's South Cliff.",
    availableIn: ['The Azure Villa', 'The Nook Villa', 'The Verdant Villa'],
    quickFacts: [['fa-user', 'Up to 2 Guests'], ['fa-bed', 'Queen Bed'], ['fa-bath', 'Attached Bathroom'], ['fa-snowflake-o', 'Air Conditioning'], ['fa-wifi', 'Complimentary Wi-Fi'], ['fa-fire', 'Hot Water']],
    about: 'Our Queen Rooms are bright, welcoming and thoughtfully furnished, offering everything needed for a restful stay after a day exploring Varkala.',
    amenities: { Bathroom: ['Attached Bathroom', 'Hot Water', 'Fresh Towels', 'Soap'], Bedroom: ['Queen Bed', 'Wardrobe', 'Clothes Hangers', 'Bedside Table', 'Mirror'], Comfort: ['Air Conditioning', 'Complimentary Wi-Fi', 'Inverter Backup', 'Garden Access'] },
    goodToKnow: ['Queen Rooms are available across the villas.', 'Layouts and decor vary slightly between rooms.', 'Room allocation is based on availability.', 'Every room includes an attached private bathroom.', 'Housekeeping is included.'],
    perfectFor: ['Couples', 'Solo Travellers', 'Remote Workers', 'Weekend Escapes'],
    faqs: [['Are Queen Rooms available in every villa?', 'Yes. Queen Rooms are available across Laya Balita villas.'], ['How many guests can stay?', 'Each Queen Room comfortably accommodates up to two guests.'], ['Do all Queen Rooms have air conditioning?', 'Yes. Every Queen Room is air-conditioned.']],
  },
  'balcony-twin-room': {
    name: 'Balcony Twin Room',
    headline: 'Two beds, your own balcony, and a little extra room to breathe.',
    intro: 'Designed for friends, siblings, colleagues or travel companions who prefer separate beds without giving up the comfort of a private balcony.',
    availableIn: ['The Nook Villa'],
    quickFacts: [['fa-user', 'Up to 2 Guests'], ['fa-bed', 'Two Single Beds'], ['fa-home', 'Private Balcony'], ['fa-snowflake-o', 'Air Conditioning'], ['fa-bath', 'Attached Bathroom'], ['fa-wifi', 'Complimentary Wi-Fi']],
    about: 'The Balcony Twin Room combines the practicality of two separate beds with the added comfort of a private balcony. It is a unique room category at Laya Balita.',
    amenities: { Bathroom: ['Attached Bathroom', 'Hot Water', 'Fresh Towels', 'Toiletries'], Bedroom: ['Two Single Beds', 'Wardrobe', 'Clothes Hangers', 'Mirror', 'Bedside Table'], Comfort: ['Air Conditioning', 'Private Balcony', 'Complimentary Wi-Fi', 'Inverter Backup', 'Garden Access'] },
    goodToKnow: ['Located in The Nook Villa.', 'Accommodates up to 2 guests.', 'Private balcony with outdoor space.', 'Daily housekeeping included.', 'Room allocation is based on availability.'],
    perfectFor: ['Friends', 'Siblings', 'Colleagues', 'Leisure Travellers'],
    faqs: [['How many Balcony Twin Rooms are available?', 'There is one Balcony Twin Room at Laya Balita, located in The Nook Villa.'], ['Does the room have a private balcony?', 'Yes. The room includes its own private balcony.'], ['Can the twin beds be joined together?', 'Yes, you can request this during booking.']],
  },
  'twin-room': {
    name: 'Twin Room',
    headline: 'Comfortable, flexible and ideal for travelling together.',
    intro: 'Designed with two separate single beds, our Twin Rooms are perfect for friends, siblings, colleagues or guests who prefer individual sleeping spaces.',
    availableIn: ['The Verdant Villa'],
    quickFacts: [['fa-user', 'Up to 2 Guests'], ['fa-bed', 'Two Single Beds'], ['fa-bath', 'Attached Bathroom'], ['fa-snowflake-o', 'Air Conditioning'], ['fa-wifi', 'Complimentary Wi-Fi'], ['fa-fire', 'Hot Water']],
    about: 'Our Twin Rooms offer the peaceful atmosphere and modern comforts found throughout Laya Balita, with the added convenience of two separate beds.',
    amenities: { Bathroom: ['Attached Bathroom', 'Hot Water', 'Fresh Towels', 'Soap', 'Toilet Paper'], Bedroom: ['Two Single Beds', 'Wardrobe', 'Clothes Hangers', 'Bedside Table', 'Mirror'], Comfort: ['Air Conditioning', 'Complimentary Wi-Fi', 'Inverter Backup', 'Garden Access'] },
    goodToKnow: ['Located in The Verdant Villa.', 'Best suited for two guests.', 'Room allocation depends on availability.', 'Every Twin Room includes an attached private bathroom.', 'Daily housekeeping is included.'],
    perfectFor: ['Friends', 'Siblings', 'Colleagues', 'Travel Partners'],
    faqs: [['Where are the Twin Rooms located?', 'Twin Rooms are located in The Verdant Villa.'], ['Can the beds be joined together?', 'Yes, you can request this.'], ['Do Twin Rooms have air conditioning?', 'Yes. Twin Rooms are air-conditioned.']],
  },
  'economy-queen-room': {
    name: 'Economy Queen Room',
    headline: 'Comfortable, simple and thoughtfully designed for a relaxed stay.',
    intro: 'Enjoy a comfortable queen-size bed, attached private bathroom and all the essentials for a peaceful stay, ideal for guests who appreciate simplicity and value.',
    availableIn: ['The Verdant Villa'],
    quickFacts: [['fa-user', 'Up to 2 Guests'], ['fa-bed', 'Queen Bed'], ['fa-leaf', 'Ceiling Fan'], ['fa-bath', 'Attached Bathroom'], ['fa-wifi', 'Complimentary Wi-Fi'], ['fa-bolt', 'Inverter Backup']],
    about: 'The Economy Queen Room is designed for travellers who prefer a simple, comfortable place to unwind after a day exploring Varkala. It offers essential comfort with natural airflow.',
    amenities: { Bathroom: ['Attached Bathroom', 'Towels', 'Toiletries'], Bedroom: ['Queen Bed', 'Ceiling Fan', 'Wardrobe', 'Mirror'], Comfort: ['Complimentary Wi-Fi', 'Garden Access', 'Inverter Backup', 'Daily Housekeeping'] },
    goodToKnow: ['Located in The Verdant Villa.', 'Accommodates up to 2 guests.', 'Ceiling fan provided.', 'Housekeeping included.', 'Room allocation based on availability.'],
    perfectFor: ['Naturally Ventilated Spaces', 'Backpackers', 'Long-Stay Travellers', 'Couples'],
    faqs: [['Does this room include air conditioning?', 'No. The Economy Queen Room is equipped with a ceiling fan and natural ventilation.'], ['How many Economy Queen Rooms are available?', 'There is one Economy Queen Room at Laya Balita.'], ['Is hot water available?', 'Yes, hot water is available.']],
  },
  'economy-twin-room': {
    name: 'Economy Twin Room',
    headline: 'A practical and comfortable stay for two.',
    intro: "Designed for friends, siblings, and travel companions, our Economy Twin Rooms offer two separate beds, a private bathroom, and all the essentials for a relaxed stay near Varkala's South Cliff.",
    availableIn: ['The Nook Villa', 'The Verdant Villa'],
    quickFacts: [['fa-users', 'Up to 3 Guests'], ['fa-bed', 'Two Single Beds'], ['fa-leaf', 'Ceiling Fan'], ['fa-bath', 'Attached Bathroom'], ['fa-wifi', 'Complimentary Wi-Fi'], ['fa-bolt', 'Inverter Backup']],
    about: 'Our Economy Twin Rooms are a practical choice for guests who prefer separate beds and a naturally ventilated room. Clean, comfortable, and thoughtfully maintained, they suit budget-conscious travellers exploring Varkala.',
    amenities: { Bathroom: ['Attached Bathroom', 'Fresh Towels', 'Toiletries'], Bedroom: ['Two Single Beds', 'Ceiling Fan', 'Wardrobe', 'Mirror'], Comfort: ['Complimentary Wi-Fi', 'Inverter Backup', 'Garden Access', 'Housekeeping', 'Reception Assistance'] },
    goodToKnow: ['Located in The Nook Villa and The Verdant Villa.', 'Accommodates up to 3 guests.', 'Equipped with a ceiling fan for natural comfort.', 'Daily housekeeping is included.', 'Hot water is available in selected rooms within this category.'],
    perfectFor: ['Friends', 'Siblings', 'Backpackers', 'Naturally Ventilated Spaces'],
    faqs: [['Do all Economy Twin Rooms have hot water?', "Not all of them. If this is important, let us know when booking and we'll do our best to accommodate your request."], ['Do Economy Twin Rooms have air conditioning?', 'No. These rooms are equipped with ceiling fans and natural ventilation.'], ['How many Economy Twin Rooms are available?', 'There are three Economy Twin Rooms at Laya Balita.']],
  },
};

export const roomDetailList = Object.entries(roomDetails).map(([slug, detail]) => {
  const room = rooms.find((item) => item.name === detail.name);
  return { slug, ...detail, room };
});

export function getRoomDetail(slug) {
  return roomDetailList.find((room) => room.slug === slug);
}

export const roomSlugsByName = Object.fromEntries(roomDetailList.map((room) => [room.name, room.slug]));
export { baseIncluded, baseRules, locationHighlights };
