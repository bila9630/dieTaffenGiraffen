export interface Destination {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export const AUSTRIAN_DESTINATIONS: Record<string, Destination> = {
  'vienna': { name: 'Vienna', coordinates: [16.3738, 48.2082] },
  'wien': { name: 'Vienna', coordinates: [16.3738, 48.2082] },
  'salzburg': { name: 'Salzburg', coordinates: [13.0550, 47.8095] },
  'innsbruck': { name: 'Innsbruck', coordinates: [11.3933, 47.2692] },
  'graz': { name: 'Graz', coordinates: [15.4395, 47.0707] },
  'hallstatt': { name: 'Hallstatt', coordinates: [13.6494, 47.5622] },
  'linz': { name: 'Linz', coordinates: [14.2858, 48.3069] },
  'bregenz': { name: 'Bregenz', coordinates: [9.7477, 47.5003] },
  'klagenfurt': { name: 'Klagenfurt', coordinates: [14.3055, 46.6244] },
  'zell am see': { name: 'Zell am See', coordinates: [12.7976, 47.3254] },
  'st. anton': { name: 'St. Anton', coordinates: [10.2640, 47.1272] },
  'st anton': { name: 'St. Anton', coordinates: [10.2640, 47.1272] },
  'bad gastein': { name: 'Bad Gastein', coordinates: [13.1344, 47.1156] },
  'eisenstadt': { name: 'Eisenstadt', coordinates: [16.5200, 47.8450] },
  'wachau valley': { name: 'Wachau Valley', coordinates: [15.4167, 48.3333] },
  'wachau': { name: 'Wachau Valley', coordinates: [15.4167, 48.3333] },
  'grossglockner': { name: 'Grossglockner', coordinates: [12.6940, 47.0742] },
  'grossglockner high alpine road': { name: 'Grossglockner', coordinates: [12.6940, 47.0742] },
  'melk': { name: 'Melk', coordinates: [15.3294, 48.2275] },
  'durnstein': { name: 'Dürnstein', coordinates: [15.5167, 48.3939] },
  'dürnstein': { name: 'Dürnstein', coordinates: [15.5167, 48.3939] },
  'st. wolfgang': { name: 'St. Wolfgang', coordinates: [13.4442, 47.7380] },
  'st wolfgang': { name: 'St. Wolfgang', coordinates: [13.4442, 47.7380] },
  'seefeld': { name: 'Seefeld', coordinates: [11.1878, 47.3294] },
  'kitzbühel': { name: 'Kitzbühel', coordinates: [12.3914, 47.4467] },
  'kitzbuhel': { name: 'Kitzbühel', coordinates: [12.3914, 47.4467] },
  'mayrhofen': { name: 'Mayrhofen', coordinates: [11.8642, 47.1664] },
  'sölden': { name: 'Sölden', coordinates: [11.0039, 46.9692] },
  'solden': { name: 'Sölden', coordinates: [11.0039, 46.9692] },
};

export function extractDestinationsFromText(text: string): Destination[] {
  const lowerText = text.toLowerCase();
  const found: Destination[] = [];
  const foundNames = new Set<string>();

  Object.entries(AUSTRIAN_DESTINATIONS).forEach(([key, destination]) => {
    if (lowerText.includes(key) && !foundNames.has(destination.name)) {
      found.push(destination);
      foundNames.add(destination.name);
    }
  });

  return found;
}
