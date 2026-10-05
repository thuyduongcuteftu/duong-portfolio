/**
 * PASSPORT STAMPS & GOLDEN TICKET EASTER EGG
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. DIGITAL PASSPORT VISA STAMPS INTERACTION
  // ==========================================
  const stamps = document.querySelectorAll('.passport-stamp');
  const stampDetailModal = document.getElementById('stampDetailModal');
  const stampDetailTitle = document.getElementById('stampDetailTitle');
  const stampDetailBody = document.getElementById('stampDetailBody');
  const stampDetailClose = document.getElementById('stampDetailClose');

  const stampData = {
    ftu: {
      title: '✈ VISA 01: ACADEMIC EXCELLENCE',
      text: 'Đại học Ngoại thương (FTU) • GPA 3.61/4.00 • Lớp Kinh tế Đối ngoại Anh 03 Tiêu chuẩn. Điểm thi Đánh giá năng lực ĐHQGHN đạt 108/150 điểm, tuyển thẳng cấp 3 nhờ giải thi học sinh giỏi Vật lý cấp tỉnh. Minh chứng cho sự kỷ luật và khả năng bứt phá ngoạn mục từ 2.50 lên 3.61.'
    },
    goglobal: {
      title: '✈ VISA 02: GOGLOBAL FOUNDER INITIATIVE',
      text: 'Sáng lập và phát triển GoGlobal — Dự án kết nối cơ hội trao đổi sinh viên quốc tế, cẩm nang hồ sơ học bổng, thiết kế nhận diện thương hiệu và website trực quan cho sinh viên FTU.'
    },
    languages: {
      title: '✈ VISA 03: POLYGLOT GLOBAL CITIZEN',
      text: 'Thành thạo song song hai ngoại ngữ quốc tế: Tiếng Anh học thuật IELTS Band 6.5 và Tiếng Trung cao cấp HSK 5. Tự tin giao tiếp đa văn hóa và nghiên cứu tài liệu kinh tế thương mại toàn cầu.'
    },
    community: {
      title: '✈ VISA 04: COMMUNITY LEADERSHIP',
      text: 'Outstanding Participant dự án tình nguyện "Em tới trường", hỗ trợ quà học tập vùng cao. Hậu cần và điều phối tại Đại học Đại biểu Phụ nữ Toàn quốc lần thứ XIV (EACC).'
    },
    hanoi: {
      title: '✈ VISA 05: HANOI ROOTS & HERITAGE',
      text: 'Gốc rễ và cội nguồn văn hóa: Nơi Thuỳ Dương sinh ra, học tập và nuôi dưỡng ước mơ vươn ra biển lớn. Cầu nối giữa văn hóa truyền thống Việt Nam và tư duy hội nhập toàn cầu.'
    }
  };

  stamps.forEach(stamp => {
    stamp.addEventListener('click', () => {
      const type = stamp.getAttribute('data-stamp');
      const data = stampData[type];
      if (data && stampDetailModal) {
        stampDetailTitle.textContent = data.title;
        stampDetailBody.textContent = data.text;
        stampDetailModal.classList.add('active');
      }
    });
  });

  if (stampDetailClose) {
    stampDetailClose.addEventListener('click', () => {
      if (stampDetailModal) stampDetailModal.classList.remove('active');
    });
  }

  // ==========================================
  // 2. GOLDEN TICKET EASTER EGG (SECRET PASS)
  // ==========================================
  const goldenTicketModal = document.getElementById('goldenTicketModal');
  const goldenTicketTriggers = document.querySelectorAll('.golden-star-trigger');
  const closeGoldenTicketBtn = document.getElementById('closeGoldenTicketBtn');

  function openGoldenTicket() {
    if (goldenTicketModal) {
      goldenTicketModal.classList.add('active');
      if (window.TiltAndSparkleFX) {
        const fx = new window.TiltAndSparkleFX();
        fx.burstFairyDust(window.innerWidth / 2, window.innerHeight / 2, 50);
      }
    }
  }

  goldenTicketTriggers.forEach(t => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      openGoldenTicket();
    });
  });

  if (closeGoldenTicketBtn) {
    closeGoldenTicketBtn.addEventListener('click', () => {
      if (goldenTicketModal) goldenTicketModal.classList.remove('active');
    });
  }

  // Keyboard Escape for custom modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (stampDetailModal) stampDetailModal.classList.remove('active');
      if (goldenTicketModal) goldenTicketModal.classList.remove('active');
    }
  });
});
