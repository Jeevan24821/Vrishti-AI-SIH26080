// VRISHTI AI Date & Location Formatting Utility

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a forecast date and period cleanly without duplication or ISO noise.
 * Example inputs:
 *   date: "01-06-2024", time: "2024-06-01T00:00:00+05:30"
 *   -> "01 Jun 2024 • 00:00 – 06:00 IST"
 */
export function formatDisplayDate(dateStr?: string | null, timeStr?: string | null): string {
  if (!dateStr) return 'Select Date';

  let day = '';
  let month = '';
  let year = '';

  // Parse DD-MM-YYYY
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      month = MONTHS[mIdx] || parts[1];
      day = parts[2];
    } else {
      // DD-MM-YYYY
      day = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      month = MONTHS[mIdx] || parts[1];
      year = parts[2];
    }
  } else {
    return dateStr;
  }

  const cleanDate = `${day} ${month} ${year}`.trim();

  if (!timeStr) {
    return cleanDate;
  }

  let cleanTime = '';
  if (timeStr.includes('T00:00') || timeStr.includes('00:00:00') || timeStr === '00:00') {
    cleanTime = '00:00 – 06:00 IST';
  } else if (timeStr.includes('T06:00') || timeStr.includes('06:00:00') || timeStr === '06:00') {
    cleanTime = '06:00 – 12:00 IST';
  } else if (timeStr.includes('T12:00') || timeStr.includes('12:00:00') || timeStr === '12:00') {
    cleanTime = '12:00 – 18:00 IST';
  } else if (timeStr.includes('T18:00') || timeStr.includes('18:00:00') || timeStr === '18:00') {
    cleanTime = '18:00 – 24:00 IST';
  } else if (timeStr.includes('T')) {
    const rawTime = timeStr.split('T')[1]?.split('+')[0]?.substring(0, 5) || '';
    cleanTime = rawTime ? `${rawTime} IST` : '';
  } else {
    cleanTime = `${timeStr.substring(0, 5)} IST`;
  }

  return cleanTime ? `${cleanDate} • ${cleanTime}` : cleanDate;
}

/**
 * Formats a location label cleanly without duplicated internal codes.
 * Example:
 *   taluka_name: "Panaji (Tiswadi)", district_name: "North Goa", state: "Goa"
 *   -> "Panaji, Goa" or "Bengaluru Urban, Karnataka"
 */
export function formatDisplayLocation(station?: {
  district_name?: string;
  taluka_name?: string;
  state?: string;
  location_id?: string | number;
} | null): string {
  if (!station) return 'Select District';

  const district = station.district_name || '';
  const taluka = station.taluka_name || '';
  const state = station.state || '';

  // Clean common noise
  const cleanTaluka = taluka.replace(/\s*\(.*?\)\s*/g, '').trim();
  const cleanDistrict = district.replace(/\s*\(.*?\)\s*/g, '').trim();

  let name = cleanTaluka;
  if (!name || cleanDistrict.toLowerCase().includes(name.toLowerCase())) {
    name = cleanDistrict;
  } else if (cleanTaluka && cleanDistrict && cleanTaluka !== cleanDistrict) {
    name = `${cleanTaluka}, ${cleanDistrict}`;
  }

  if (state && !name.toLowerCase().includes(state.toLowerCase())) {
    return `${name}, ${state}`;
  }
  return name || 'Select District';
}
