import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import { addCalibrationRecord } from '../lib/db';
import type { TestMode, EarSide } from '../types';

export default function Finish() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { go } = useAppNavigation();
  const { goHomeWithConfirm } = useAppNavigation();


  const isCalibration = searchParams.get('calibration') === '1';
  const mode = (searchParams.get('mode') || 'reproduktor') as TestMode;
  const side = (searchParams.get('side') as EarSide) || null;
  const lang = (searchParams.get('lang') || 'sk') as 'sk' | 'rom';

  // -------------------------
  // LOAD TEST RESULT
  // -------------------------
  const testResult = JSON.parse(
    localStorage.getItem('testResult') || '{}'
  );

  const answerHistory = testResult.answerHistory || [];

  let lastCorrectLevel: number | null = null;

  for (const answer of answerHistory) {
    if (answer.correct === answer.user) {
      lastCorrectLevel = answer.level;
    }
  }

  // -------------------------
  // NORMAL TEST NAVIGATION
  // -------------------------
  const goToResults = () => {
    go('/results', {
      mode,
      side,
      lang
    });
  };

  // -------------------------
  // CALIBRATION SAVE
  // -------------------------
  const saveCalibrationAndGoBack = async () => {
    try {
      if (lastCorrectLevel !== null) {
        await addCalibrationRecord(
          lastCorrectLevel,
          mode,
          side,
          lang
        );

        alert(
          `Kalibrácia uložená!\n` +
          `Režim: ${mode}` +
          `${side ? ` (${side})` : ''}\n` +
          `Úroveň: ${lastCorrectLevel}`
        );
      }

      goBackToManual();
    } catch (err) {
      console.error(err);
      alert('Chyba pri ukladaní kalibrácie!');
    }
  };

  // -------------------------
  // BACK NAVIGATION
  // -------------------------
  const goBackToManual = () => {
  const params = new URLSearchParams();

  params.set('mode', mode);

  if (side) {
    params.set('side', side);
  }

  params.set('lang', lang);

  navigate(`/manual?${params.toString()}`);
};

  // ==================================================
  // CALIBRATION PAGE
  // ==================================================
  if (isCalibration) {
    return (
      <div>
      
      <header><h1>Gratulujem! Dostali ste sa na koniec testu.</h1></header>
      
        <div className="result-container">

          {lastCorrectLevel !== null ? (
            <>
              <p className="result-text">
                Posledná správna odpoveď:
              </p>

              <p className="result-success">
                úroveň {lastCorrectLevel}
              </p>

              <p className="result-text">
                <em>Toto bude uložené ako kalibračný prah zdravého sluchu.</em>
              </p>
            </>
          ) : (
            <p className="result-error">
              Žiadna správna odpoveď – kalibrácia nie je možná.
            </p>
          )}

          <div>
            <button
              onClick={saveCalibrationAndGoBack}
              disabled={lastCorrectLevel === null}
              className={`finish-btn btn-save ${lastCorrectLevel === null ? "disabled-btn" : ""}`}
            >
              Uložiť ako kalibráciu
            </button>

            <button
              onClick={() => {
                const confirmed = confirm("Naozaj zahodiť túto kalibráciu?");

                if (!confirmed) return;

                goBackToManual();
              }}
              className="finish-btn btn-discard"
            >
              Zahodiť a vrátiť sa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // NORMAL TEST PAGE
  // ==================================================
  return (
    <div>
      
      <header><h1>Gratulujem! Dostali ste sa na koniec testu.</h1></header>

      <div className="finish-robot-wrapper">
        <div
          onClick={goToResults}
          className="finish-robot-section"
        >
          <img
            src={`/assets/${lang}/images/super_robot.gif`}
            alt="Robot Tomáš"
            className="finish-robot-img"
          />
        </div>
      </div>

      <div className="outer">
        <button onClick={goHomeWithConfirm} className='menu-button'>
          <img src="/assets/sk/images/home.png" alt="Domov" className="menu-btn" />
        </button>

        <button onClick={goToResults} className='menu-button'>
          <img src="/assets/sk/images/forward.png" alt="Domov" className="menu-btn" />
        </button>
      </div>

      <p className="action-message">Hru ukončíte zatvorením prehliadača.</p>
      <p className="action-message">Kliknutím na robota zobrazíte celkové vyhodnotenie vášho testu.</p>

    </div>
  );
}