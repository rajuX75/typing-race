const quotes = [
  {
    text: "The quick brown fox jumps over the lazy dog.",
    difficulty: "easy"
  },
  {
    text: "To be or not to be, that is the question.",
    difficulty: "easy"
  },
  {
    text: "In three words I can sum up everything I've learned about life: it goes on.",
    difficulty: "medium"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    difficulty: "medium"
  },
  {
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    difficulty: "hard"
  },
  {
    text: "Life is what happens when you're busy making other plans. Beautiful things happen in your life when you distance yourself from negative things.",
    difficulty: "hard"
  }
];

let lastQuoteIndex = -1;

export function generateQuote(difficulty = null) {
  let availableQuotes = quotes;
  
  if (difficulty) {
    availableQuotes = quotes.filter(quote => quote.difficulty === difficulty);
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * availableQuotes.length);
  } while (randomIndex === lastQuoteIndex && availableQuotes.length > 1);

  lastQuoteIndex = randomIndex;
  return availableQuotes[randomIndex].text;
}

export function getQuotesByDifficulty(difficulty) {
  return quotes.filter(quote => quote.difficulty === difficulty);
}
