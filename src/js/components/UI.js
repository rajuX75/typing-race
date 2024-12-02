import { calculateLevel } from '../utils/calculations';
import Chart from 'chart.js/auto';

export class UI {
  constructor(game) {
    this.game = game;
    this.initializeElements();
    this.setupEventListeners();
    this.setupCharts();
  }

  initializeElements() {
    this.elements = {
      quote: document.getElementById('quote'),
      input: document.getElementById('typing-input'),
      startButton: document.getElementById('start-race'),
      raceStatus: document.getElementById('race-status'),
      participants: document.getElementById('participants'),
      stats: {
        wpm: document.getElementById('wpm'),
        accuracy: document.getElementById('accuracy'),
        level: document.getElementById('level'),
        bestSpeed: document.getElementById('best-speed')
      },
      charts: {
        speedHistory: document.getElementById('speed-history-chart'),
        accuracyChart: document.getElementById('accuracy-chart')
      }
    };
  }

  setupEventListeners() {
    this.elements.startButton.addEventListener('click', () => {
      this.game.startRace();
    });

    this.elements.input.addEventListener('input', (e) => {
      this.game.handleTyping(e.target.value);
    });

    this.game.on('raceStart', ({ quote }) => {
      this.updateQuote(quote);
      this.enableInput();
      this.updateStatus('Race Started!', 'text-green-500');
    });

    this.game.on('statsUpdate', (stats) => {
      this.updateStats(stats);
      this.updateCharts(stats);
    });

    this.game.on('progressUpdate', (players) => {
      this.updateProgress(players);
    });

    this.game.on('raceEnd', (data) => {
      this.handleRaceEnd(data);
    });
  }

  setupCharts() {
    this.speedChart = new Chart(this.elements.charts.speedHistory, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'WPM',
          data: [],
          borderColor: '#f97316',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    this.accuracyChart = new Chart(this.elements.charts.accuracyChart, {
      type: 'doughnut',
      data: {
        labels: ['Correct', 'Incorrect'],
        datasets: [{
          data: [100, 0],
          backgroundColor: ['#22c55e', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        animation: false
      }
    });
  }

  updateQuote(quote) {
    this.elements.quote.textContent = quote;
  }

  enableInput() {
    this.elements.input.disabled = false;
    this.elements.input.value = '';
    this.elements.input.focus();
  }

  updateStatus(message, colorClass) {
    this.elements.raceStatus.textContent = message;
    this.elements.raceStatus.className = colorClass;
  }

  updateStats({ wpm, accuracy }) {
    this.elements.stats.wpm.textContent = `${wpm} WPM`;
    this.elements.stats.accuracy.textContent = `${accuracy}%`;
    
    const { level, color } = calculateLevel(wpm);
    this.elements.stats.level.textContent = level;
    this.elements.stats.level.className = color;
  }

  updateCharts({ wpm, accuracy }) {
    // Update speed chart
    if (this.speedChart.data.labels.length > 20) {
      this.speedChart.data.labels.shift();
      this.speedChart.data.datasets[0].data.shift();
    }

    this.speedChart.data.labels.push('');
    this.speedChart.data.datasets[0].data.push(wpm);
    this.speedChart.update();

    // Update accuracy chart
    this.accuracyChart.data.datasets[0].data = [accuracy, 100 - accuracy];
    this.accuracyChart.update();
  }

  updateProgress(players) {
    this.elements.participants.innerHTML = players
      .map(player => `
        <div class="flex items-center space-x-4 p-2">
          <div class="w-24 text-sm font-medium">${player.name}</div>
          <div class="flex-1 progress-bar">
            <div 
              class="progress-bar-fill bg-${player.color}-500"
              style="width: ${player.progress}%"
            ></div>
          </div>
          <div class="w-20 text-sm text-gray-600">${Math.round(player.wpm)} WPM</div>
        </div>
      `)
      .join('');
  }

  handleRaceEnd({ winner, stats }) {
    this.elements.input.disabled = true;
    this.elements.startButton.disabled = false;
    
    const message = winner === 'player' 
      ? `Congratulations! You won with ${stats.wpm} WPM!`
      : 'Race finished! Try again to improve your speed!';
    
    this.updateStatus(message, winner === 'player' ? 'text-green-500' : 'text-blue-500');
  }

  reset() {
    this.elements.input.value = '';
    this.elements.input.disabled = true;
    this.elements.startButton.disabled = false;
    this.updateStatus('Ready', 'text-yellow-500');
    
    // Reset charts
    this.speedChart.data.labels = [];
    this.speedChart.data.datasets[0].data = [];
    this.speedChart.update();
    
    this.accuracyChart.data.datasets[0].data = [100, 0];
    this.accuracyChart.update();
  }
}
