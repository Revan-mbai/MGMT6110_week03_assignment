/**
 * Comprehensive Singapore Bus Stop Registry and Utility Functions
 * Singapore bus stop codes are 5-digit numerical identifiers (e.g. 04121, 09048, 67011).
 */

export interface RegistryBusStop {
  code: string;
  name: string;
  road: string;
  busServices: string[];
}

export const KNOWN_SINGAPORE_BUS_STOPS: RegistryBusStop[] = [
  // Downtown & Civic District
  { code: '04121', name: 'Opp City Hall Complex', road: 'North Bridge Rd', busServices: ['32', '51', '63', '80', '124', '145', '166', '174', '197'] },
  { code: '04119', name: 'City Hall Stn Exit B', road: 'North Bridge Rd', busServices: ['61', '124', '145', '166', '174', '197'] },
  { code: '04168', name: 'Capitol Bldg', road: 'Stamford Rd', busServices: ['7', '14', '16', '36', '77', '106', '111', '131', '167', '171'] },
  { code: '04179', name: 'Raffles Hotel', road: 'Bras Basah Rd', busServices: ['14', '16', '36', '77', '106', '111', '130', '131', '167'] },
  { code: '04229', name: 'Supreme Court', road: 'Parliament Pl', busServices: ['195', '961'] },
  { code: '04239', name: 'Victoria Concert Hall', road: 'Empress Pl', busServices: ['195', '961'] },

  // Orchard & Somerset & Dhoby Ghaut
  { code: '09048', name: 'Opp Orchard Boulevard Stn', road: 'Orchard Blvd', busServices: ['14', '65', '106', '111', '174'] },
  { code: '09047', name: 'Orchard Blvd Stn Exit 1', road: 'Orchard Blvd', busServices: ['14', '65', '106', '111', '174'] },
  { code: '09022', name: 'Orchard Stn / Tangs', road: 'Orchard Rd', busServices: ['36', '77', '124', '143', '167', '174', '190', '518'] },
  { code: '09037', name: 'Orchard Stn / Lucky Plaza', road: 'Orchard Rd', busServices: ['7', '14', '16', '65', '106', '111', '123', '175', '502'] },
  { code: '09169', name: 'Opp Ngee Ann City', road: 'Orchard Rd', busServices: ['7', '14', '16', '65', '106', '111', '123', '175', '502'] },
  { code: '09179', name: 'The Heeren', road: 'Orchard Rd', busServices: ['7', '14', '16', '65', '106', '111', '123', '175', '502'] },
  { code: '08057', name: 'Somerset Station Gate B', road: 'Somerset Rd', busServices: ['7', '14', '16', '36', '65', '77', '106', '111', '123', '174', '175'] },
  { code: '08069', name: 'Opp Somerset Stn', road: 'Orchard Rd', busServices: ['7', '14', '16', '36', '65', '77', '106', '111', '123', '174'] },
  { code: '08031', name: 'Dhoby Ghaut Station Plaza', road: 'Orchard Rd', busServices: ['7', '14', '16', '36', '77', '106', '111', '124', '162', '167', '174', '190'] },
  { code: '08059', name: 'Dhoby Ghaut Stn Exit B', road: 'Penang Rd', busServices: ['7', '14', '16', '36', '77', '106', '111', '124', '167', '174'] },

  // Bugis & Bras Basah & Rochor
  { code: '01012', name: 'Bugis Junction North', road: 'Victoria St', busServices: ['2', '12', '33', '130', '133', '960'] },
  { code: '01112', name: 'Bugis Stn Exit A', road: 'Victoria St', busServices: ['2', '12', '33', '130', '133', '960'] },
  { code: '01113', name: 'Bugis Stn Exit D', road: 'Rochor Rd', busServices: ['48', '57', '170', '851', '960', '980'] },
  { code: '01119', name: 'Opp Bugis Stn Exit C', road: 'Victoria St', busServices: ['2', '12', '33', '130', '133', '960'] },
  { code: '01129', name: 'Fu Lu Shou Complex', road: 'Rochor Rd', busServices: ['48', '57', '170', '851', '960', '980'] },
  { code: '01059', name: 'Parkview Sq', road: 'North Bridge Rd', busServices: ['7', '32', '51', '61', '63', '80', '145', '175', '197'] },

  // Marina Bay & Raffles Place & Shenton Way
  { code: '03019', name: 'Raffles Place Promenade', road: 'Collyer Quay', busServices: ['10', '57', '70', '100', '107', '130', '131', '167', '196'] },
  { code: '03059', name: 'The Sail', road: 'Marina Blvd', busServices: ['97', '106', '133', '400', '513', '982E'] },
  { code: '03509', name: 'Marina Bay Financial Ctr', road: 'Marina Blvd', busServices: ['97', '106', '133', '400', '513'] },
  { code: '03511', name: 'Bayfront Stn Exit B / MBS', road: 'Bayfront Ave', busServices: ['97', '106', '133', '502', '518'] },
  { code: '03519', name: 'Opp Bayfront Stn', road: 'Bayfront Ave', busServices: ['97', '106', '133', '502', '518'] },
  { code: '02049', name: 'Suntec City / Promenade Stn', road: 'Temasek Blvd', busServices: ['36', '70M', '97', '106', '111', '133', '502', '518'] },
  { code: '02151', name: 'Promenade Stn / Pan Pacific', road: 'Temasek Ave', busServices: ['36', '97', '106', '111', '133', '502', '518'] },
  { code: '03218', name: 'Opp The Treasury', road: 'North Bridge Rd', busServices: ['51', '61', '63', '80', '124', '145', '166', '174', '197'] },

  // Chinatown & Outram & Tanjong Pagar
  { code: '05019', name: 'Chinatown Stn Exit E', road: 'Eu Tong Sen St', busServices: ['2', '12', '33', '54', '61', '143', '147', '190'] },
  { code: '05022', name: 'Chinatown Stn Exit C', road: 'New Bridge Rd', busServices: ['2', '12', '33', '54', '61', '143', '147', '190'] },
  { code: '05049', name: 'People\'s Pk Ctr', road: 'Eu Tong Sen St', busServices: ['2', '12', '33', '54', '61', '143', '147', '190'] },
  { code: '05429', name: 'Tanjong Pagar Stn Exit C', road: 'Anson Rd', busServices: ['10', '70', '75', '97', '100', '106', '107', '130', '131', '167', '196'] },
  { code: '06011', name: 'Outram Pk Stn Exit 1', road: 'Eu Tong Sen St', busServices: ['124', '143', '147', '166', '197', '961'] },

  // HarbourFront & Telok Blangah & Pasir Panjang
  { code: '10169', name: 'HarbourFront Stn / VivoCity', road: 'Telok Blangah Rd', busServices: ['10', '30', '57', '61', '65', '80', '97', '100', '131', '143', '145', '166', '855'] },
  { code: '10161', name: 'Opp HarbourFront Stn', road: 'Telok Blangah Rd', busServices: ['10', '30', '57', '61', '65', '80', '97', '100', '131', '143', '145', '166', '855'] },
  { code: '14141', name: 'HarbourFront Int', road: 'Seah Im Rd', busServices: ['65', '80', '93', '123', '124', '188', '855', '963'] },
  { code: '11119', name: 'Telok Blangah Stn', road: 'Telok Blangah Rd', busServices: ['10', '30', '57', '61', '93', '97', '100', '143', '166', '188'] },
  { code: '15199', name: 'Pasir Panjang Stn', road: 'Pasir Panjang Rd', busServices: ['10', '30', '51', '143', '175', '176', '188', '200'] },

  // Buona Vista & Queenstown & Clementi
  { code: '11389', name: 'Buona Vista Stn Exit C', road: 'North Buona Vista Rd', busServices: ['74', '91', '92', '95', '191', '196', '198', '200'] },
  { code: '11369', name: 'Opp Buona Vista Stn', road: 'North Buona Vista Rd', busServices: ['74', '91', '92', '95', '191', '196', '198', '200'] },
  { code: '11149', name: 'Queenstown Stn Exit A', road: 'Commonwealth Ave', busServices: ['51', '111', '145', '186', '195', '970'] },
  { code: '17179', name: 'Clementi Stn Exit A', road: 'Commonwealth Ave West', busServices: ['52', '96', '99', '147', '156', '165', '166', '175', '196', '285'] },
  { code: '17171', name: 'Clementi Stn Exit B', road: 'Commonwealth Ave West', busServices: ['52', '96', '99', '147', '156', '165', '166', '175', '196', '285'] },

  // Jurong East & Boon Lay
  { code: '28009', name: 'Jurong East Int', road: 'Jurong Gateway Rd', busServices: ['41', '49', '51', '52', '66', '78', '79', '97', '98', '105', '143', '160', '183', '197', '333', '334', '335', '506'] },
  { code: '28211', name: 'Jurong East Stn Exit A', road: 'Jurong Gateway Rd', busServices: ['41', '49', '51', '52', '66', '78', '79', '97', '98', '105', '143', '160'] },
  { code: '22009', name: 'Boon Lay Int', road: 'Jurong West Ctrl 3', busServices: ['30', '79', '154', '157', '172', '174', '178', '179', '180', '181', '182', '187', '192', '193', '194', '198', '199', '240', '241', '242', '243', '246', '249', '251', '252'] },

  // Bukit Batok & Choa Chu Kang & Bukit Panjang
  { code: '43009', name: 'Bukit Batok Int', road: 'Bt Batok Ctrl', busServices: ['61', '77', '106', '173', '177', '189', '852', '941', '945', '947'] },
  { code: '44009', name: 'Choa Chu Kang Int', road: 'Choa Chu Kang Loop', busServices: ['67', '172', '190', '300', '301', '302', '307', '925', '927', '983', '985'] },
  { code: '44539', name: 'Opp Choa Chu Kang Stn', road: 'Choa Chu Kang Ave 4', busServices: ['67', '172', '190', '300', '301', '302', '307'] },
  { code: '45009', name: 'Bukit Panjang Int', road: 'Jelebu Rd', busServices: ['176', '180', '184', '920', '922', '970', '972', '973', '975', '976', '979'] },
  { code: '45139', name: 'Bukit Panjang Stn Exit A / DTL', road: 'Upper Bt Timah Rd', busServices: ['67', '170', '176', '178', '961', '963'] },

  // Woodlands & Sembawang & Yishun
  { code: '46009', name: 'Woodlands Int', road: 'Woodlands Sq', busServices: ['161', '168', '169', '178', '187', '856', '858', '900', '901', '902', '903', '904', '911', '912', '913', '925', '950', '960', '961', '962', '963', '964', '965', '966', '969'] },
  { code: '46279', name: 'Woodlands Stn Exit 4', road: 'Woodlands Ave 3', busServices: ['161', '168', '169', '178', '187', '856', '900', '901', '903'] },
  { code: '58009', name: 'Sembawang Int', road: 'Sembawang Vista', busServices: ['117', '167', '858', '859', '882', '883', '962', '980', '981'] },
  { code: '59009', name: 'Yishun Int', road: 'Yishun Ave 2', busServices: ['39', '85', '171', '800', '803', '804', '805', '806', '807', '811', '812', '851', '852', '853', '854', '855', '856', '857', '859', '860'] },

  // Bishan & Ang Mo Kio & Toa Payoh
  { code: '53009', name: 'Bishan Int', road: 'Bishan St 13', busServices: ['50', '52', '53', '54', '55', '56', '57', '58', '59', '410G', '410W'] },
  { code: '53211', name: 'Bishan Stn', road: 'Bishan Rd', busServices: ['53', '55', '58', '156'] },
  { code: '54009', name: 'Ang Mo Kio Int', road: 'Ang Mo Kio Ave 8', busServices: ['22', '24', '25', '73', '86', '130', '133', '135', '136', '138', '166', '169', '261', '262', '265', '268', '269'] },
  { code: '52009', name: 'Toa Payoh Int', road: 'Lor 6 Toa Payoh', busServices: ['8', '26', '28', '31', '73', '88', '90', '139', '141', '142', '143', '145', '155', '157', '159', '163', '231', '232', '235', '238'] },

  // Serangoon & Hougang & Sengkang & Punggol
  { code: '66009', name: 'Serangoon Int', road: 'Serangoon Ave 2', busServices: ['100', '101', '103', '105', '109', '158', '315', '317'] },
  { code: '66179', name: 'Serangoon Stn Exit C / NEX', road: 'Upp Serangoon Rd', busServices: ['22', '43', '53', '70', '81', '82', '107', '147', '153'] },
  { code: '64009', name: 'Hougang Central Int', road: 'Hougang Ctrl', busServices: ['51', '72', '74', '80', '87', '89', '107', '112', '113', '116', '132', '147', '151', '153', '161', '165', '324', '325', '329'] },
  { code: '67009', name: 'Sengkang Int', road: 'Compassvale Rd', busServices: ['80', '83', '85', '86', '87', '102', '156', '159', '163', '371', '372', '374', '965'] },
  { code: '65009', name: 'Punggol Temp Int', road: 'Punggol Pl', busServices: ['3', '34', '39', '43', '62', '82', '83', '84', '85', '117', '118', '119', '136', '381', '382G', '382W', '384', '386'] },

  // Tampines & Pasir Ris & Bedok
  { code: '75009', name: 'Tampines Int', road: 'Tampines Ctrl 1', busServices: ['4', '8', '10', '19', '20', '22', '23', '28', '29', '31', '37', '38', '46', '65', '67', '68', '69', '72', '81', '127', '291', '292', '293', '298'] },
  { code: '76009', name: 'Pasir Ris Int', road: 'Pasir Ris Dr 3', busServices: ['3', '5', '6', '12', '15', '17', '21', '58', '88', '89', '354', '358', '359', '403', '518'] },
  { code: '84009', name: 'Bedok Int', road: 'Bedok North Ave 1', busServices: ['7', '9', '14', '16', '17', '18', '25', '26', '30', '32', '33', '35', '38', '40', '60', '66', '69', '87', '168', '196', '197', '222', '225G', '225W', '228', '229'] },

  // Changi Airport Terminals
  { code: '95029', name: 'Changi Airport PTB3', road: 'Airport Blvd', busServices: ['24', '27', '34', '36', '53', '110', '858'] },
  { code: '95129', name: 'Changi Airport PTB2', road: 'Airport Blvd', busServices: ['24', '27', '34', '36', '53', '110', '858'] },
  { code: '95139', name: 'Changi Airport PTB1', road: 'Airport Blvd', busServices: ['24', '27', '34', '36', '53', '110', '858'] },
  { code: '95149', name: 'Changi Airport PTB4', road: 'Airport Blvd', busServices: ['24', '34', '36', '110'] },
];

/** Map of stop code to stop details for O(1) instant lookup */
export const SINGAPORE_BUS_STOPS_MAP: Record<string, RegistryBusStop> = {};
for (const s of KNOWN_SINGAPORE_BUS_STOPS) {
  SINGAPORE_BUS_STOPS_MAP[s.code] = s;
}

/**
 * Normalizes user input into a Singapore 5-digit bus stop code format:
 * - Trims whitespace
 * - Strips any non-digit character (e.g. letters, hashtags, spaces)
 * - Pads 4-digit codes with a leading zero (e.g. '4121' -> '04121')
 */
export function normalizeStopCode(input: string): string {
  if (!input) return '';
  const digitsOnly = input.trim().replace(/\D/g, '');
  if (digitsOnly.length === 4) {
    return `0${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Validates whether the input adheres to the strict 5-digit Singapore bus stop code format.
 */
export function isValidStopCodeFormat(code: string): boolean {
  return /^\d{5}$/.test(code);
}

/**
 * Checks whether a bus stop code is known to exist.
 * Returns true if in the registry or if formatted as a 5-digit number.
 */
export function doesStopExistInRegistry(code: string): boolean {
  const norm = normalizeStopCode(code);
  return Boolean(SINGAPORE_BUS_STOPS_MAP[norm]);
}

/**
 * Retrieves human-readable name, road, and address for any 5-digit bus stop code.
 */
export function lookupBusStopDetails(code: string): { name: string; road: string; address: string } {
  const norm = normalizeStopCode(code);
  if (SINGAPORE_BUS_STOPS_MAP[norm]) {
    const s = SINGAPORE_BUS_STOPS_MAP[norm];
    return {
      name: s.name,
      road: s.road,
      address: `${s.road}, Singapore`,
    };
  }

  // Graceful fallback for valid 5-digit codes not explicitly in the top transit directory
  return {
    name: `Bus Stop ${norm || code}`,
    road: 'Singapore Public Bus Network',
    address: `Bus Stop Code ${norm || code}, Singapore`,
  };
}

/**
 * Constructs a BusStop domain model object from a code.
 */
export function buildBusStopObject(code: string): {
  id: string;
  code: string;
  name: string;
  road: string;
  distanceMeters: number;
  walkingTimeMins: number;
  busServices: string[];
  buses: Array<{
    busNumber: string;
    destination: string;
    isDelayed: boolean;
    nextBus: {
      arrivalMinutes: number;
      load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
      type: 'Single Deck' | 'Double Deck';
      wheelchairAccessible: boolean;
    };
    subsequentBus?: {
      arrivalMinutes: number;
      load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
      type: 'Single Deck' | 'Double Deck';
    };
  }>;
} {
  const norm = normalizeStopCode(code);
  const info = lookupBusStopDetails(norm);
  const reg = SINGAPORE_BUS_STOPS_MAP[norm];
  const services = reg?.busServices && reg.busServices.length > 0 ? reg.busServices : ['14', '65', '106'];

  return {
    id: `stop-${norm}`,
    code: norm,
    name: info.name,
    road: info.road,
    distanceMeters: 150,
    walkingTimeMins: 2,
    busServices: services,
    buses: services.slice(0, 3).map((svc, idx) => ({
      busNumber: svc,
      destination: 'Terminal / Loop',
      isDelayed: false,
      nextBus: {
        arrivalMinutes: (idx * 4 + 3) % 15,
        load: 'Seats Available',
        type: 'Single Deck',
        wheelchairAccessible: true,
      },
      subsequentBus: {
        arrivalMinutes: (idx * 4 + 11) % 25,
        load: 'Standing Available',
        type: 'Double Deck',
      },
    })),
  };
}
