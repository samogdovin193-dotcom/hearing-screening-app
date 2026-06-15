import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import { useCalibration } from '../hooks/useCalibration';
import type { TestMode, EarSide } from '../types';

export default function Manual() {
  const [searchParams] = useSearchParams();
  const { go } = useAppNavigation();
  const navigate = useNavigate();

  const mode = (searchParams.get('mode') || 'reproduktor') as TestMode;
  const side = (searchParams.get('side') as EarSide) || null;
  const lang = new URLSearchParams(window.location.search).get("lang") || "sk";

  const { records, loadRecords } = useCalibration();
  const [canSkipCalibration, setCanSkipCalibration] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load calibration records for current mode
  useEffect(() => {
    loadRecords(
      lang as 'sk' | 'rom',
      mode,
      side
    );
  }, [lang, mode, side, loadRecords]);

  // Enable "Skip" only if there are at least 2 calibrations
  useEffect(() => {
    setCanSkipCalibration(records.length >= 2);
  }, [records]);

  let title = "Úvodná inštruktáž (Reproduktor)";
  if (mode === 'sluchadla') {
    title = side === 'lave' 
      ? "Úvodná inštruktáž (Ľavé ucho)" 
      : "Úvodná inštruktáž (Pravé ucho)";
  }

  const goToCalibration = () => {
    go('/calibration', {
      lang,
      mode,
      side
    });
  };

  const skipCalibration = () => {
    if (!canSkipCalibration) return;

    go('/start-game', {
      lang,
      mode,
      side
    });
  };

  // BACK BUTTON
  const goBack = () => {
    if (mode === 'sluchadla') {
      go('/select-ear');
      return;
    }

    go('/select');
  };

  const toggleInstructions = () => {
    // CASE 1: start playing
    if (!isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio("/assets/sk/audio/ElevenLabs_manual_speech.mp3");
      audioRef.current = audio;

      audio.play().catch((err) => {
        console.warn("Audio play failed:", err);
        setIsPlaying(false);
      });

      setIsPlaying(true);

      audio.addEventListener(
        "ended",
        () => {
          setIsPlaying(false);
          audioRef.current = null;
        },
        { once: true }
      );

      return;
    }

    // CASE 2: stop playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsPlaying(false);
  };

  return (
    <div className="">
      <div className="">
        <header className="">
          <h1 className="">{title}</h1>
        </header>

        <div className="">
          <p className="">
            Pred samotným testovaním sluchu je nevyhnutné vykonať <strong>kalibráciu,</strong><br />
            v rámci ktorej systém nastaví referenčný prah rozpoznávania reči.<br />
            Pred pokračovaním sa uistite, že spĺňate nasledovné požiadavky:
          </p>

          <ul className="">
            <li><strong>Zariadenie</strong> s reproduktorom alebo slúchadlami</li>
            <li><strong>Tichá miestnosť</strong> bez rušivých zvukov</li>
            <li><strong>Minimálne dve osoby</strong> bez poruchy sluchu na kalibráciu</li>
          </ul>

          <button
            onClick={toggleInstructions}
            className=""
          >
            {isPlaying ? "⏹ Zastaviť prehrávanie" : "▶ Prehrať inštrukcie"}
          </button>
        </div>

        <div className="">
          <button
            onClick={goToCalibration}
            className=""
          >
            Kalibrácia
          </button><br />

          <button
            onClick={skipCalibration}
            disabled={!canSkipCalibration}
            className={`big-button text-xl py-8 ${
              canSkipCalibration 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canSkipCalibration 
              ? "Preskočiť kalibráciu a spustiť test" 
              : "Preskočiť kalibráciu (potrebujete aspoň 2 kalibrácie)"}
          </button><br />
        </div>

        {/* Navigation */}
        <div className="">
          <button onClick={goBack} className="">
            <img src="/assets/sk/images/back.png" alt="Späť" className="" />
          </button>

          <button onClick={() => navigate(`/?lang=${lang}`)} className="">
            <img src="/assets/sk/images/home.png" alt="Domov" className="" />
          </button>
        </div>
      </div>
    </div>
  );
}