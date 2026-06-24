import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import { useCalibration } from '../hooks/useCalibration';
import type { TestMode, EarSide } from '../types';

export default function Manual() {
  const [searchParams] = useSearchParams();
  const { go } = useAppNavigation();
  const { goHomeWithConfirm } = useAppNavigation();

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
    <div>
      <header><h1>{title}</h1></header>

      <div className='intro-container glass-container'>
        <p className='intro-text'>
          Pred samotným testovaním sluchu je nevyhnutné vykonať <strong>"kalibráciu"</strong>,<br />
          v rámci ktorej systém nastaví referenčný prah rozpoznávania reči.<br />
          Pred pokračovaním sa uistite, že spĺňate nasledovné požiadavky:
        </p>

        <ul className='intro-list'>
          <li><strong>Zariadenie</strong> s reproduktorom alebo slúchadlami (napríklad počítač, tablet alebo mobil).</li>
          <li><strong>Tichá miestnosť</strong> bez rušivých zvukov.</li>
          <li><strong>Minimálne dve osoby</strong> bez diagnostikovanej poruchy sluchu, ktoré vykonajú kalibračné nastavenie.</li>
        </ul>

        <button
          onClick={toggleInstructions}
          className={`calibration-btn btn-primary ${isPlaying ? "stop" : ""}`}
        >
          <span className='icon'>
            {isPlaying ? "⏹" : "▶"}
          </span>

          <span className='btn-text'>
            {isPlaying ? "Zastaviť prehrávanie" : "Prehrať inštrukcie"}
          </span>
        </button>
      </div>

      <div className='buttons-container'>
        <button
          onClick={goToCalibration}
          className='button big-btn green'
        >
          Kalibrácia
        </button>

        <button
          onClick={skipCalibration}
          disabled={!canSkipCalibration}
          title={
            canSkipCalibration
              ? ""
              : "Potrebné aspoň 2 kalibrácie pre spustenie hry"
          }
          className={`button big-btn ${canSkipCalibration ? "green" : "disabled-btn"}`}
        >
          {canSkipCalibration
            ? "Preskočiť kalibráciu a spustiť hru"
            : "Preskočiť kalibráciu (potrebujete aspoň 2 kalibrácie)"}
        </button>
      </div>

      {/* Navigation */}
      <div className='outer'>
        <button onClick={goBack} className='menu-button'>
          <img src="/assets/sk/images/back.png" alt="Späť" className='menu-btn' />
        </button>

        <button onClick={goHomeWithConfirm} className='menu-button'>
          <img src="/assets/sk/images/home.png" alt="Domov" className='menu-btn' />
        </button>
      </div>
    </div>
  );
}