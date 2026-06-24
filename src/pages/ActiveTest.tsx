import { useSearchParams } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import { useTestFlow } from '../hooks/useTestFlow';
import type { TestMode, EarSide } from '../types';
import { useState } from 'react';

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

export default function ActiveTest() {
  const [searchParams] = useSearchParams();
  const { go } = useAppNavigation();
  const { goHomeWithConfirm } = useAppNavigation();

  const isCalibration = searchParams.get('calibration') === '1';
  const mode = (searchParams.get('mode') || 'reproduktor') as TestMode;
  const side = (searchParams.get('side') as EarSide) || null;
  const lang = (searchParams.get('lang') || 'sk') as 'sk' | 'rom';
  const [clickedChoice, setClickedChoice] = useState<string | null>(null);

  const {
    currentRound,
    isPlaying,
    startTest,
    handleChoice,
  } = useTestFlow(mode, side, lang, () => {
    // Navigate to Finish page when test ends
    go('/finish', {
      mode,
      side,
      lang,
      calibration: isCalibration ? '1' : undefined
    });
  });

  const words = Object.keys(soundFiles[lang]);
  const progress = ((currentRound + (isPlaying ? 1 : 0)) / 10) * 100;

  return (
    <div>
      <header><h1>{isCalibration ? "Kalibračný test" : "Aplikácia pre rečovú audiometriu"}</h1></header>

      <p className='action-message'>Nápoveda: Stlačte tlačidlo pre spustenie testu a kliknutím vyberte obrázok prislúchajúci ku prehranému zvuku.</p>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-label">
          Kolo <span className="">{currentRound + 1}</span> z 10
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Start Button */}
      {!isPlaying && currentRound === 0 && (
        <button
          onClick={startTest}
          className="btn-primary"
        >
          <span>Spustiť test</span>
        </button>
      )}

      {/* Pictures Grid */}
      <div className="choices">
        {words.map((word) => (
          <div
            key={word}
            id={word}
            onClick={() => {
              setClickedChoice(word);

              setTimeout(() => {
                setClickedChoice(null);
              }, 750);

              handleChoice(word);
            }}
            className={`choice ${clickedChoice === word ? "clicked" : ""}`}
          >
            <img
              src={`/assets/${lang}/images/${word}.jpg`}
              alt={word}
              className=""
            />
          </div>
        ))}
      </div>

      <div className="outer">
        <button
          onClick={goHomeWithConfirm}
          className="btn-primary"
        >
          Ukončiť test a vrátiť sa domov
        </button>
      </div>
    </div>
  );
}