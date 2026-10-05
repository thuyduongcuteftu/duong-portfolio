/**
 * FAIRY SPARKLES & VISUAL PARTICLES FX
 * Note: 3D Card tilt on mouse hover removed per user request.
 * Cards now maintain clean, stable layout for optimal readability.
 */

class TiltAndSparkleFX {
  constructor() {
    // 3D card tilt disabled per user preference
  }

  /**
   * Fairy Sparkles Burst (Bụi sao tiên lấp lánh khi khởi hành)
   */
  burstFairyDust(originX, originY, count = 35) {
    const container = document.body;
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'fairy-sparkle';

      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 200;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      const size = 5 + Math.random() * 8;
      const duration = 0.9 + Math.random() * 0.7;

      sparkle.style.left = `${originX}px`;
      sparkle.style.top = `${originY}px`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.setProperty('--dx', `${targetX}px`);
      sparkle.style.setProperty('--dy', `${targetY}px`);
      sparkle.style.animation = `sparkleFly ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards`;

      // Sparkle colors: Gold, Cyan, White, Powder Blue
      const colors = ['#f59e0b', '#38bdf8', '#ffffff', '#7dd3fc', '#fbbf24', '#0284c7'];
      sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      container.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), duration * 1000 + 100);
    }
  }
}

window.TiltAndSparkleFX = TiltAndSparkleFX;
