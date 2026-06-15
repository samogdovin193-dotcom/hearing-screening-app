import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import { addCalibrationRecord } from '../lib/db';
import type { TestMode, EarSide } from '../types';

export default function Finish() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { go } = useAppNavigation();


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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-10">
          Gratulujem! Dostali ste sa na koniec testu.
        </h1>

        {lastCorrectLevel !== null ? (
          <>
            <p className="text-xl mb-3">
              Posledná správna odpoveď:
            </p>

            <p className="text-4xl font-bold text-green-700 mb-4">
              úroveň {lastCorrectLevel}
            </p>

            <p className="italic text-gray-600 mb-10">
              Toto bude uložené ako kalibračný prah zdravého sluchu.
            </p>
          </>
        ) : (
          <p className="text-red-600 text-xl mb-10">
            Žiadna správna odpoveď – kalibrácia nie je možná.
          </p>
        )}

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={saveCalibrationAndGoBack}
            disabled={lastCorrectLevel === null}
            className="big-button bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            Uložiť ako kalibráciu
          </button>

          <button
            onClick={goBackToManual}
            className="big-button bg-gray-500 hover:bg-gray-600 text-white"
          >
            Zahodiť a vrátiť sa
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // NORMAL TEST PAGE
  // ==================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-green-600">
          Gratulujem! Dostali ste sa na koniec testu.
        </h1>
      </header>

      <div className="mb-12">
        <div
          onClick={goToResults}
          className="cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-300"
        >
          <img
            src={`/assets/${lang}/images/super_robot.gif`}
            alt="Robot Tomáš"
            className="w-80 h-80 object-contain mx-auto"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <button
          onClick={() => navigate(`/?lang=${lang}`)}
        >
          <img src="/assets/sk/images/home.png" alt="Domov" className="w-12 h-12" />
        </button>

        <button
          onClick={goToResults}
          className="big-button bg-blue-600 hover:bg-blue-700 text-white px-10"
        >
          <img src="/assets/sk/images/forward.png" alt="Domov" className="w-12 h-12" />
        </button>
      </div>

      <p className="text-lg text-gray-700">
        Hru ukončíte zatvorením prehliadača.
      </p>

      <p className="text-lg text-gray-700 mt-3 max-w-lg">
        Kliknutím na robota zobrazíte celkové vyhodnotenie vášho testu.
      </p>
    </div>
  );
}