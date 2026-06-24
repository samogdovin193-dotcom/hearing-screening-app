import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppNavigation } from '../utils/navigation';
import {
  addCustomWordRecord,
  countCustomWordsByLanguage,
  getCustomWordsByLanguage,
  deleteCustomWordRecord,
  type CustomWord,
} from '../lib/wordsDB';
import { clearCalibrationByCategory } from '../lib/db';

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

const areLevelsEqual = (a: DbfsLevels, b: DbfsLevels) => {
  for (let level = 1; level <= 10; level++) {
    if (Number(a[level]) !== Number(b[level])) {
      return false;
    }
  }

  return true;
};

type SettingsWord = {
  id: string;
  key: string;
  displayName: string;
  source: "default" | "custom";
  image: string;
  rawImage?: Blob;
};

const DEFAULT_WORDS_SK: SettingsWord[] = [
  { id: "default_bicykel", key: "bicykel", displayName: "bicykel", source: "default", image: "/assets/sk/images/bicykel.jpg" },
  { id: "default_auto", key: "auto", displayName: "auto", source: "default", image: "/assets/sk/images/auto.jpg" },
  { id: "default_lietadlo", key: "lietadlo", displayName: "lietadlo", source: "default", image: "/assets/sk/images/lietadlo.jpg" },
  { id: "default_autobus", key: "autobus", displayName: "autobus", source: "default", image: "/assets/sk/images/autobus.jpg" },
  { id: "default_vtak", key: "vtak", displayName: "vták", source: "default", image: "/assets/sk/images/vtak.jpg" },
  { id: "default_sova", key: "sova", displayName: "sova", source: "default", image: "/assets/sk/images/sova.jpg" },
  { id: "default_mys", key: "mys", displayName: "myš", source: "default", image: "/assets/sk/images/mys.jpg" },
  { id: "default_macka", key: "macka", displayName: "mačka", source: "default", image: "/assets/sk/images/macka.jpg" },
  { id: "default_dzus", key: "dzus", displayName: "džús", source: "default", image: "/assets/sk/images/dzus.jpg" },
  { id: "default_cokolada", key: "cokolada", displayName: "čokoláda", source: "default", image: "/assets/sk/images/cokolada.jpg" },
];

const DEFAULT_WORDS_ROM: SettingsWord[] = [
  { id: "default_rom_babika", key: "babika", displayName: "bábika", source: "default", image: "/assets/rom/images/babika.jpg" },
  { id: "default_rom_hrad", key: "hrad", displayName: "hrad", source: "default", image: "/assets/rom/images/hrad.jpg" },
  { id: "default_rom_chlieb", key: "chlieb", displayName: "chlieb", source: "default", image: "/assets/rom/images/chlieb.jpg" },
  { id: "default_rom_jablko", key: "jablko", displayName: "jablko", source: "default", image: "/assets/rom/images/jablko.jpg" },
  { id: "default_rom_macka", key: "macka", displayName: "mačka", source: "default", image: "/assets/rom/images/macka.jpg" },
  { id: "default_rom_miska", key: "miska", displayName: "miska", source: "default", image: "/assets/rom/images/miska.jpg" },
  { id: "default_rom_noha", key: "noha", displayName: "noha", source: "default", image: "/assets/rom/images/noha.jpg" },
  { id: "default_rom_okno", key: "okno", displayName: "okno", source: "default", image: "/assets/rom/images/okno.jpg" },
  { id: "default_rom_stolik", key: "stolik", displayName: "stolík", source: "default", image: "/assets/rom/images/stolik.jpg" },
  { id: "default_rom_zaba", key: "zaba", displayName: "žaba", source: "default", image: "/assets/rom/images/zaba.jpg" },
];

const MAX_CUSTOM_WORDS = 50;

const createWordKey = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const customWordToSettingsWord = (word: CustomWord): SettingsWord => {
  return {
    id: word.id,
    key: word.key,
    displayName: word.displayName,
    source: "custom",
    image: URL.createObjectURL(word.image),
    rawImage: word.image,
  };
};

const REQUIRED_WORD_COUNT = 10;

const areWordSelectionsEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((id, index) => id === sortedB[index]);
};

const getDefaultWords = (lang: Lang) => {
  return lang === "rom" ? DEFAULT_WORDS_ROM : DEFAULT_WORDS_SK;
};

const getSelectedWordsStorageKey = (lang: Lang) => {
  return lang === "rom" ? "selectedWordsROM" : "selectedWordsSK";
};

export default function Settings() {
  const [searchParams] = useSearchParams();
  const { goHomeWithConfirm } = useAppNavigation();

  const lang = (searchParams.get('lang') || 'sk') as Lang;
  const levelsStorageKey = getLevelsStorageKey(lang);

  const [levels, setLevels] = useState<DbfsLevels>(DEFAULT_LEVELS);
  const [availableWords, setAvailableWords] = useState<SettingsWord[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);

  const settingsObjectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const savedLevels = localStorage.getItem(levelsStorageKey);

    if (!savedLevels) {
      setLevels(DEFAULT_LEVELS);
      return;
    }

    try {
      const parsedLevels = JSON.parse(savedLevels);

      for (let level = 1; level <= 10; level++) {
        const value = Number(parsedLevels[level]);

        if (Number.isNaN(value) || value < -60 || value > 0) {
          setLevels(DEFAULT_LEVELS);
          return;
        }
      }

      setLevels(parsedLevels);
    } catch (error) {
      console.error('Chyba pri načítaní hlasitostí:', error);
      setLevels(DEFAULT_LEVELS);
    }
  }, [levelsStorageKey]);

  useEffect(() => {
    return () => {
      revokeSettingsObjectUrls();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadWords = async () => {
      const defaultWords = getDefaultWords(lang);
      const selectedStorageKey = getSelectedWordsStorageKey(lang);

      try {
        const customWords = await getCustomWordsByLanguage(lang);

        if (cancelled) return;

        const allWords: SettingsWord[] = [
          ...defaultWords,
          ...customWords.map(customWordToSettingsWord),
        ];

        setAvailableWords(allWords);

        const savedSelection = localStorage.getItem(selectedStorageKey);

        if (!savedSelection) {
          setSelectedWordIds(defaultWords.map((word) => word.id));
          return;
        }

        try {
          const parsedSelection = JSON.parse(savedSelection);

          if (!Array.isArray(parsedSelection)) {
            setSelectedWordIds(defaultWords.map((word) => word.id));
            return;
          }

          setSelectedWordIds(parsedSelection);
        } catch (error) {
          console.error("Chyba pri načítaní výberu slov:", error);
          setSelectedWordIds(defaultWords.map((word) => word.id));
        }
      } catch (error) {
        console.error("Chyba pri načítaní slov:", error);
        setAvailableWords(defaultWords);
        setSelectedWordIds(defaultWords.map((word) => word.id));
      }
    };

    loadWords();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const handleLevelChange = (level: number, value: string) => {
    setLevels((prev) => ({
      ...prev,
      [level]: Number(value),
    }));
  };

  const revokeSettingsObjectUrls = () => {
    settingsObjectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    settingsObjectUrlsRef.current = [];
  };

  const saveLevels = async () => {
  for (let level = 1; level <= 10; level++) {
    const value = Number(levels[level]);

    if (Number.isNaN(value)) {
      alert(`Hodnota pre úroveň ${level} musí byť číslo.`);
      return;
    }

    if (value < -60 || value > 0) {
      alert(`Hodnota pre úroveň ${level} musí byť v rozsahu od -60 do 0 dBFS.`);
      return;
    }
  }

  const savedLevels = getSavedLevels(lang);
    const levelsChanged = !areLevelsEqual(savedLevels, levels);

    if (!levelsChanged) {
      alert("Hlasitosti už sú uložené. Kalibračné dáta neboli zmazané.");
      return;
    }

    const confirmed = window.confirm(
      "Zmenou hlasitostí sa zmažú uložené kalibračné dáta pre aktuálny jazyk. " +
      "Po tejto zmene bude potrebné vykonať kalibráciu znova. Chcete pokračovať?"
    );

    if (!confirmed) {
      alert("Ukladanie hlasitostí bolo zrušené.");
      return;
    }

    await clearCalibrationForLanguage(lang);

    localStorage.setItem(levelsStorageKey, JSON.stringify(levels));

    alert("Hlasitosti boli uložené a kalibračné dáta pre aktuálny jazyk boli zmazané.");
  };

  const resetLevelsToDefault = async () => {
    const savedLevels = getSavedLevels(lang);
    const levelsChanged = !areLevelsEqual(savedLevels, DEFAULT_LEVELS);

    if (!levelsChanged) {
      setLevels(DEFAULT_LEVELS);
      alert("Predvolené hodnoty už sú nastavené. Kalibračné dáta neboli zmazané.");
      return;
    }

    const confirmed = window.confirm(
      "Obnovením predvolených hlasitostí sa zmažú uložené kalibračné dáta pre aktuálny jazyk. " +
      "Po tejto zmene bude potrebné vykonať kalibráciu znova. Chcete pokračovať?"
    );

    if (!confirmed) {
      alert("Obnovenie predvolených hodnôt bolo zrušené.");
      return;
    }

    await clearCalibrationForLanguage(lang);

    setLevels(DEFAULT_LEVELS);
    localStorage.setItem(levelsStorageKey, JSON.stringify(DEFAULT_LEVELS));

    alert("Predvolené hodnoty boli obnovené a kalibračné dáta pre aktuálny jazyk boli zmazané.");
  };

  const toggleWordSelection = (wordId: string) => {
    setSelectedWordIds((prev) => {
      if (prev.includes(wordId)) {
        return prev.filter((id) => id !== wordId);
      }

      return [...prev, wordId];
    });
  };

  const loadAvailableWords = async () => {
    const defaultWords = getDefaultWords(lang);
    const selectedStorageKey = getSelectedWordsStorageKey(lang);

    try {
      const customWords = await getCustomWordsByLanguage(lang);

      revokeSettingsObjectUrls();

      const customSettingsWords: SettingsWord[] = customWords.map((word) => {
        const imageUrl = URL.createObjectURL(word.image);

        settingsObjectUrlsRef.current.push(imageUrl);

        return {
          id: word.id,
          key: word.key,
          displayName: word.displayName,
          source: "custom",
          image: imageUrl,
          rawImage: word.image,
        };
      });

      const allWords: SettingsWord[] = [
        ...defaultWords,
        ...customSettingsWords,
      ];

      setAvailableWords(allWords);

      const savedSelection = localStorage.getItem(selectedStorageKey);

      if (!savedSelection) {
        setSelectedWordIds(defaultWords.map((word) => word.id));
        return;
      }

      const parsedSelection = JSON.parse(savedSelection);

      if (Array.isArray(parsedSelection)) {
        setSelectedWordIds(parsedSelection);
      } else {
        setSelectedWordIds(defaultWords.map((word) => word.id));
      }
    } catch (error) {
      console.error("Chyba pri načítaní slov:", error);
      setAvailableWords(defaultWords);
      setSelectedWordIds(defaultWords.map((word) => word.id));
    }
  };

  const addCustomWord = async () => {
    const currentWordCount = await countCustomWordsByLanguage(lang);

    if (currentWordCount >= MAX_CUSTOM_WORDS) {
      alert(`Dosiahli ste maximálny počet ${MAX_CUSTOM_WORDS} vlastných slov pre túto verziu testu.`);
      return;
    }

    const wordNameInput = document.getElementById("wordName") as HTMLInputElement | null;
    const imageInput = document.getElementById("wordImage") as HTMLInputElement | null;
    const speakerInput = document.getElementById("audioSpeaker") as HTMLInputElement | null;
    const leftInput = document.getElementById("audioLeft") as HTMLInputElement | null;
    const rightInput = document.getElementById("audioRight") as HTMLInputElement | null;

    if (!wordNameInput || !imageInput || !speakerInput || !leftInput || !rightInput) {
      alert("Formulár nie je dostupný.");
      return;
    }

    const displayName = wordNameInput.value.trim();

    if (!displayName) {
      alert("Zadajte názov slova.");
      wordNameInput.focus();
      return;
    }

    if (!imageInput.files?.[0]) {
      alert("Vyberte obrázok pre slovo.");
      return;
    }

    if (!speakerInput.files?.[0]) {
      alert("Vyberte nahrávku pre reproduktor.");
      return;
    }

    if (!leftInput.files?.[0]) {
      alert("Vyberte nahrávku pre ľavé ucho.");
      return;
    }

    if (!rightInput.files?.[0]) {
      alert("Vyberte nahrávku pre pravé ucho.");
      return;
    }

    const wordRecord: CustomWord = {
      id: crypto.randomUUID(),
      language: lang,
      key: createWordKey(displayName),
      displayName,
      createdAt: new Date().toISOString(),
      image: imageInput.files[0],
      audio: {
        speaker: speakerInput.files[0],
        left: leftInput.files[0],
        right: rightInput.files[0],
      },
    };

    try {
      await addCustomWordRecord(wordRecord);

      alert("Slovo bolo úspešne pridané.");

      wordNameInput.value = "";
      imageInput.value = "";
      speakerInput.value = "";
      leftInput.value = "";
      rightInput.value = "";

      await loadAvailableWords();
    } catch (error) {
      console.error("Chyba pri ukladaní slova:", error);
      alert("Slovo sa nepodarilo uložiť.");
    }
  };

  const saveSelectedWords = async () => {
    if (selectedWordIds.length !== REQUIRED_WORD_COUNT) {
      alert(
        `Do testu musí byť vybraných presne ${REQUIRED_WORD_COUNT} slov. Aktuálne je vybraných ${selectedWordIds.length}.`
      );
      return;
    }

    const selectedStorageKey = getSelectedWordsStorageKey(lang);
    const oldSelectedIds = getSavedSelectedWords(lang);

    const selectionChanged = !areWordSelectionsEqual(oldSelectedIds, selectedWordIds);

    if (!selectionChanged) {
      alert("Výber slov už je uložený. Kalibračné dáta neboli zmazané.");
      return;
    }

    const confirmed = window.confirm(
      "Zmenou výberu slov sa zmažú uložené kalibračné dáta pre aktuálny jazyk. " +
      "Po tejto zmene bude potrebné vykonať kalibráciu znova. Chcete pokračovať?"
    );

    if (!confirmed) {
      alert("Ukladanie výberu slov bolo zrušené.");
      return;
    }

    await clearCalibrationForLanguage(lang);

    localStorage.setItem(selectedStorageKey, JSON.stringify(selectedWordIds));

    alert("Výber slov bol uložený a kalibračné dáta pre aktuálny jazyk boli zmazané.");
  };

  const getSavedLevels = (lang: Lang): DbfsLevels => {
    const levelsStorageKey = getLevelsStorageKey(lang);
    const savedLevels = localStorage.getItem(levelsStorageKey);

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
      console.error("Chyba pri načítaní uložených hlasitostí:", error);
      return DEFAULT_LEVELS;
    }
  };

  const getSavedSelectedWords = (lang: Lang) => {
    const selectedStorageKey = getSelectedWordsStorageKey(lang);
    const savedSelection = localStorage.getItem(selectedStorageKey);
    const defaultSelectedIds = getDefaultWords(lang).map((word) => word.id);

    if (!savedSelection) {
      return defaultSelectedIds;
    }

    try {
      const parsedSelection = JSON.parse(savedSelection);

      if (Array.isArray(parsedSelection)) {
        return parsedSelection;
      }

      return defaultSelectedIds;
    } catch (error) {
      console.error("Chyba pri načítaní uloženého výberu slov:", error);
      return defaultSelectedIds;
    }
  };

  const clearCalibrationForLanguage = async (lang: Lang) => {
    await clearCalibrationByCategory(lang, "reproduktor", null);
    await clearCalibrationByCategory(lang, "sluchadla", "lave");
    await clearCalibrationByCategory(lang, "sluchadla", "prave");
  };

  const deleteCustomWord = async (
    word: SettingsWord,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (word.source !== "custom") {
      return;
    }

    const isSelected = selectedWordIds.includes(word.id);

    const confirmed = window.confirm(
      isSelected
        ? "Toto vlastné slovo je aktuálne vo vybranom zozname slov. Jeho zmazaním sa zmení výber slov a zmažú sa uložené kalibračné dáta pre aktuálny jazyk. Po tejto zmene bude potrebné vykonať kalibráciu znova. Chcete pokračovať?"
        : "Naozaj chcete zmazať toto vlastné slovo?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCustomWordRecord(word.id);

      const updatedSelectedWordIds = selectedWordIds.filter(
        (selectedId) => selectedId !== word.id
      );

      setSelectedWordIds(updatedSelectedWordIds);

      if (isSelected) {
        const selectedStorageKey = getSelectedWordsStorageKey(lang);

        localStorage.setItem(
          selectedStorageKey,
          JSON.stringify(updatedSelectedWordIds)
        );

        await clearCalibrationForLanguage(lang);

        alert(
          "Vlastné slovo bolo zmazané. Keďže bolo vo vybranom zozname slov, kalibračné dáta pre aktuálny jazyk boli zmazané. Vyberte nové slovo tak, aby bolo vybraných presne 10 slov."
        );
      } else {
        alert("Vlastné slovo bolo zmazané.");
      }

      await loadAvailableWords();
    } catch (error) {
      console.error("Chyba pri mazaní vlastného slova:", error);
      alert("Vlastné slovo sa nepodarilo zmazať.");
    }
  };

  return (
    <div>
      <header>
        <h1>
          {lang === 'rom'
            ? 'Nastavenia rómskej verzie'
            : 'Nastavenia slovenskej verzie'}
        </h1>
      </header>

      <main className="settings-page">

        {/* Upozornenie */}
        <section className="settings-card">
          <h2>Upozornenie</h2>

          <p className="settings-warning">
            Nahrávky, ktoré pridávate do testu, musia byť normalizované na rovnakú hlasitosť
            ako ostatné nahrávky v teste. Ak nahrávky nebudú mať rovnakú hlasitosť,
            výsledky testu môžu byť nepoužiteľné.
          </p>
        </section>

        {/* Nastavenie hlasitostí */}
        <section className="settings-card">
          <h2>Nastavenie hlasitostí jednotlivých kôl</h2>

          <p className="settings-text">
            Zadajte hodnoty hlasitosti (min: -60, max: 0) pre jednotlivé kolá testu v dBFS.
          </p>

          <div className="volume-grid">
            <label>
              Úroveň 10 (dBFS)
              <input type="number" id="level-10" value={levels[10]} onChange={(e) => handleLevelChange(10, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 9 (dBFS)
              <input type="number" id="level-9" value={levels[9]} onChange={(e) => handleLevelChange(9, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 8 (dBFS)
              <input type="number" id="level-8" value={levels[8]} onChange={(e) => handleLevelChange(8, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 7 (dBFS)
              <input type="number" id="level-7" value={levels[7]} onChange={(e) => handleLevelChange(7, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 6 (dBFS)
              <input type="number" id="level-6" value={levels[6]} onChange={(e) => handleLevelChange(6, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 5 (dBFS)
              <input type="number" id="level-5" value={levels[5]} onChange={(e) => handleLevelChange(5, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 4 (dBFS)
              <input type="number" id="level-4" value={levels[4]} onChange={(e) => handleLevelChange(4, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 3 (dBFS)
              <input type="number" id="level-3" value={levels[3]} onChange={(e) => handleLevelChange(3, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 2 (dBFS)
              <input type="number" id="level-2" value={levels[2]} onChange={(e) => handleLevelChange(2, e.target.value)} step={5} min={-60} max={0} />
            </label>

            <label>
              Úroveň 1 (dBFS)
              <input type="number" id="level-1" value={levels[1]} onChange={(e) => handleLevelChange(1, e.target.value)} step={5} min={-60} max={0} />
            </label>
          </div>

          <div className="settings-buttons">
            <button
              id="saveLevelsBtn"
              className="button green"
              type="button"
              onClick={saveLevels}
            >
              Uložiť hlasitosti
            </button>

            <button
              id="resetLevelsBtn"
              className="button"
              type="button"
              onClick={resetLevelsToDefault}
            >
              Predvolené hodnoty
            </button>
          </div>
        </section>

        {/* Pridanie slova */}
        <section className="settings-card">
          <h2>Pridať nové slovo</h2>

          <div className="form-grid">
            <label>
              Názov slova:
              <input
                type="text"
                id="wordName"
                placeholder="napr. strom"
              />
            </label>

            <label>
              Obrázok:
              <input
                type="file"
                id="wordImage"
                accept="image/*"
              />
            </label>

            <label>
              Nahrávka pre reproduktor:
              <input
                type="file"
                id="audioSpeaker"
                accept="audio/*"
              />
            </label>

            <label>
              Nahrávka pre ľavé ucho:
              <input
                type="file"
                id="audioLeft"
                accept="audio/*"
              />
            </label>

            <label>
              Nahrávka pre pravé ucho:
              <input
                type="file"
                id="audioRight"
                accept="audio/*"
              />
            </label>
          </div>

          <button
            id="addWordBtn"
            className="button green"
            type="button"
            onClick={addCustomWord}
          >
            Pridať slovo
          </button>
        </section>

        {/* Zoznam slov */}
        <section className="settings-card">
          <h2>Dostupné slová</h2>

          <p className="settings-text">
            Zo zoznamu vyberte presne 10 slov, ktoré budú použité v teste.
          </p>

          <div className="word-counters-row">
            <p
              id="selectedWordsCounter"
              className="settings-text word-counter"
              style={{ color: selectedWordIds.length === 10 ? "green" : "#8a1f11" }}
            >
              Vybraných slov: {selectedWordIds.length} / 10
            </p>

            <p id="customWordsCounter" className="settings-text word-counter">
              Vlastné slová: {availableWords.filter((word) => word.source === "custom").length} / 50
            </p>
          </div>

          <div id="wordList" className="word-list">
            {availableWords.map((word) => {
              const isSelected = selectedWordIds.includes(word.id);

              return (
                <div
                  key={word.id}
                  className={`word-list-item ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleWordSelection(word.id)}
                >
                  {word.source === "custom" && (
                    <button
                      type="button"
                      className="word-delete-ui"
                      onClick={(event) => deleteCustomWord(word, event)}
                      title="Zmazať vlastné slovo"
                    >
                      ×
                    </button>
                  )}

                  <div className="word-image-wrapper">
                    <img src={word.image} alt={word.displayName} />

                    <span className="word-badge">
                      {word.source === "default" ? "Predvolené" : "Vlastné"}
                    </span>
                  </div>

                  <div className="word-title">
                    {word.displayName}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            id="saveSelectedWordsBtn"
            className="button green"
            type="button"
            onClick={saveSelectedWords}
          >
            Uložiť výber 10 slov
          </button>
        </section>

        {/* Navigácia */}
        <section className="settings-navigation">
          <button
            onClick={goHomeWithConfirm}
            className="button"
            type="button"
          >
            Späť na domovskú stránku
          </button>
        </section>

      </main>
    </div>
  );
}