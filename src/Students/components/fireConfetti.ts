import confetti from 'canvas-confetti';

// Cuando detectes que la unidad terminó:
const fireConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#58CC02', '#1CB0F6', '#FFC800']
  });
};