import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import { useCalibration } from '../hooks/useCalibration';
import type { TestMode, EarSide } from '../types';

export default function Calibration() {
  const [searchParams] = useSearchParams();
  const { goHomeWithConfirm } = useAppNavigation();
  const { go } = useAppNavigation();

  const mode = (searchParams.get('mode') || 'reproduktor') as TestMode;
  const side = (searchParams.get('side') as EarSide) || null;
  const lang = (searchParams.get('lang') || 'sk') as 'sk' | 'rom';

  const { records, loading, loadRecords, clearCategory } = useCalibration();

  const [modeTitle, setModeTitle] = useState('');

  // ======================
  // LOAD DATA
  // ======================
  useEffect(() => {
    loadRecords(lang, mode, side);

    const title =
      mode === 'sluchadla'
        ? side === 'lave'
          ? 'Ľavé ucho'
          : 'Pravé ucho'
        : 'Reproduktor';

    setModeTitle(title);
  }, [lang, mode, side, loadRecords]);

  // ======================
  // AUDIO STATE
  // ======================
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isInstructionsPlaying, setIsInstructionsPlaying] = useState(false);
  const [isUkonceniePlaying, setIsUkonceniePlaying] = useState(false);
  const [isTonePlaying, setIsTonePlaying] = useState(false);

  // stop everything helper
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsInstructionsPlaying(false);
    setIsUkonceniePlaying(false);
    setIsTonePlaying(false);
  };

  // ======================
  // INSTRUCTIONS
  // ======================
  const toggleInstructions = () => {
    const src = '/assets/sk/audio/ElevenLabs_kalibracia_instrukcie.wav';

    if (isInstructionsPlaying) {
      stopAudio();
      return;
    }

    stopAudio();

    const audio = new Audio(src);
    audioRef.current = audio;

    setIsInstructionsPlaying(true);

    audio.play().catch(console.warn);

    audio.onended = () => {
      stopAudio();
    };
  };

  // ======================
  // UKONCENIE
  // ======================
  const toggleUkoncenie = () => {
    const src = '/assets/sk/audio/ElevenLabs_kalibracia_ukoncenie.mp3';

    if (isUkonceniePlaying) {
      stopAudio();
      return;
    }

    stopAudio();

    const audio = new Audio(src);
    audioRef.current = audio;

    setIsUkonceniePlaying(true);

    audio.play().catch(console.warn);

    audio.onended = () => {
      stopAudio();
    };
  };

  // ======================
  // CONSTANT TONE (LOOP)
  // ======================
  const toggleTone = () => {
    const src = '/assets/sk/audio/1000Hz.wav';

    if (isTonePlaying) {
      stopAudio();
      return;
    }

    stopAudio();

    const audio = new Audio(src);
    audio.loop = true;

    audioRef.current = audio;

    setIsTonePlaying(true);

    audio.play().catch(console.warn);
  };

  // ======================
  // NAVIGATION
  // ======================
  const startCalibrationTest = () => {
    go("/test", {
      calibration: "1",
      mode,
      side,
      lang
    });
  };

  const showRecords = () => {
    if (records.length === 0) {
      alert(`Kalibrácia pre ${modeTitle}:\n\nŽiadne záznamy.`);
      return;
    }

    let text = `Kalibrácia pre ${modeTitle}:\n\n`;

    records.forEach((r) => {
      const date = new Date(r.timestamp).toLocaleString('sk-SK');
      text += `úroveň ${r.level} → ${date}\n`;
    });

    alert(text);
  };

  // ======================
  // DELETE CATEGORY SAFE
  // ======================
  const handleClear = async () => {
    await clearCategory(lang, mode, side);
    await loadRecords(lang, mode, side);
  };

  return (
    <div>
      <header><h1>Kalibrácia — {modeTitle}</h1></header>

      <div className='glass-container'>
        {/* INSTRUCTIONS */}
        <p className='instructions-text'><strong>Inštrukcie pre kalibráciu:</strong></p>

        <ul className='instructions-list'>
          <li>
              <strong>Kalibráciu vykonajte v tichej miestnosti</strong>, bez rušivých zvukov. 
              Zariadenie (napr. tablet) umiestnite tak, ako budete následne robiť meranie 
              s testovanou osobou. Zabezpečte, aby bolo zariadenie vždy v rovnakej 
              vzdialenosti a sklone ku kalibračnej/testovanej osobe.
          </li>

          <li>
              <strong>Nastavte hlasitosť vášho zariadenia na predposlednú najvyššiu úroveň hlasitosti</strong>, 
              alebo na najvyššiu úroveň hlasitosti, ktorá je ešte pre kalibračnú osobu znesiteľná. 
              Pre tento krok využite tlačidlo "Play", ktoré zabezpečí prehrávanie konštantného tónu. 
              Počas prehrávania tónu nastavte hlasitosť zariadenia.
              <strong> Počas kalibrácie a ani potom, pri testovaní počutia nemeňte nastavenú hlasitosť!</strong>
          </li>

          <li>
              Realizujte kalibračné nastavenie s prvou "kalibračnou osobou". Kalibračná osoba 
              musí byť osoba bez detegovanej poruchy sluchu, ideálne v mladom až strednom veku.
              Rovnako vykonajte kalibračné nastavenie s druhou "kalibračnou osobou".
          </li>

          <li>
              Následne môžete pristúpiť k testovaniu osôb pomocou nakalibrovaného systému 
              (zariadenia a aplikácie).
          </li>
        </ul>

        {/* FIRST BUTTON */}
        <button
          onClick={toggleInstructions}
          className={`calibration-btn btn-primary ${isInstructionsPlaying ? "stop" : ""}`}
        >
          <span className="icon">
            {isInstructionsPlaying ? "⏹" : "▶"}
          </span>

          <span className="btn-text">
            {isInstructionsPlaying
              ? "Zastaviť prehrávanie"
              : "Prehrať inštrukcie"}
          </span>
        </button>
      </div>

      {/* END CONDITIONS */}
      <div>
        <div className="glass-container">
          <p className="instructions-text"><strong>Kalibračný test sa ukončí:</strong></p>

          <ul className='instructions-list'>
            <li>
                ak prejde cez všetkých 10 kôl
            </li>
            <li>
                po 3 po sebe idúcich nesprávnych odpovediach
            </li>
            <li>
                ak vyprší čas 15s po prehraní nahrávky a neklikne sa na žiaden obrázok
            </li>
          </ul>

          {/* SECOND BUTTON */}
          <button
            onClick={toggleUkoncenie}
            className={`calibration-btn btn-primary ${isUkonceniePlaying ? "stop" : ""}`}
          >
            <span className="icon">
              {isUkonceniePlaying ? "⏹" : "▶"}
            </span>

            <span className="btn-text">
              {isUkonceniePlaying
                ? "Zastaviť prehrávanie"
                : "Prehrať podmienky ukončenia"}
            </span>
          </button>
        </div>

        {/* CONSTANT TONE BUTTON */}    
        <button
          onClick={toggleTone}
          className={`calibration-btn btn-primary ${isTonePlaying ? "stop" : ""}`}
        >
          <span className="icon">
            {isTonePlaying ? "⏹" : "▶"}
          </span>

          <span className="btn-text">
            {isTonePlaying
              ? "Zastaviť kalibračný tón"
              : "Spustiť kalibračný tón"}
          </span>
        </button>

        {/* ACTION BUTTONS */}
        <div className="buttons-container">
          <button onClick={startCalibrationTest} className='button big-btn green'>
            Spustiť kalibráciu
          </button>

          <button onClick={showRecords} disabled={loading} className='button big-btn green'>
            Zobraziť uložené kalibrácie ({records.length})
          </button>

          <button onClick={handleClear} className='button big-btn red'>
            Vymazať kalibrácie
          </button>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="outer">
        <button onClick={() => go("/manual")} className='menu-button'>
          <img src="/assets/sk/images/back.png" alt="Späť" className="menu-btn" />
        </button>
        <button onClick={goHomeWithConfirm} className="menu-button">
          <img src="/assets/sk/images/home.png" alt="Domov" className="menu-btn" />
        </button>
      </div>
    </div>
  );
}