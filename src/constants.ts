import { QuestCategory, BibleQuote } from './types';

export const PREDEFINED_QUESTS = [
  {
    id: 'predefined-exercise',
    title: 'Daily Workout',
    description: 'Complete 30 minutes of physical activity.',
    category: QuestCategory.EXERCISE,
    points: 50,
    isPredefined: true
  },
  {
    id: 'predefined-meditation',
    title: 'Mindful Meditation',
    description: 'Spend 10 minutes in quiet meditation.',
    category: QuestCategory.MEDITATION,
    points: 30,
    isPredefined: true
  },
  {
    id: 'predefined-reading',
    title: 'Wisdom Reading',
    description: 'Read for 20 minutes to grow your mind.',
    category: QuestCategory.READING,
    points: 40,
    isPredefined: true
  }
];

export const BIBLE_QUOTES: BibleQuote[] = [
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31" },
  { text: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  { text: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { text: "Let all that you do be done in love.", reference: "1 Corinthians 16:14" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", reference: "Proverbs 16:3" },
  { text: "The joy of the Lord is your strength.", reference: "Nehemiah 8:10" },
  { text: "Give thanks to the Lord, for he is good; his love endures forever.", reference: "Psalm 107:1" }
];
