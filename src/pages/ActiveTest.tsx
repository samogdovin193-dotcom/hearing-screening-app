import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import { useTestFlow } from '../hooks/useTestFlow';
import type { TestMode, EarSide } from '../types';

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
  const navigate = useNavigate();
  const { go } = useAppNavigation();

  const isCalibration = searchParams.get('calibration') === '1';
  const mode = (searchParams.get('mode') || 'reproduktor') as TestMode;
  const side = (searchParams.get('side') as EarSide) || null;
  const lang = (searchParams.get('lang') || 'sk') as 'sk' | 'rom';

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
    <div className="">
      <div className="">
        <header className="">
          <h1 className="">
            {isCalibration ? "Kalibračný test" : "Aplikácia pre rečovú audiometriu"}
          </h1>
        </header>

        <p>Nápoveda: Stlačte tlačidlo pre spustenie testu a kliknutím vyberte obrázok prislúchajúci ku prehranému zvuku.</p>

        {/* Progress Bar */}
        <div className="">
          <div className="">
            Kolo <span className="">{currentRound + 1}</span> z 10
          </div>
          <div className="">
            <div
              className=""
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Start Button */}
        {!isPlaying && currentRound === 0 && (
          <div className="">
            <button
              onClick={startTest}
              className=""
            >
              Spustiť test
            </button>
          </div>
        )}

        {/* Pictures Grid */}
        <div className="">
          {words.map((word) => (
            <div
              key={word}
              id={word}
              onClick={() => handleChoice(word)}
              className=""
            >
              <img
                src={`/assets/${lang}/images/${word}.jpg`}
                alt={word}
                className=""
              />
            </div>
          ))}
        </div>

        {isPlaying && (
          <div className="">
            🎵 Počúvajte pozorne... Kliknite na správny obrázok
          </div>
        )}

        <div className="">
          <button
            onClick={() => navigate(`/?lang=${lang}`)}
            className=""
          >
            Ukončiť test a vrátiť sa domov
          </button>
        </div>
      </div>
    </div>
  );
}