import { getCustomWordsByLanguage, type CustomWord } from './wordsDB';

export type TestLanguage = 'sk' | 'rom';

export type TestWord = {
  id: string;
  key: string;
  displayName: string;
  source: 'default' | 'custom';
  imageUrl: string;
  audioUrls: {
    speaker: string;
    left: string;
    right: string;
  };
};

const DEFAULT_WORDS_SK: TestWord[] = [
  {
    id: 'default_bicykel',
    key: 'bicykel',
    displayName: 'bicykel',
    source: 'default',
    imageUrl: '/assets/sk/images/bicykel.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/bicykel.wav',
      left: '/assets/sk/audio_lave_ucho/bicykel.wav',
      right: '/assets/sk/audio_prave_ucho/bicykel.wav',
    },
  },
  {
    id: 'default_auto',
    key: 'auto',
    displayName: 'auto',
    source: 'default',
    imageUrl: '/assets/sk/images/auto.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/auto.wav',
      left: '/assets/sk/audio_lave_ucho/auto.wav',
      right: '/assets/sk/audio_prave_ucho/auto.wav',
    },
  },
  {
    id: 'default_lietadlo',
    key: 'lietadlo',
    displayName: 'lietadlo',
    source: 'default',
    imageUrl: '/assets/sk/images/lietadlo.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/lietadlo.wav',
      left: '/assets/sk/audio_lave_ucho/lietadlo.wav',
      right: '/assets/sk/audio_prave_ucho/lietadlo.wav',
    },
  },
  {
    id: 'default_autobus',
    key: 'autobus',
    displayName: 'autobus',
    source: 'default',
    imageUrl: '/assets/sk/images/autobus.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/autobus.wav',
      left: '/assets/sk/audio_lave_ucho/autobus.wav',
      right: '/assets/sk/audio_prave_ucho/autobus.wav',
    },
  },
  {
    id: 'default_vtak',
    key: 'vtak',
    displayName: 'vták',
    source: 'default',
    imageUrl: '/assets/sk/images/vtak.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/vtak.wav',
      left: '/assets/sk/audio_lave_ucho/vtak.wav',
      right: '/assets/sk/audio_prave_ucho/vtak.wav',
    },
  },
  {
    id: 'default_sova',
    key: 'sova',
    displayName: 'sova',
    source: 'default',
    imageUrl: '/assets/sk/images/sova.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/sova.wav',
      left: '/assets/sk/audio_lave_ucho/sova.wav',
      right: '/assets/sk/audio_prave_ucho/sova.wav',
    },
  },
  {
    id: 'default_mys',
    key: 'mys',
    displayName: 'myš',
    source: 'default',
    imageUrl: '/assets/sk/images/mys.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/mys.wav',
      left: '/assets/sk/audio_lave_ucho/mys.wav',
      right: '/assets/sk/audio_prave_ucho/mys.wav',
    },
  },
  {
    id: 'default_macka',
    key: 'macka',
    displayName: 'mačka',
    source: 'default',
    imageUrl: '/assets/sk/images/macka.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/macka.wav',
      left: '/assets/sk/audio_lave_ucho/macka.wav',
      right: '/assets/sk/audio_prave_ucho/macka.wav',
    },
  },
  {
    id: 'default_dzus',
    key: 'dzus',
    displayName: 'džús',
    source: 'default',
    imageUrl: '/assets/sk/images/dzus.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/dzus.wav',
      left: '/assets/sk/audio_lave_ucho/dzus.wav',
      right: '/assets/sk/audio_prave_ucho/dzus.wav',
    },
  },
  {
    id: 'default_cokolada',
    key: 'cokolada',
    displayName: 'čokoláda',
    source: 'default',
    imageUrl: '/assets/sk/images/cokolada.jpg',
    audioUrls: {
      speaker: '/assets/sk/audio/cokolada.wav',
      left: '/assets/sk/audio_lave_ucho/cokolada.wav',
      right: '/assets/sk/audio_prave_ucho/cokolada.wav',
    },
  },
];

const DEFAULT_WORDS_ROM: TestWord[] = [
  {
    id: 'default_rom_babika',
    key: 'babika',
    displayName: 'bábika',
    source: 'default',
    imageUrl: '/assets/rom/images/babika.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_babika.wav',
      left: '/assets/rom/audio_lave_ucho/R_babika.wav',
      right: '/assets/rom/audio_prave_ucho/R_babika.wav',
    },
  },
  {
    id: 'default_rom_hrad',
    key: 'hrad',
    displayName: 'hrad',
    source: 'default',
    imageUrl: '/assets/rom/images/hrad.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_hrad.wav',
      left: '/assets/rom/audio_lave_ucho/R_hrad.wav',
      right: '/assets/rom/audio_prave_ucho/R_hrad.wav',
    },
  },
  {
    id: 'default_rom_chlieb',
    key: 'chlieb',
    displayName: 'chlieb',
    source: 'default',
    imageUrl: '/assets/rom/images/chlieb.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_chlieb.wav',
      left: '/assets/rom/audio_lave_ucho/R_chlieb.wav',
      right: '/assets/rom/audio_prave_ucho/R_chlieb.wav',
    },
  },
  {
    id: 'default_rom_jablko',
    key: 'jablko',
    displayName: 'jablko',
    source: 'default',
    imageUrl: '/assets/rom/images/jablko.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_jablko.wav',
      left: '/assets/rom/audio_lave_ucho/R_jablko.wav',
      right: '/assets/rom/audio_prave_ucho/R_jablko.wav',
    },
  },
  {
    id: 'default_rom_macka',
    key: 'macka',
    displayName: 'mačka',
    source: 'default',
    imageUrl: '/assets/rom/images/macka.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_macka.wav',
      left: '/assets/rom/audio_lave_ucho/R_macka.wav',
      right: '/assets/rom/audio_prave_ucho/R_macka.wav',
    },
  },
  {
    id: 'default_rom_miska',
    key: 'miska',
    displayName: 'miska',
    source: 'default',
    imageUrl: '/assets/rom/images/miska.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_miska.wav',
      left: '/assets/rom/audio_lave_ucho/R_miska.wav',
      right: '/assets/rom/audio_prave_ucho/R_miska.wav',
    },
  },
  {
    id: 'default_rom_noha',
    key: 'noha',
    displayName: 'noha',
    source: 'default',
    imageUrl: '/assets/rom/images/noha.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_noha.wav',
      left: '/assets/rom/audio_lave_ucho/R_noha.wav',
      right: '/assets/rom/audio_prave_ucho/R_noha.wav',
    },
  },
  {
    id: 'default_rom_okno',
    key: 'okno',
    displayName: 'okno',
    source: 'default',
    imageUrl: '/assets/rom/images/okno.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_okno.wav',
      left: '/assets/rom/audio_lave_ucho/R_okno.wav',
      right: '/assets/rom/audio_prave_ucho/R_okno.wav',
    },
  },
  {
    id: 'default_rom_stolik',
    key: 'stolik',
    displayName: 'stolík',
    source: 'default',
    imageUrl: '/assets/rom/images/stolik.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_stolik.wav',
      left: '/assets/rom/audio_lave_ucho/R_stolik.wav',
      right: '/assets/rom/audio_prave_ucho/R_stolik.wav',
    },
  },
  {
    id: 'default_rom_zaba',
    key: 'zaba',
    displayName: 'žaba',
    source: 'default',
    imageUrl: '/assets/rom/images/zaba.jpg',
    audioUrls: {
      speaker: '/assets/rom/audio/R_zaba.wav',
      left: '/assets/rom/audio_lave_ucho/R_zaba.wav',
      right: '/assets/rom/audio_prave_ucho/R_zaba.wav',
    },
  },
];

function getDefaultWords(lang: TestLanguage) {
  return lang === 'rom' ? DEFAULT_WORDS_ROM : DEFAULT_WORDS_SK;
}

function getSelectedWordsStorageKey(lang: TestLanguage) {
  return lang === 'rom' ? 'selectedWordsROM' : 'selectedWordsSK';
}

function customWordToTestWord(word: CustomWord): TestWord {
  return {
    id: word.id,
    key: word.key,
    displayName: word.displayName,
    source: 'custom',
    imageUrl: URL.createObjectURL(word.image),
    audioUrls: {
      speaker: URL.createObjectURL(word.audio.speaker),
      left: URL.createObjectURL(word.audio.left),
      right: URL.createObjectURL(word.audio.right),
    },
  };
}

export async function getSelectedTestWords(lang: TestLanguage): Promise<TestWord[]> {
  const defaultWords = getDefaultWords(lang);
  const customWords = await getCustomWordsByLanguage(lang);

  const allWords = [
    ...defaultWords,
    ...customWords.map(customWordToTestWord),
  ];

  const savedSelection = localStorage.getItem(getSelectedWordsStorageKey(lang));

  if (!savedSelection) {
    return defaultWords;
  }

  try {
    const selectedIds = JSON.parse(savedSelection);

    if (!Array.isArray(selectedIds)) {
      return defaultWords;
    }

    const selectedWords = selectedIds
      .map((id) => allWords.find((word) => word.id === id))
      .filter(Boolean) as TestWord[];

    if (selectedWords.length !== 10) {
      return defaultWords;
    }

    return selectedWords;
  } catch (error) {
    console.error('Chyba pri načítaní výberu slov:', error);
    return defaultWords;
  }
}

export function revokeTestWordObjectUrls(words: TestWord[]) {
  words.forEach((word) => {
    if (word.source !== "custom") return;

    URL.revokeObjectURL(word.imageUrl);
    URL.revokeObjectURL(word.audioUrls.speaker);
    URL.revokeObjectURL(word.audioUrls.left);
    URL.revokeObjectURL(word.audioUrls.right);
  });
}