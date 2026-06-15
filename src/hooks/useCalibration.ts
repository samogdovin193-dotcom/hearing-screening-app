import { useState, useCallback } from 'react';
import type { TestMode, EarSide } from '../types';

import {
  addCalibrationRecord,
  getCalibrationByCategory,
  clearCalibrationByCategory,
  type CalibrationRecord
} from '../lib/db';

export function useCalibration() {
  const [records, setRecords] = useState<CalibrationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD (CATEGORY BASED)
  // =========================
  const loadRecords = useCallback(
    async (
      lang: 'sk' | 'rom',
      mode: TestMode,
      side: EarSide = null
    ) => {
      setLoading(true);
      try {
        const data = await getCalibrationByCategory(lang, mode, side);
        setRecords(data);
      } catch (error) {
        console.error("Failed to load calibrations:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================
  // ADD
  // =========================
  const addRecord = useCallback(
    async (
      level: number,
      lang: 'sk' | 'rom',
      mode: TestMode,
      side: EarSide = null
    ) => {
      await addCalibrationRecord(level, mode, side, lang);

      // refresh same category
      const data = await getCalibrationByCategory(lang, mode, side);
      setRecords(data);
    },
    []
  );

  // =========================
  // DELETE CATEGORY ONLY
  // =========================
  const clearCategory = useCallback(
    async (
      lang: 'sk' | 'rom',
      mode: TestMode,
      side: EarSide = null
    ) => {
      if (!confirm("Naozaj vymazať kalibrácie pre túto kategóriu?")) return;

      await clearCalibrationByCategory(lang, mode, side);
      setRecords([]);
    },
    []
  );

  return {
    records,
    loading,
    loadRecords,
    addRecord,
    clearCategory,
  };
}