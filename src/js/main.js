import '../styles/main.css';
import { TypingGame } from './game/TypingGame';
import { UI } from './components/UI';

document.addEventListener('DOMContentLoaded', () => {
  const game = new TypingGame();
  const ui = new UI(game);

  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to start new race
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!game.state.isRacing) {
        game.startRace();
      }
    }

    // Escape to reset game
    if (e.key === 'Escape') {
      game.reset();
      ui.reset();
    }
  });

  // Handle difficulty selection
  const difficultySelect = document.getElementById('difficulty');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
      game.setDifficulty(e.target.value);
    });
  }

  // Handle theme switching
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', 
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      );
    });

    // Set initial theme
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }

  // Handle sound effects
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const soundEnabled = localStorage.getItem('sound') !== 'disabled';
      localStorage.setItem('sound', soundEnabled ? 'disabled' : 'enabled');
      soundToggle.textContent = soundEnabled ? '🔇' : '🔊';
    });

    // Set initial sound state
    soundToggle.textContent = localStorage.getItem('sound') === 'disabled' ? '🔇' : '🔊';
  }
});
