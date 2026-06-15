import Dexie, { type EntityTable } from 'dexie';

/**
 * 6-category system:
 * sk_reproduktor_none
 * sk_sluchadla_lave
 * sk_sluchadla_prave
 * rom_reproduktor_none
 * rom_sluchadla_lave
 * rom_sluchadla_prave
 */

export interface CalibrationRecord {
  id?: number;
  level: number;
  mode: 'reproduktor' | 'sluchadla';
  side: 'lave' | 'prave' | null;
  lang: 'sk' | 'rom';
  category: string; // 👈 PRIMARY KEY LOGIC
  timestamp: string;
}

const db = new Dexie('CalibrationDB') as Dexie & {
  calibration: EntityTable<CalibrationRecord, 'id'>;
};

/**
 * IMPORTANT:
 * category is now the MAIN INDEX for filtering
 */
db.version(3).stores({
  calibration: '++id, category, mode, side, lang, timestamp'
});

export default db;

/* ==================================================
   CATEGORY HELPERS
================================================== */

export function buildCategory(
  lang: 'sk' | 'rom',
  mode: 'reproduktor' | 'sluchadla',
  side: 'lave' | 'prave' | null
) {
  return `${lang}_${mode}_${side ?? 'none'}`;
}

/* ==================================================
   ADD
================================================== */

export async function addCalibrationRecord(
  level: number,
  mode: 'reproduktor' | 'sluchadla',
  side: 'lave' | 'prave' | null = null,
  lang: 'sk' | 'rom' = 'sk'
) {
  const category = buildCategory(lang, mode, side);

  await db.calibration.add({
    level,
    mode,
    side,
    lang,
    category,
    timestamp: new Date().toISOString()
  });
}

/* ==================================================
   GET BY CATEGORY (MAIN QUERY)
================================================== */

export async function getCalibrationByCategory(
  lang: 'sk' | 'rom',
  mode: 'reproduktor' | 'sluchadla',
  side: 'lave' | 'prave' | null = null
) {
  const category = buildCategory(lang, mode, side);

  return await db.calibration
    .where('category')
    .equals(category)
    .toArray();
}

/* ==================================================
   COUNT BY CATEGORY
================================================== */

export async function countCalibrationByCategory(
  lang: 'sk' | 'rom',
  mode: 'reproduktor' | 'sluchadla',
  side: 'lave' | 'prave' | null = null
) {
  const category = buildCategory(lang, mode, side);

  return await db.calibration
    .where('category')
    .equals(category)
    .count();
}

/* ==================================================
   DELETE BY CATEGORY
================================================== */

export async function clearCalibrationByCategory(
  lang: 'sk' | 'rom',
  mode: 'reproduktor' | 'sluchadla',
  side: 'lave' | 'prave' | null = null
) {
  const category = buildCategory(lang, mode, side);

  return await db.calibration
    .where('category')
    .equals(category)
    .delete();
}

/* ==================================================
   OPTIONAL: GET ALL
================================================== */

export async function getAllCalibrationRecords() {
  return await db.calibration.toArray();
}

/* ==================================================
   OPTIONAL: CLEAR ALL
================================================== */

export async function clearAllCalibrations() {
  return await db.calibration.clear();
}