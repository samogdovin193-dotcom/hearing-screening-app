import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCalibrationByCategory } from '../lib/db';
import { useAppNavigation } from '../utils/navigation';
import type { Answer, TestMode, EarSide } from '../types';


// Slovak words
const skMap: Record<string, string> = {
  autobus: "autobus",
  lietadlo: "lietadlo",
  auto: "auto",
  sova: "sova",
  cokolada: "čokoláda",
  dzus: "džús",
  mys: "myš",
  macka: "mačka",
  vtak: "vták",
  bicykel: "bicykel",
};


// ROM words
const romMap: Record<string, string> = {
  babika: "bábika",
  chlieb: "chlieb",
  hrad: "hrad",
  jablko: "jablko",
  macka: "mačka",
  miska: "miska",
  noha: "noha",
  okno: "okno",
  stolik: "stolík",
  zaba: "žaba",
};

type Lang = 'sk' | 'rom';

type DbfsLevels = Record<number, number>;

const DEFAULT_LEVELS: DbfsLevels = {
  10: 0,
  9: -10,
  8: -20,
  7: -30,
  6: -35,
  5: -35,
  4: -40,
  3: -40,
  2: -45,
  1: -45,
};

const getLevelsStorageKey = (lang: Lang) => {
  return lang === 'rom' ? 'customDbfsLevelsROM' : 'customDbfsLevels';
};

const getDbfsLevels = (lang: Lang): DbfsLevels => {
  const savedLevels = localStorage.getItem(getLevelsStorageKey(lang));

  if (!savedLevels) {
    return DEFAULT_LEVELS;
  }

  try {
    const parsedLevels = JSON.parse(savedLevels);

    for (let level = 1; level <= 10; level++) {
      const value = Number(parsedLevels[level]);

      if (Number.isNaN(value) || value < -60 || value > 0) {
        return DEFAULT_LEVELS;
      }
    }

    return parsedLevels;
  } catch (error) {
    console.error('Chyba pri načítaní hlasitostí:', error);
    return DEFAULT_LEVELS;
  }
};

export default function Results() {
  const [searchParams] = useSearchParams();
  const { goHomeWithConfirm } = useAppNavigation();

  const [scoreCorrect, setScoreCorrect] = useState(0);
  //const [scoreWrong, setScoreWrong] = useState(0);
  const [answerHistory, setAnswerHistory] = useState<Answer[]>([]);
  const [subjectThreshold, setSubjectThreshold] = useState<number | null>(null);
  const [hearingLevel, setHearingLevel] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<React.ReactNode>(null);

  const mode = (searchParams.get('mode') || 'reproduktor') as TestMode;
  const side = (searchParams.get('side') as EarSide) || null;
  const lang = (searchParams.get("lang") || "sk") as 'sk' | 'rom';

  const dbfsLevels = getDbfsLevels(lang);

  // -------------------------
  // LOAD RESULT DATA
  // -------------------------
  useEffect(() => {
    const saved = localStorage.getItem("testResult");
    if (!saved) return;

    const data = JSON.parse(saved);
    setScoreCorrect(data.scoreCorrect || 0);
    //setScoreWrong(data.scoreWrong || 0);
    setAnswerHistory(data.answerHistory || []);
  }, []);

  // -------------------------
  // RESOLVE CATEGORY
  // -------------------------
  const resolveContext = () => {
    const urlMode = searchParams.get("mode") as TestMode | null;
    const urlSide = searchParams.get("side") as EarSide | null;
    const urlLang = (searchParams.get("lang") as 'sk' | 'rom') || lang;

    return {
      mode: urlMode || mode,
      side: urlSide || side,
      lang: urlLang
    };
  };

  // -------------------------
  // MAIN CALCULATION
  // -------------------------
  useEffect(() => {
    if (!answerHistory?.length) return;

    let bestCorrectLevel: number | null = null;
    let lowestHeard = 10;

    for (const entry of answerHistory) {
      const level = entry.level;

      if (level < lowestHeard) {
        lowestHeard = level;
      }

      if (entry.correct === entry.user) {
        if (bestCorrectLevel === null || level < bestCorrectLevel) {
          bestCorrectLevel = level;
        }
      }
    }

    setSubjectThreshold(bestCorrectLevel);

    let finalHearingLevel = lowestHeard;

    const lowestEntry = answerHistory.find(e => e.level === lowestHeard);
    if (lowestEntry && (lowestEntry.user === "(nepočul)" || !lowestEntry.user)) {
      finalHearingLevel = Math.min(10, lowestHeard + 1);
    }

    setHearingLevel(finalHearingLevel);

    compareWithCalibration(bestCorrectLevel);
  }, [answerHistory]);

  // -------------------------
  // CALIBRATION COMPARISON
  // -------------------------
  const compareWithCalibration = async (threshold: number | null) => {
    if (threshold === null) {
      setInterpretation(
        <p className="no-comparison">
          Žiadna správna odpoveď – nemožno porovnať.
        </p>
      );
      return;
    }

    try {
      const ctx = resolveContext();

      const records = await getCalibrationByCategory(
        ctx.lang,
        ctx.mode,
        ctx.side
      );

      if (!records.length) {
        setInterpretation(
          <div className="no-calibration-box">
            <p className="no-calibration-title">
              <strong>Žiadne kalibrácie pre tento režim.</strong>
            </p>
            <p className="no-calibration-text">
              Pre porovnanie je potrebné vykonať aspoň 2 kalibrácie.
            </p>
          </div>
        );
        return;
      }

      const average =
        Math.round(records.reduce((a, r) => a + r.level, 0) / records.length);

      const diff = threshold - average;

      let diffText = "";
      if (diff === 1 || diff === 2) diffText = "mierne vyšší";
      else if (diff >= 3) diffText = "výrazne vyšší";

      let interpHTML = "";

      if (threshold > average) {
        if (diff >= 1 && diff <= 2) {
          interpHTML = `
            Nameraný prah porozumenia reči je <strong>${diffText}</strong> (úroveň ${threshold}) 
            voči priemernému prahu (úroveň ${average}). 
            Odporúčame zopakovať meranie. Ak bude znova nameraný prah vyšší ako ${average}, 
            odporúčame sa poradiť s ošetrujúcim lekárom o prípadnom audiologickom vyšetrení.
          `;
        }

        if (diff >= 3) {
          interpHTML = `
            Nameraný prah porozumenia reči je <strong>${diffText}</strong> (úroveň ${threshold}) 
            voči priemernému prahu (úroveň ${average}). 
            Odporúčame zopakovať meranie pre potvrdenie výsledku. 
            Ak bude aj opakované meranie výrazne vyššie, 
            odporúčame konzultáciu s ošetrujúcim lekárom a zváženie audiologického vyšetrenia.
          `;
        }
      } 
      else if (threshold === average) {
        interpHTML = `
          Nameraný prah porozumenia reči je na rovnakej úrovni (úroveň ${threshold}) 
          ako priemerný prah na základe vami zadaných kalibračných dát (úroveň ${average}). 
          Testovaný subjekt má teda rovnaký prah porozumenia reči ako kalibračné osoby.<br>
          Tento výsledok automaticky neznamená, že testovaná osoba nemá sluchové postihnutie. 
          Ak pozorujete akékoľvek problémy so sluchom testovanej osoby, poraďte sa 
          s ošetrujúcim lekárom.
        `;
      }
      else {
        interpHTML = `
          Nameraný prah porozumenia reči je na nižšej (lepšej) úrovni (úroveň ${threshold}) 
          ako priemerný prah na základe vami zadaných kalibračných dát (úroveň ${average}). 
          Testovaný subjekt má teda nižší prah porozumenia reči ako kalibračné osoby a teda 
          rozpoznáva tichšie zvuky ako kalibračné osoby.<br>
          Tento výsledok automaticky nemusí znamenať, že testovaná osoba nemá sluchové postihnutie. 
          Ak pozorujete akékoľvek problémy so sluchom testovanej osoby, poraďte sa 
          s ošetrujúcim lekárom.
        `;
      }

      const regimeText =
        ctx.mode === "reproduktor"
          ? "reproduktor"
          : `slúchadlá (${ctx.side === "lave" ? "ľavé" : "pravé"} ucho)`;

      setInterpretation(
        <div className="comparison-box">
          <p className="comparison-text">
            <strong>Priemerný prah porozumenia reči ({regimeText})</strong>: úroveň {average}
            <small className="comparison-meta"> (z {records.length} kalibrácií)</small>
          </p>

          <p className="comparison-text">
            <strong>Tvoj prah porozumenia reči</strong>: úroveň {threshold}
          </p>

          <div className="comparison-interpretation">
            <p className="interpretation-text">
              <strong>Interpretácia:</strong>
              <br />
              <span dangerouslySetInnerHTML={{ __html: interpHTML }} />
            </p>
          </div>
        </div>
      );

    } catch (err) {
      console.error(err);
      setInterpretation(<p className="result-error">Chyba pri načítaní kalibrácií.</p>);
    }
  };

  const percentage =
    answerHistory.length > 0
      ? Math.floor((scoreCorrect / answerHistory.length) * 100)
      : 0;

  const wordMap = lang === "rom" ? romMap : skMap;

  return (
    <div>
      <header><h1>Vyhodnotenie</h1></header>

      <p className='text'>
        Upozornenie: Nasledujúce údaje sú orientačné. Ak bola vykonaná kalibrácia a test podľa inštrukcií správne, 
        a testovací subjekt dosiahol vyšší prah porozumenia/počutia v porovnaní s kalibračnými úrovňami, 
        môže to znamenať, že je vhodné poradiť sa so svojim lekárom a zvážiť audiologické vyšetrenie testovaného subjektu.</p>

      <br />

      <div>
        <p className="text">
          Prah porozumenia reči: {subjectThreshold !== null ? `úroveň ${subjectThreshold} (z 10)` : "Žiadna správna odpoveď"}
        </p>

        <p className="text">
          Prah počutia reči: {hearingLevel !== null ? `úroveň ${hearingLevel} (z 10)` : "—"}
        </p>
      </div>

      <div id="hearingComparison">{interpretation}</div>

      <div>
        <table id="historyTable">
          <thead>
            <tr>
              <th>Úroveň</th>
              <th>Správna odpoveď</th>
              <th>Vaša odpoveď</th>
              <th>Odstupy hlasitostí</th>
            </tr>
          </thead>

          <tbody>
            {answerHistory.map((entry, idx) => {
              const correctRaw = entry.correct.split("_")[0].toLowerCase();
              const userRaw = entry.user.split("_")[0].toLowerCase();
              const isCorrect = correctRaw === userRaw;

              return (
                <tr key={idx}>
                  <td>{entry.level}</td>
                  <td>{wordMap[correctRaw] || correctRaw}</td>
                  <td style={{ color: isCorrect ? "green" : "red" }}>{wordMap[userRaw] || userRaw}</td>
                  <td>{dbfsLevels[entry.level] !== undefined ? `${dbfsLevels[entry.level]} dBFS` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text percentage-small">
        Celková úspešnosť: <span>{percentage}%</span>
      </p>

      <br />

      <p className="text">
        Poznámka: Odstupy hlasitosti jednotlivých úrovní,
        sú realizované len na základe digitálnej hladiny hlasitosti
      </p>

      <div className="outer">
        <button onClick={goHomeWithConfirm} className='menu-button'>
            <img src="/assets/sk/images/home.png" alt="Domov" className="menu-btn" />
          </button>
      </div>
    </div>
  );
}