/**
 * PORTFOLIO NGUYỄN THÙY DƯƠNG — JAVASCRIPT APP
 * Flight System, Audio Equalizer, 3D Engine, Web Audio Chime, Cinematic Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Initialize Specialized Engines ---
  const soundFX = typeof SoundFXEngine !== 'undefined' ? new SoundFXEngine() : null;
  const tiltFX = typeof TiltAndSparkleFX !== 'undefined' ? new TiltAndSparkleFX() : null;
  const flight3d = typeof Flight3DEngine !== 'undefined' ? new Flight3DEngine() : null;
  const globe3d = typeof GoGlobalGlobe !== 'undefined' ? new GoGlobalGlobe() : null;

  if (flight3d && flight3d.airplane) {
    document.body.classList.add('has-3d-flight');
  }

  // --- State Variables ---
  let tickets = 55;
  let isMusicPlaying = false;
  let musicStatusTimeout = null;

  // --- DOM Elements ---
  const ticketCounters = document.querySelectorAll('.ticket-count-val');
  const ticketWallet = document.getElementById('ticketWallet');
  const toast = document.getElementById('toast');
  const musicStatusToast = document.getElementById('musicStatusToast');
  const bgMusic = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const introModal = document.getElementById('introModal');
  const startFlightBtn = document.getElementById('startFlightBtn');
  const skipIntroBtn = document.getElementById('skipIntroBtn');
  const flightTransition = document.getElementById('flightTransition');
  const flightDestination = document.getElementById('flightDestination');
  const ticketWindLayer = document.getElementById('ticketWindLayer');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Cinematic Lightbox Elements
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxSub = document.getElementById('lightboxSub');
  const lightboxQuote = document.getElementById('lightboxQuote');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  // Photo Journal Data for Hanoi in Frames
  const galleryData = [
    {
      src: 'assets/duong-cyclo.png',
      title: 'Xích lô Phố Cổ Hà Nội',
      location: '📍 Phố Phan Đình Phùng • Hà Nội',
      quote: '“Một sớm mùa thu thong thả trên xích lô qua những con phố rợp bóng cây, lắng nghe nhịp sống bình yên và sâu lắng của Thủ đô.”'
    },
    {
      src: 'assets/duong-market.png',
      title: 'Chợ truyền thống Hà Nội',
      location: '📍 Chợ hoa & Nhịp sống thường nhật',
      quote: '“Hơi thở đời sống thường nhật tại chợ hoa, nơi năng lượng tích cực và sự tươi mới của Hà Nội bắt đầu mỗi sớm mai.”'
    },
    {
      src: 'assets/duong-oldquarter.png',
      title: 'Góc phố cổ kính rêu phong',
      location: '📍 Trái tim 36 phố phường',
      quote: '“Những bức tường vàng rêu phong lưu giữ ký ức thanh xuân của những ngày đầu tiên bước chân vào giảng đường Ngoại thương.”'
    },
    {
      src: 'assets/duong-dessert.png',
      title: 'Quán nhỏ và những câu chuyện',
      location: '📍 Ẩm thực phố nhỏ Hà Thành',
      quote: '“Góc quán nhỏ và những cuộc trò chuyện ấm áp sau giờ học, hương vị gắn liền với những buổi ôn thi ngoại ngữ cùng bạn bè.”'
    },
    {
      src: 'assets/duong-flag.png',
      title: 'Tự hào màu cờ Tổ Quốc',
      location: '📍 Biểu tượng tinh thần tuổi trẻ',
      quote: '“Mang theo niềm tự hào Việt Nam — khát vọng của sinh viên FTU được học hỏi, trưởng thành và vươn tầm ra thế giới.”'
    }
  ];
  let currentPhotoIndex = 0;

  function updateLightboxPhoto(index) {
    if (index < 0) index = galleryData.length - 1;
    if (index >= galleryData.length) index = 0;
    currentPhotoIndex = index;

    const data = galleryData[currentPhotoIndex];
    if (lightboxImg) {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.title;
    }
    if (lightboxTitle) lightboxTitle.textContent = data.title;
    if (lightboxSub) lightboxSub.textContent = data.location;
    if (lightboxQuote) lightboxQuote.textContent = data.quote;
    if (lightboxCounter) lightboxCounter.textContent = `0${currentPhotoIndex + 1} / 0${galleryData.length}`;
  }

  // Bind gallery cards
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      updateLightboxPhoto(idx);
      if (lightboxModal) lightboxModal.classList.add('active');
    });
  });

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightboxPhoto(currentPhotoIndex - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightboxPhoto(currentPhotoIndex + 1);
    });
  }

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      if (e.key === 'ArrowLeft') updateLightboxPhoto(currentPhotoIndex - 1);
      if (e.key === 'ArrowRight') updateLightboxPhoto(currentPhotoIndex + 1);
      if (e.key === 'Escape') closeLightbox();
    }
  });

  // --- Audio Setup ---
  if (bgMusic) {
    bgMusic.volume = 0.45;
  }

  function showMusicNotification(text) {
    if (!musicStatusToast) return;
    musicStatusToast.textContent = text;
    musicStatusToast.classList.add('show');
    clearTimeout(musicStatusTimeout);
    musicStatusTimeout = setTimeout(() => {
      musicStatusToast.classList.remove('show');
    }, 2800);
  }

  async function playMusic() {
    if (!bgMusic) return;
    try {
      await bgMusic.play();
      isMusicPlaying = true;
      if (soundFX) soundFX.setMuted(false);
      if (musicToggleBtn) {
        musicToggleBtn.classList.add('playing');
        musicToggleBtn.setAttribute('title', 'Tạm dừng nhạc nền');
      }
      showMusicNotification('♫ Đi Đến Nơi Có Gió đang phát');
    } catch (err) {
      console.warn('Autoplay blocked:', err);
      isMusicPlaying = false;
      if (musicToggleBtn) {
        musicToggleBtn.classList.remove('playing');
      }
      showMusicNotification('⚠ Bấm vào biểu tượng nhạc để bật âm thanh');
    }
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isMusicPlaying = false;
    if (soundFX) soundFX.setMuted(true);
    if (musicToggleBtn) {
      musicToggleBtn.classList.remove('playing');
      musicToggleBtn.setAttribute('title', 'Bật nhạc nền');
    }
    showMusicNotification('Nhạc nền đã tạm dừng');
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      if (isMusicPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }

  // --- Ticket Management ---
  function updateTicketUI() {
    ticketCounters.forEach(counter => {
      counter.textContent = tickets;
    });

    if (ticketWallet) {
      ticketWallet.classList.remove('pulse');
      void ticketWallet.offsetWidth;
      ticketWallet.classList.add('pulse');
    }
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.toastTimeout);
    toast.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function consumeTicket(stopName) {
    if (tickets <= 0) {
      showToast('✈ Đã hết vé hành trình!');
      return false;
    }
    tickets--;
    updateTicketUI();
    if (soundFX) soundFX.playAirportChime();
    showToast(`✈ ${stopName}: -1 vé • Còn lại ${tickets} vé`);
    return true;
  }

  // --- Flying Ticket Generation ---
  function createFlyingTicket(container, isIntense = false) {
    if (!container) return;
    const ticket = document.createElement('div');
    ticket.className = 'flying-ticket wind';
    ticket.innerHTML = '<i></i>';

    const x0 = -4 + Math.random() * 108;
    const sway1 = -20 + Math.random() * 40;
    const sway2 = -25 + Math.random() * 50;
    const sway3 = -20 + Math.random() * 40;
    const sway4 = -15 + Math.random() * 30;
    const clamp = v => Math.max(-10, Math.min(110, v));

    ticket.style.setProperty('--x0', `${x0}vw`);
    ticket.style.setProperty('--y0', `${-16 - Math.random() * 20}vh`);
    ticket.style.setProperty('--x1', `${clamp(x0 + sway1)}vw`);
    ticket.style.setProperty('--y1', `${14 + Math.random() * 14}vh`);
    ticket.style.setProperty('--x2', `${clamp(x0 + sway2)}vw`);
    ticket.style.setProperty('--y2', `${40 + Math.random() * 16}vh`);
    ticket.style.setProperty('--x3', `${clamp(x0 + sway3)}vw`);
    ticket.style.setProperty('--y3', `${68 + Math.random() * 16}vh`);
    ticket.style.setProperty('--x4', `${clamp(x0 + sway4)}vw`);
    ticket.style.setProperty('--y4', `${114 + Math.random() * 18}vh`);

    ticket.style.setProperty('--r0', `${-35 + Math.random() * 70}deg`);
    ticket.style.setProperty('--r1', `${-25 + Math.random() * 60}deg`);
    ticket.style.setProperty('--r2', `${-40 + Math.random() * 80}deg`);
    ticket.style.setProperty('--r3', `${-30 + Math.random() * 70}deg`);
    ticket.style.setProperty('--r4', `${-45 + Math.random() * 90}deg`);
    ticket.style.setProperty('--dur', `${isIntense ? 4.5 + Math.random() * 2.2 : 6.8 + Math.random() * 3.0}s`);
    ticket.style.setProperty('--delay', `${Math.random() * (isIntense ? 0.6 : 1.2)}s`);

    const scale = 0.68 + Math.random() * 0.55;
    ticket.style.width = `${94 * scale}px`;
    ticket.style.height = `${42 * scale}px`;

    container.appendChild(ticket);
    setTimeout(() => {
      ticket.remove();
    }, 9500);
  }

  function burstTickets(count = 32) {
    if (!ticketWindLayer) return;
    for (let i = 0; i < count; i++) {
      createFlyingTicket(ticketWindLayer, true);
    }
  }

  // --- Flight Transition To Section (Gentle 2.8s flight) ---
  function flyToDestination(targetSection) {
    if (!targetSection) return;
    const stopName = targetSection.dataset.stop || 'Next Flight';

    if (flightDestination) {
      flightDestination.textContent = stopName;
    }

    if (ticketWindLayer) {
      ticketWindLayer.innerHTML = '';
    }

    if (flightTransition) {
      flightTransition.classList.remove('active');
      void flightTransition.offsetWidth;
      flightTransition.classList.add('active');
    }

    if (soundFX) {
      soundFX.playTakeoffWhoosh();
    }

    if (flight3d && typeof flight3d.startFlightTransition === 'function') {
      flight3d.startFlightTransition();
    }

    burstTickets(36);

    setTimeout(() => {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1300);

    setTimeout(() => {
      if (flightTransition) {
        flightTransition.classList.remove('active');
      }
    }, 2900);
  }

  // Bind Next-Flight Buttons
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-next');
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      const stopLabel = targetSection.dataset.stop || 'Chặng bay tiếp theo';
      const isFree = btn.hasAttribute('data-free') || targetId === 'home';

      if (isFree) {
        if (soundFX) soundFX.playAirportChime();
        flyToDestination(targetSection);
      } else {
        if (consumeTicket(stopLabel)) {
          flyToDestination(targetSection);
        }
      }
    });
  });

  // --- Intro Modal Logic ---
  if (startFlightBtn && introModal) {
    startFlightBtn.addEventListener('click', () => {
      if (soundFX) soundFX.playAirportChime();

      if (tiltFX) {
        const rect = startFlightBtn.getBoundingClientRect();
        tiltFX.burstFairyDust(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
      }

      playMusic();
      introModal.classList.add('fly');
      burstTickets(24);

      setTimeout(() => {
        introModal.classList.add('hidden');
        introModal.style.display = 'none';
        const firstStop = document.getElementById('education');
        if (firstStop) {
          flyToDestination(firstStop);
        }
      }, 750);
    });
  }

  if (skipIntroBtn && introModal) {
    skipIntroBtn.addEventListener('click', () => {
      introModal.classList.add('hidden');
      setTimeout(() => {
        introModal.style.display = 'none';
      }, 500);
    });
  }

  // --- Back to Top & Scroll Handling ---
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (backToTopBtn) {
      if (scrollY > 450) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Scroll Reveal Animations ---
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // Initial Ticket Count Sync
  updateTicketUI();
});
