/**
 * The 20 golden charts. These are synthetic birth records (no real people),
 * chosen to cover the situations where calculators most often go wrong:
 * daylight-saving changes, odd historical time zones, the southern
 * hemisphere, high latitude, a leap day, a year boundary and an exact equinox.
 *
 * Coordinates are given directly so these tests never depend on GeoNames.
 */

export interface GoldenFixture {
  id: string;
  label: string;
  /** Why this chart is in the set. */
  why: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM, local time
  city: string;
  latitude: number;
  longitude: number;
  timezone: string; // IANA
  firstName: string;
  middleName?: string;
  lastName: string;
}

export const FIXTURES: readonly GoldenFixture[] = [
  { id: 'la-1990', label: 'Los Angeles, 12 Nov 1990, 3:42 PM', why: 'Everyday case: US Pacific standard time, afternoon birth.', birthDate: '1990-11-12', birthTime: '15:42', city: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles', firstName: 'Alex', middleName: 'Jordan', lastName: 'Smith' },
  { id: 'nyc-1985', label: 'New York, 4 Jul 1985, 8:15 AM', why: 'Summer daylight saving time.', birthDate: '1985-07-04', birthTime: '08:15', city: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York', firstName: 'Maria', lastName: 'Garcia' },
  { id: 'london-newyear-1975', label: 'London, 1 Jan 1975, midnight', why: 'Year boundary and exactly 00:00.', birthDate: '1975-01-01', birthTime: '00:00', city: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', firstName: 'John', lastName: 'Henry' },
  { id: 'sydney-leapday-2000', label: 'Sydney, 29 Feb 2000, noon', why: 'Leap day, southern hemisphere, summer time there.', birthDate: '2000-02-29', birthTime: '12:00', city: 'Sydney', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', firstName: 'Zoe', middleName: 'Ray', lastName: 'Yoder' },
  { id: 'houston-1969', label: 'Houston, 20 Jul 1969, 3:17 PM', why: 'Historical date, US Central daylight time.', birthDate: '1969-07-20', birthTime: '15:17', city: 'Houston', latitude: 29.7604, longitude: -95.3698, timezone: 'America/Chicago', firstName: 'Omar', lastName: 'Okafor' },
  { id: 'kolkata-1960', label: 'Kolkata, 21 Mar 1960, 6:00 AM', why: 'Half-hour offset (UTC+5:30) near the equinox.', birthDate: '1960-03-21', birthTime: '06:00', city: 'Kolkata', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata', firstName: 'Priya', lastName: 'Nguyen' },
  { id: 'tokyo-nye-1988', label: 'Tokyo, 31 Dec 1988, 11:59 PM', why: 'One minute before midnight on New Year\'s Eve.', birthDate: '1988-12-31', birthTime: '23:59', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', firstName: 'Kyle', lastName: 'Kim-Lopez' },
  { id: 'reykjavik-1999', label: 'Reykjavik, 21 Jun 1999, 4:00 AM', why: 'High latitude (64°N) at the summer solstice.', birthDate: '1999-06-21', birthTime: '04:00', city: 'Reykjavik', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik', firstName: 'Nora', lastName: 'Schmidt' },
  { id: 'saopaulo-1979', label: 'Sao Paulo, 23 Sep 1979, noon', why: 'Southern hemisphere with historical Brazilian daylight saving.', birthDate: '1979-09-23', birthTime: '12:00', city: 'Sao Paulo', latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo', firstName: 'Lucia', lastName: 'Garcia' },
  { id: 'kathmandu-2012', label: 'Kathmandu, 21 Dec 2012, 11:11 AM', why: 'Unusual 45-minute offset (UTC+5:45).', birthDate: '2012-12-21', birthTime: '11:11', city: 'Kathmandu', latitude: 27.7172, longitude: 85.324, timezone: 'Asia/Kathmandu', firstName: 'Tyler', lastName: 'Lee' },
  { id: 'moscow-1950', label: 'Moscow, 5 May 1950, 5:30 PM', why: 'Historical Soviet time zone rules.', birthDate: '1950-05-05', birthTime: '17:30', city: 'Moscow', latitude: 55.7558, longitude: 37.6173, timezone: 'Europe/Moscow', firstName: 'Yvonne', lastName: 'Nguyen' },
  { id: 'berlin-dstgap-1993', label: 'Berlin, 28 Mar 1993, 2:30 AM', why: 'This local time did not exist (clocks jumped from 2:00 to 3:00).', birthDate: '1993-03-28', birthTime: '02:30', city: 'Berlin', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin', firstName: 'Lucia', lastName: 'Kim-Lopez' },
  { id: 'nyc-ambiguous-2005', label: 'New York, 30 Oct 2005, 1:30 AM', why: 'This local time happened twice (clocks fell back from 2:00 to 1:00).', birthDate: '2005-10-30', birthTime: '01:30', city: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York', firstName: 'Omar', lastName: 'Henry' },
  { id: 'paris-1920', label: 'Paris, 1 Jan 1920, 6:00 AM', why: 'Early twentieth century, long before modern time zones settled.', birthDate: '1920-01-01', birthTime: '06:00', city: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', firstName: 'Alex', middleName: 'Ray', lastName: 'Kim-Lopez' },
  { id: 'london-equinox-2024', label: 'London, 20 Mar 2024, 3:06 AM', why: 'The March equinox itself: the Sun is at 0° Aries.', birthDate: '2024-03-20', birthTime: '03:06', city: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', firstName: 'Nora', lastName: 'Okafor' },
  { id: 'auckland-1996', label: 'Auckland, 15 Aug 1996, noon', why: 'Far east of the date line, southern winter.', birthDate: '1996-08-15', birthTime: '12:00', city: 'Auckland', latitude: -36.8485, longitude: 174.7633, timezone: 'Pacific/Auckland', firstName: 'Kyle', lastName: 'Smith' },
  { id: 'anchorage-1980', label: 'Anchorage, 10 Feb 1980, noon', why: 'High latitude (61°N) and Alaska time.', birthDate: '1980-02-10', birthTime: '12:00', city: 'Anchorage', latitude: 61.2181, longitude: -149.9003, timezone: 'America/Anchorage', firstName: 'Priya', lastName: 'Henry' },
  { id: 'dubai-2023', label: 'Dubai, 9 Apr 2023, 6:45 PM', why: 'Recent date, UTC+4 with no daylight saving.', birthDate: '2023-04-09', birthTime: '18:45', city: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai', firstName: 'Maria', lastName: 'Lee' },
  { id: 'mexicocity-1966', label: 'Mexico City, 8 Nov 1966, 9:00 PM', why: 'Evening birth, Mexican time rules of the 1960s.', birthDate: '1966-11-08', birthTime: '21:00', city: 'Mexico City', latitude: 19.4326, longitude: -99.1332, timezone: 'America/Mexico_City', firstName: 'Zoe', lastName: 'Garcia' },
  { id: 'singapore-1975', label: 'Singapore, 15 Jun 1975, 9:30 AM', why: 'Singapore then ran on UTC+7:30 (until 1982), a rare offset.', birthDate: '1975-06-15', birthTime: '09:30', city: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore', firstName: 'Tyler', middleName: 'Jordan', lastName: 'Yoder' },
];
