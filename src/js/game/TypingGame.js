import { EventEmitter } from '../utils/EventEmitter';
import { Storage } from '../utils/Storage';
import { generateQuote } from '../utils/quoteGenerator';
import { calculateWPM, calculateAccuracy } from '../utils/calculations';

export class TypingGame extends EventEmitter {
  constructor() {
    super();
    this.storage = new Storage('typing-race');
    this.initializeState();
  }

  initializeState() {
    this.state = {
      quote: '',
      isRacing: false,
      startTime: null,
      players: this.getInitialPlayers(),
      stats: {
        bestWPM: this.storage.get('bestWPM') || 0,
        gamesPlayed: this.storage.get('gamesPlayed') || 0,
        averageWPM: this.storage.get('averageWPM') || 0
      },
      difficulty: 'medium'
    };
  }

  startRace() {
    if (this.state.isRacing) return;
    
    this.state.isRacing = true;
    this.state.startTime = Date.now();
    this.state.quote = generateQuote(this.state.difficulty);
    
    // Reset player progress
    this.state.players.forEach(player => {
      player.progress = 0;
      player.wpm = 0;
      player.accuracy = 100;
    });
    
    this.emit('raceStart', { quote: this.state.quote });
    this.startBots();
  }

  handleTyping(text) {
    if (!this.state.isRacing) return;

    const stats = this.calculateStats(text);
    this.updatePlayerProgress(stats);
    this.emit('statsUpdate', stats);

    if (text === this.state.quote) {
      this.finishRace(true);
    }
  }

  calculateStats(text) {
    const wpm = calculateWPM(text.length, this.state.startTime);
    const accuracy = calculateAccuracy(text, this.state.quote.substring(0, text.length));
    const progress = (text.length / this.state.quote.length) * 100;

    return { wpm, accuracy, progress };
  }

  updatePlayerProgress({ wpm, accuracy, progress }) {
    const player = this.state.players.find(p => p.isHuman);
    player.progress = progress;
    player.wpm = wpm;
    player.accuracy = accuracy;

    this.emit('progressUpdate', this.state.players);
  }

  startBots() {
    const difficulties = {
      easy: { baseWPM: 30, variance: 10, updateInterval: 200 },
      medium: { baseWPM: 45, variance: 15, updateInterval: 150 },
      hard: { baseWPM: 60, variance: 20, updateInterval: 100 }
    };

    this.botIntervals = this.state.players
      .filter(p => !p.isHuman)
      .map(bot => {
        const config = difficulties[this.state.difficulty];
        
        return setInterval(() => {
          if (!this.state.isRacing) return;

          const randomProgress = (config.baseWPM / 60) * (config.updateInterval / 1000);
          const variance = (Math.random() - 0.5) * (config.variance / 60) * (config.updateInterval / 1000);
          
          bot.progress = Math.min(bot.progress + randomProgress + variance, 100);
          bot.wpm = config.baseWPM + Math.random() * config.variance;

          this.emit('progressUpdate', this.state.players);

          if (bot.progress >= 100) {
            clearInterval(this.botIntervals[bot.id - 2]);
            this.checkRaceEnd();
          }
        }, config.updateInterval);
      });
  }

  finishRace(playerWon) {
    this.state.isRacing = false;
    this.botIntervals?.forEach(interval => clearInterval(interval));

    const player = this.state.players.find(p => p.isHuman);
    if (player.wpm > this.state.stats.bestWPM) {
      this.updateStats(player.wpm);
    }

    this.emit('raceEnd', {
      winner: playerWon ? 'player' : 'bot',
      stats: {
        wpm: player.wpm,
        accuracy: player.accuracy
      }
    });
  }

  checkRaceEnd() {
    const allFinished = this.state.players.every(p => p.progress >= 100);
    if (allFinished) {
      this.finishRace(false);
    }
  }

  updateStats(wpm) {
    const stats = this.state.stats;
    stats.gamesPlayed++;
    
    if (wpm > stats.bestWPM) {
      stats.bestWPM = wpm;
      this.storage.set('bestWPM', wpm);
    }

    stats.averageWPM = Math.round(
      (stats.averageWPM * (stats.gamesPlayed - 1) + wpm) / stats.gamesPlayed
    );

    this.storage.set('gamesPlayed', stats.gamesPlayed);
    this.storage.set('averageWPM', stats.averageWPM);
  }

  setDifficulty(difficulty) {
    this.state.difficulty = difficulty;
  }

  reset() {
    this.botIntervals?.forEach(interval => clearInterval(interval));
    this.initializeState();
    this.emit('reset');
  }

  getInitialPlayers() {
    return [
      { id: 1, name: "You", color: "accent", isHuman: true, progress: 0, wpm: 0, accuracy: 100 },
      { id: 2, name: "SpeedDemon", color: "red", isHuman: false, progress: 0, wpm: 0, difficulty: 'hard' },
      { id: 3, name: "TypeMaster", color: "green", isHuman: false, progress: 0, wpm: 0, difficulty: 'medium' },
      { id: 4, name: "SwiftKeys", color: "blue", isHuman: false, progress: 0, wpm: 0, difficulty: 'easy' }
    ];
  }
}
