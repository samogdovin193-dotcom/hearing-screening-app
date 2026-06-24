import { useState, useEffect, useRef, useCallback } from 'react';
import type { Answer, TestMode, EarSide } from '../types';
import { shuffleArray, dbToVolume } from '../lib/utils';
import { getSelectedTestWords, revokeTestWordObjectUrls, type TestWord } from '../lib/testWords';

const TOTAL_ROUNDS = 10;
const DBFS_LEVELS = [0, -10, -20, -30, -35, -35, -40, -40, -45, -45];

const getLevelsStorageKey = (language: Language) => {
  return language === "rom" ? "customDbfsLevelsROM" : "customDbfsLevels";
};

const getDbfsLevelForRound = (language: Language, roundIndex: number) => {
  const level = 10 - roundIndex;
  const fallbackDb = DBFS_LEVELS[roundIndex];

  const savedLevels = localStorage.getItem(getLevelsStorageKey(language));

  if (!savedLevels) {
    return fallbackDb;
  }

  try {
    const parsedLevels = JSON.parse(savedLevels);
    const dbValue = Number(parsedLevels[level]);

    if (Number.isNaN(dbValue) || dbValue < -60 || dbValue > 0) {
      return fallbackDb;
    }

    return dbValue;
  } catch (error) {
    console.error("Chyba pri načítaní hlasitosti:", error);
    return fallbackDb;
  }
};

const areWordOrdersEqual = (a: TestWord[], b: TestWord[]) => {
  if (a.length !== b.length) return false;

  return a.every((word, index) => word.id === b[index]?.id);
};

type Language = 'sk' | 'rom';

export function useTestFlow(
  mode: TestMode,
  side: EarSide,
  language: 'sk' | 'rom' = 'sk',
  onTestFinish?: (isCalibration: boolean) => void
) {
  const [state, setState] = useState({
    currentRound: 0,
    scoreCorrect: 0,
    scoreWrong: 0,
    wrongInRow: 0,
    answerHistory: [] as Answer[],
    isPlaying: false,
    randomSequence: [] as TestWord[],
    displayWords: [] as TestWord[],
  });

  // --- PURE JS-LIKE STATE ---
  const isPlayingRef = useRef(false);
  const currentRoundRef = useRef(0);
  const wrongInRowRef = useRef(0);

  const delayTimer = useRef<number | null>(null);
  const timeoutTimer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const historyRef = useRef<Answer[]>([]);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  // -------------------------
  // INIT (same as JS)
  // -------------------------
  useEffect(() => {
    let cancelled = false;
    let loadedWords: TestWord[] = [];

    const loadWords = async () => {
      const words = await getSelectedTestWords(language);

      if (cancelled) {
        revokeTestWordObjectUrls(words);
        return;
      }

      loadedWords = words;

      const audioSequence = shuffleArray(words);
      let displaySequence = shuffleArray(words);

      if (words.length > 1) {
        while (areWordOrdersEqual(audioSequence, displaySequence)) {
          displaySequence = shuffleArray(words);
        }
      }

      setState(prev => ({
        ...prev,
        randomSequence: audioSequence,
        displayWords: displaySequence,
      }));
    };

    loadWords();

    return () => {
      cancelled = true;
      revokeTestWordObjectUrls(loadedWords);
    };
  }, [language]);

  // -------------------------
  // AUDIO PATH (same logic)
  // -------------------------
  const getAudioPath = useCallback((word: TestWord): string => {
    if (mode === "sluchadla") {
      if (side === "lave") return word.audioUrls.left;
      if (side === "prave") return word.audioUrls.right;
    }

    return word.audioUrls.speaker;
  }, [mode, side]);

  // -------------------------
  // FINISH (JS equivalent saveAndFinish)
  // -------------------------
  const saveAndFinish = useCallback((finalState: any, reason?: string) => {
    isPlayingRef.current = false;

    if (delayTimer.current) clearTimeout(delayTimer.current);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    audioRef.current?.pause();

    // 🔥 DEBUG LOG — WHY TEST ENDED
    console.log("🛑 TEST ENDED", reason);

    localStorage.setItem("testResult", JSON.stringify({
      scoreCorrect: finalState.scoreCorrect,
      scoreWrong: finalState.scoreWrong,
      answerHistory: finalState.answerHistory,
      randomSequence: finalState.randomSequence,
      totalRounds: TOTAL_ROUNDS
    }));

    onTestFinish?.(false);
  }, [onTestFinish]);

  // -------------------------
  // PLAY CURRENT SOUND (JS identical)
  // -------------------------
  const playCurrentSound = useCallback(() => {
    if (!isPlayingRef.current) return;

    const word = state.randomSequence[currentRoundRef.current];

    if (!word) return;

    const audio = new Audio(getAudioPath(word));

    const dbLevel = getDbfsLevelForRound(language, currentRoundRef.current);
    audio.volume = dbToVolume(dbLevel);

    audioRef.current = audio;

    console.log(`Kolo ${currentRoundRef.current + 1}/${TOTAL_ROUNDS} | ` +`Úroveň: ${10 - currentRoundRef.current} | ` +`dBFS: ${dbLevel} | ` +`Slovo: ${word.displayName}`);
    
    audio.play().catch(console.error);

    // 15s timeout
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);

    timeoutTimer.current = window.setTimeout(() => {
      if (!isPlayingRef.current) return;

      const roundIndex = currentRoundRef.current;
      const word = state.randomSequence[roundIndex];

      if (!word) return;

      wrongInRowRef.current += 1;
      wrongRef.current += 1;

      historyRef.current.push({
        level: 10 - roundIndex,
        correct: word.displayName,
        user: "(nepočul)"
      });

      const updated = {
        currentRound: roundIndex,
        scoreCorrect: correctRef.current,
        scoreWrong: wrongRef.current,
        wrongInRow: wrongInRowRef.current,
        answerHistory: historyRef.current,
        isPlaying: false
      };

      saveAndFinish(updated, "timeout (15s without answer)");
    }, 15000);
  }, [getAudioPath, saveAndFinish, state]);

  // -------------------------
  // SCHEDULE NEXT SOUND (JS identical)
  // -------------------------
  const scheduleNextSound = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (delayTimer.current) clearTimeout(delayTimer.current);

    const delay = 1000 + Math.random() * 2000;

    delayTimer.current = window.setTimeout(() => {
      playCurrentSound();
    }, delay);
  }, [playCurrentSound]);

  // -------------------------
  // HANDLE CLICK
  // -------------------------
  const handleChoice = useCallback((userChoice: TestWord) => {
  if (!isPlayingRef.current) return;

  if (timeoutTimer.current) {
    clearTimeout(timeoutTimer.current);
    timeoutTimer.current = null;
  }

  const roundIndex = currentRoundRef.current;
  const correct = state.randomSequence[roundIndex];

  if (!correct) return;

  const isCorrect = userChoice.id === correct.id;

  if (isCorrect) correctRef.current++;
  else wrongRef.current++;

  const newWrongInRow = isCorrect ? 0 : wrongInRowRef.current + 1;
  wrongInRowRef.current = newWrongInRow;

  historyRef.current.push({
    level: 10 - roundIndex,
    correct: correct.displayName,
    user: userChoice.displayName
  });

  const nextRound = roundIndex + 1;
  currentRoundRef.current = nextRound;

  const shouldEnd =
    newWrongInRow >= 3 ||
    nextRound >= TOTAL_ROUNDS;

  const updated = {
    currentRound: nextRound,
    scoreCorrect: correctRef.current,
    scoreWrong: wrongRef.current,
    wrongInRow: newWrongInRow,
    answerHistory: historyRef.current,
    isPlaying: !shouldEnd,
    randomSequence: state.randomSequence,
    displayWords: state.displayWords,
  };

  setState(updated);

  if (shouldEnd) {
    console.log("🛑 END TEST →", newWrongInRow >= 3 ? "3 wrong" : "10 rounds");
    saveAndFinish(updated, newWrongInRow >= 3 ? "3 wrong in a row" : "all rounds done");
    return;
  }

  scheduleNextSound();
}, [scheduleNextSound, saveAndFinish, state.randomSequence]);

  // -------------------------
  // START TEST
  // -------------------------
  const startTest = useCallback(() => {
  if (isPlayingRef.current) return;

  isPlayingRef.current = true;
  currentRoundRef.current = 0;
  wrongInRowRef.current = 0;

  historyRef.current = [];
  correctRef.current = 0;
  wrongRef.current = 0;

  setState({
    currentRound: 0,
    scoreCorrect: 0,
    scoreWrong: 0,
    wrongInRow: 0,
    answerHistory: [],
    isPlaying: true,
    randomSequence: state.randomSequence,
    displayWords: state.displayWords,
  });

  scheduleNextSound();
}, [scheduleNextSound, state.randomSequence]);

  // -------------------------
  // CLEANUP
  // -------------------------
  useEffect(() => {
    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current);
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
      audioRef.current?.pause();
    };
  }, []);

  return {
    ...state,
    startTest,
    handleChoice,
  };
}