import Dexie, { type EntityTable } from 'dexie';

export type WordLanguage = 'sk' | 'rom';

export interface CustomWord {
  id: string;
  language: WordLanguage;
  key: string;
  displayName: string;
  createdAt: string;

  image: Blob;

  audio: {
    speaker: Blob;
    left: Blob;
    right: Blob;
  };
}

const wordsDb = new Dexie('RobotTomasWordsDB') as Dexie & {
  words: EntityTable<CustomWord, 'id'>;
};

wordsDb.version(1).stores({
  words: 'id, language, key, createdAt'
});

export default wordsDb;

export async function addCustomWordRecord(word: CustomWord) {
  return await wordsDb.words.add(word);
}

export async function getCustomWordsByLanguage(language: WordLanguage) {
  return await wordsDb.words
    .where('language')
    .equals(language)
    .toArray();
}

export async function countCustomWordsByLanguage(language: WordLanguage) {
  return await wordsDb.words
    .where('language')
    .equals(language)
    .count();
}

export async function deleteCustomWordRecord(id: string) {
  return await wordsDb.words.delete(id);
}