import { useState, useEffect, useRef, useCallback } from 'react';
import type { Answer, TestMode, EarSide } from '../types';
import { shuffleArray, dbToVolume } from '../lib/utils';

const TOTAL_ROUNDS = 10;
const DBFS_LEVELS = [0, -10, -20, -30, -35, -35, -40, -40, -45, -45];

const soundFiles = {
  sk: {
    bicykel: "bicykel.wav",
    auto: "auto.wav",
    lietadlo: "lietadlo.wav",
    autobus: "autobus.wav",
    vtak: "vtak.wav",
    sova: "sova.wav",
    mys: "mys.wav",
    macka: "macka.wav",
    dzus: "dzus.wav",
    cokolada: "cokolada.wav",
  },

  rom: {
    babika: "R_babika.wav",
    chlieb: "R_chlieb.wav",
    hrad: "R_hrad.wav",
    jablko: "R_jablko.wav",
    macka: "R_macka.wav",
    miska: "R_miska.wav",
    noha: "R_noha.wav",
    okno: "R_okno.wav",
    stolik: "R_stolik.wav",
    zaba: "R_zaba.wav",
  }
} as const;

type Language = 'sk' | 'rom';
type WordKey<L extends Language> = keyof typeof soundFiles[L];

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
    randomSequence: [] as string[],
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
    const words = Object.keys(soundFiles[language]) as WordKey<typeof language>[];

    setState(prev => ({
      ...prev,
      randomSequence: shuffleArray(words)
    }));
  }, [language]);

  // -------------------------
  // AUDIO PATH (same logic)
  // -------------------------
  const getAudioPath = useCallback((word: string): string => {
    let folder = `/assets/${language}/audio/`;

    if (mode === "sluchadla") {
      if (side === "lave") folder = `/assets/${language}/audio_lave_ucho/`;
      if (side === "prave") folder = `/assets/${language}/audio_prave_ucho/`;
    }

    const file = soundFiles[language][word as WordKey<typeof language>];

    return `${folder}${file}`;
  }, [mode, side, language]);

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

    const audio = new Audio(getAudioPath(word));
    audio.volume = dbToVolume(DBFS_LEVELS[currentRoundRef.current]);

    audioRef.current = audio;

    console.log(`Kolo ${currentRoundRef.current + 1}/${TOTAL_ROUNDS} | ` +`Úroveň: ${10 - currentRoundRef.current} | ` +`Slovo: ${word}`);
    audio.play().catch(console.error);

    // 15s timeout
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);

    timeoutTimer.current = window.setTimeout(() => {
      if (!isPlayingRef.current) return;

      const roundIndex = currentRoundRef.current;
      const word = state.randomSequence[roundIndex];

      wrongInRowRef.current += 1;
      wrongRef.current += 1;

      historyRef.current.push({
        level: 10 - roundIndex,
        correct: word,
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
  const handleChoice = useCallback((userChoice: string) => {
  if (!isPlayingRef.current) return;

  if (timeoutTimer.current) {
    clearTimeout(timeoutTimer.current);
    timeoutTimer.current = null;
  }

  const roundIndex = currentRoundRef.current;
  const correct = state.randomSequence[roundIndex];
  const isCorrect = userChoice === correct;

  if (isCorrect) correctRef.current++;
  else wrongRef.current++;

  const newWrongInRow = isCorrect ? 0 : wrongInRowRef.current + 1;
  wrongInRowRef.current = newWrongInRow;

  historyRef.current.push({
      level: 10 - roundIndex,
      correct,
      user: userChoice
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
    randomSequence: state.randomSequence
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
    randomSequence: state.randomSequence
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