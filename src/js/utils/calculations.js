export function calculateWPM(charCount, startTime) {
  if (!startTime) return 0;
  const minutes = (Date.now() - startTime) / 60000;
  return Math.round((charCount / 5) / minutes);
}

export function calculateAccuracy(current, correct) {
  if (current.length === 0) return 100;
  
  let matches = 0;
  for (let i = 0; i < current.length; i++) {
    if (current[i] === correct[i]) matches++;
  }
  
  return Math.round((matches / current.length) * 100);
}

export function calculateLevel(wpm) {
  if (wpm < 30) return { level: 'Beginner', color: 'text-gray-500' };
  if (wpm < 50) return { level: 'Intermediate', color: 'text-blue-500' };
  if (wpm < 70) return { level: 'Advanced', color: 'text-green-500' };
  if (wpm < 90) return { level: 'Expert', color: 'text-purple-500' };
  return { level: 'Master', color: 'text-yellow-500' };
}

export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
