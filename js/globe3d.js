/**
 * GOGLOBAL 3D INTERACTIVE FLIGHT GLOBE (Three.js r128)
 * Next-Gen Aviation Console & Global University Exchange Visualizer
 * Continuous orbital cruising airplanes around the globe (0% GPU idle when offscreen)
 */

class GoGlobalGlobe {
  constructor() {
    this.container = document.getElementById('globeContainer');
    this.canvas = document.getElementById('globe3dCanvas');
    this.infoBox = document.getElementById('globeInfo');

    if (!this.container || !this.canvas || typeof THREE === 'undefined') return;

    // Scene & Engine
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globeGroup = null;
    this.arcsGroup = null;
    this.jetsGroup = null;
    this.markersGroup = null;

    // State
    this.cityPoints = [];
    this.flightRoutes = [];
    this.orbitalPlanes = [];
    this.activeCityId = 'hanoi';
    this.isVisible = false;
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.isAutoSpinning = true;
    this.autoSpinSpeed = 0.0035;

    // Camera & Target Rotation Lerp
    this.targetRotY = null;
    this.targetRotX = null;
    this.isLerpingRotation = false;
    this.defaultCameraZ = 46;
    this.minCameraZ = 32;
    this.maxCameraZ = 60;

    // Pulse animations
    this.originRipple = null;
    this.destRipple = null;
    this.rippleScale = 1.0;
    this.destRippleScale = 1.0;

    // Rich City Data
    this.cities = [
      {
        id: 'hanoi',
        name: 'Hà Nội (FTU)',
        flag: '🇻🇳',
        code: 'HAN • Trụ sở GoGlobal',
        country: 'Việt Nam',
        lat: 21.0285,
        lon: 105.8542,
        isOrigin: true,
        univ: 'Trường Đại học Ngoại thương (FTU Hà Nội)',
        program: 'Điểm khởi hành cho sinh viên Ngoại thương K63',
        distance: '0 km (Điểm xuất phát)',
        desc: 'Trụ sở dự án GoGlobal — Nơi khởi xướng các sáng kiến hội nhập quốc tế cho sinh viên FTU.'
      },
      {
        id: 'tokyo',
        name: 'Tokyo, Nhật Bản',
        flag: '🇯🇵',
        code: 'NRT • HND • 3,660 km',
        country: 'Nhật Bản',
        lat: 35.6762,
        lon: 139.6503,
        univ: 'Waseda University & Keio University',
        program: 'Chương trình Trao đổi 1–2 Học kỳ (MEXT & JASSO)',
        distance: '3,660 km từ FTU',
        desc: 'Môi trường học thuật tinh hoa tại Tokyo với học bổng chính phủ và cơ hội thực tập đa quốc gia.'
      },
      {
        id: 'seoul',
        name: 'Seoul, Hàn Quốc',
        flag: '🇰🇷',
        code: 'ICN • 2,740 km',
        country: 'Hàn Quốc',
        lat: 37.5665,
        lon: 126.9780,
        univ: 'Yonsei University & Seoul National University',
        program: 'Giao lưu Văn hóa & Kinh doanh Đông Á',
        distance: '2,740 km từ FTU',
        desc: 'Học tập tại trung tâm công nghệ và sáng tạo, mở rộng mạng lưới quan hệ quốc tế cùng sinh viên toàn cầu.'
      },
      {
        id: 'london',
        name: 'London, Vương quốc Anh',
        flag: '🇬🇧',
        code: 'LHR • 9,230 km',
        country: 'Vương quốc Anh',
        lat: 51.5074,
        lon: -0.1278,
        univ: 'London School of Economics (LSE) & Warwick',
        program: 'Học bổng Lãnh đạo Trẻ & Tài chính Toàn cầu',
        distance: '9,230 km từ FTU',
        desc: 'Trung tâm tài chính thế giới. Rèn luyện tư duy phản biện sắc bén và kỹ năng phân tích kinh tế vĩ mô.'
      },
      {
        id: 'paris',
        name: 'Paris, Pháp',
        flag: '🇫🇷',
        code: 'CDG • 9,180 km',
        country: 'Pháp',
        lat: 48.8566,
        lon: 2.3522,
        univ: 'HEC Paris & Sciences Po',
        program: 'Thương mại Quốc tế & Quản trị Chiến lược EU',
        distance: '9,180 km từ FTU',
        desc: 'Trường kinh doanh hàng đầu Châu Âu, trải nghiệm ngoại giao quốc tế và mô hình kinh tế thị trường chung.'
      },
      {
        id: 'newyork',
        name: 'New York, Hoa Kỳ',
        flag: '🇺🇸',
        code: 'JFK • 13,340 km',
        country: 'Hoa Kỳ',
        lat: 40.7128,
        lon: -74.0060,
        univ: 'Columbia University & NYU Stern',
        program: 'Diễn đàn Lãnh đạo Kinh tế & Trao đổi Học thuật',
        distance: '13,340 km từ FTU',
        desc: 'Thủ đô tài chính Phố Wall, trụ sở Liên Hợp Quốc và nhịp sống kinh doanh sôi động bậc nhất thế giới.'
      },
      {
        id: 'singapore',
        name: 'Singapore',
        flag: '🇸🇬',
        code: 'SIN • 2,210 km',
        country: 'Singapore',
        lat: 1.3521,
        lon: 103.8198,
        univ: 'National University of Singapore (NUS) & SMU',
        program: 'ASEAN Youth Business Innovation Summit',
        distance: '2,210 km từ FTU',
        desc: 'Cửa ngõ kinh tế tài chính ASEAN, môi trường học thuật chuẩn quốc tế và hệ sinh thái khởi nghiệp số.'
      },
      {
        id: 'sydney',
        name: 'Sydney, Úc',
        flag: '🇦🇺',
        code: 'SYD • 7,780 km',
        country: 'Úc',
        lat: -33.8688,
        lon: 151.2093,
        univ: 'University of Sydney (USYD) & UNSW',
        program: 'Kinh tế Đối ngoại & Logistics Bền vững',
        distance: '7,780 km từ FTU',
        desc: 'Trải nghiệm nền giáo dục năng động, khám phá chuỗi cung ứng châu Á - Thái Bình Dương và phát triển bền vững.'
      }
    ];

    this.init();
    this.initDOMControls();
    this.initVisibilityObserver();
  }

  // Convert Lat/Lon to 3D Cartesian coordinates on sphere
  latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  init() {
    const width = this.container.clientWidth || 460;
    const height = this.container.clientHeight || 440;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 4, this.defaultCameraZ);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    this.arcsGroup = new THREE.Group();
    this.jetsGroup = new THREE.Group();
    this.markersGroup = new THREE.Group();

    this.globeGroup.add(this.arcsGroup);
    this.globeGroup.add(this.jetsGroup);
    this.globeGroup.add(this.markersGroup);

    const globeRadius = 16;

    // 1. Core Sphere (Light Sky Blue Translucent)
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 40, 40);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.14,
      shininess: 45
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    this.globeGroup.add(sphere);

    // 2. Atmospheric Outer Glow Corona
    const glowGeo = new THREE.SphereGeometry(globeRadius * 1.05, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.10
    });
    const atmosphere = new THREE.Mesh(glowGeo, glowMat);
    this.globeGroup.add(atmosphere);

    // 3. Celestial Latitude/Longitude Grid
    const wireGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    this.globeGroup.add(wireframe);

    // 4. Holographic Continental Point Cloud (Fibonacci Dot Matrix)
    this.createPointClouds(globeRadius);

    // 5. Origin City (Hanoi) & Markers
    const originCity = this.cities[0];
    const originPos = this.latLonToVector3(originCity.lat, originCity.lon, globeRadius);

    // Origin Radar Sonar Waves (Pulsing concentric ring)
    this.createOriginRipple(originPos);

    // Destination Dynamic Radar Ring
    this.createDestRipple();

    // 6. Build City Pins & Flight Arcs
    this.cities.forEach(city => {
      const pos = this.latLonToVector3(city.lat, city.lon, globeRadius);

      // 3D Pin Beacon
      const isOrigin = !!city.isOrigin;
      const markerSize = isOrigin ? 0.8 : 0.52;
      const markerGeo = new THREE.SphereGeometry(markerSize, 14, 14);
      const markerMat = new THREE.MeshBasicMaterial({
        color: isOrigin ? 0xf59e0b : 0x0284c7
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      marker.userData = city;
      this.markersGroup.add(marker);
      this.cityPoints.push(marker);

      // Connecting Flight Arcs with 3D Supersonic Jets
      if (!isOrigin) {
        this.createFlightRoute(originPos, pos, globeRadius, city);
      }
    });

    // 7. Continuous Orbital Cruising Airplanes (Circling 360° around the globe)
    this.createOrbitalCruisers(globeRadius);

    // 8. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(25, 45, 35);
    this.scene.add(dirLight);

    // Set initial view to focus on Hanoi smoothly
    this.focusCity('hanoi', false);

    this.initInteraction();
    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  // Generate 850 soft glowing constellation dots over the globe
  createPointClouds(radius) {
    const dotCount = 850;
    const positions = [];
    const colors = [];
    const baseColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / dotCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = -(radius * 1.008 * Math.sin(phi) * Math.cos(theta));
      const z = radius * 1.008 * Math.sin(phi) * Math.sin(theta);
      const y = radius * 1.008 * Math.cos(phi);

      positions.push(x, y, z);
      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }

    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    dotsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const dotsMat = new THREE.PointsMaterial({
      size: 0.36,
      vertexColors: true,
      transparent: true,
      opacity: 0.45
    });
    const pointsMesh = new THREE.Points(dotsGeo, dotsMat);
    this.globeGroup.add(pointsMesh);
  }

  // Pulsing sonar radar waves radiating from FTU Hanoi
  createOriginRipple(originPos) {
    const ringGeo = new THREE.RingGeometry(0.35, 0.55, 20);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.originRipple = new THREE.Mesh(ringGeo, ringMat);
    this.originRipple.position.copy(originPos.clone().multiplyScalar(1.012));
    this.originRipple.lookAt(originPos.clone().multiplyScalar(2));
    this.globeGroup.add(this.originRipple);
  }

  createDestRipple() {
    const ringGeo = new THREE.RingGeometry(0.35, 0.55, 20);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.destRipple = new THREE.Mesh(ringGeo, ringMat);
    this.destRipple.visible = false;
    this.globeGroup.add(this.destRipple);
  }

  // Build 3D Supersonic Jet model from native geometries
  createMiniJetMesh(color = 0xf59e0b) {
    const jetGroup = new THREE.Group();

    // Fuselage Cone
    const bodyGeo = new THREE.ConeGeometry(0.24, 1.15, 7);
    bodyGeo.rotateX(Math.PI / 2); // Point along +Z
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    jetGroup.add(body);

    // Delta Wings
    const wingGeo = new THREE.BoxGeometry(1.25, 0.04, 0.44);
    const wingMat = new THREE.MeshBasicMaterial({ color: color });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, -0.15);
    jetGroup.add(wings);

    // Tail Fin
    const tailGeo = new THREE.BoxGeometry(0.04, 0.36, 0.28);
    const tail = new THREE.Mesh(tailGeo, wingMat);
    tail.position.set(0, 0.16, -0.4);
    jetGroup.add(tail);

    return jetGroup;
  }

  // Create curved 3D CatmullRom flight arc and cruising jet
  createFlightRoute(p1, p2, radius, city) {
    const distance = p1.distanceTo(p2);
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const altitude = radius + (distance * 0.24);
    midPoint.normalize().multiplyScalar(altitude);

    const curve = new THREE.CatmullRomCurve3([p1, midPoint, p2]);
    const points = curve.getPoints(36);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

    const baseMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45
    });

    const flightArc = new THREE.Line(curveGeo, baseMat);
    this.arcsGroup.add(flightArc);

    // Mini Jetliner cruising along arc
    const jet = this.createMiniJetMesh(0xf59e0b);
    this.jetsGroup.add(jet);

    this.flightRoutes.push({
      cityId: city.id,
      city: city,
      arc: flightArc,
      curve: curve,
      jet: jet,
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.002
    });
  }

  // Continuous orbital cruising jetliners orbiting 360° around the globe
  createOrbitalCruisers(radius) {
    this.orbitalPlanes = [];

    // Orbit 1: Inclined at 28 degrees, radius 18.2
    const orbit1Group = new THREE.Group();
    orbit1Group.rotation.z = Math.PI / 6.5;
    orbit1Group.rotation.x = Math.PI / 10;
    this.globeGroup.add(orbit1Group);

    const jet1 = this.createMiniJetMesh(0xf59e0b); // Gold jet
    orbit1Group.add(jet1);
    this.orbitalPlanes.push({
      group: orbit1Group,
      mesh: jet1,
      angle: Math.random() * Math.PI * 2,
      radius: radius + 2.2,
      speed: 0.0065
    });

    // Orbit 2: Inclined at -32 degrees, radius 18.8
    const orbit2Group = new THREE.Group();
    orbit2Group.rotation.z = -Math.PI / 5.5;
    orbit2Group.rotation.y = Math.PI / 7;
    this.globeGroup.add(orbit2Group);

    const jet2 = this.createMiniJetMesh(0x0284c7); // Sky blue jet
    orbit2Group.add(jet2);
    this.orbitalPlanes.push({
      group: orbit2Group,
      mesh: jet2,
      angle: Math.random() * Math.PI * 2,
      radius: radius + 2.6,
      speed: 0.0052
    });
  }

  // Smoothly rotate the globe to face target city
  focusCity(cityId, animate = true) {
    const city = this.cities.find(c => c.id === cityId);
    if (!city) return;

    this.activeCityId = cityId;

    // Update Pills in UI
    document.querySelectorAll('.globe-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.city === cityId);
    });

    // Update Route Status label
    const routeLabel = document.getElementById('globeRouteLabel');
    if (routeLabel) {
      if (city.isOrigin) {
        routeLabel.textContent = `8 Tuyến kết nối toàn cầu • Gốc: Hà Nội (FTU)`;
      } else {
        routeLabel.textContent = `Tuyến bay FTU ➔ ${city.name} (${city.code})`;
      }
    }

    // Target rotation math to bring (lat, lon) directly facing camera (+Z)
    const targetY = - (city.lon + 90) * (Math.PI / 180);
    const targetX = (city.lat - 8) * (Math.PI / 180);

    if (animate) {
      // Find shortest angular difference
      let diffY = (targetY - this.globeGroup.rotation.y) % (2 * Math.PI);
      if (diffY < -Math.PI) diffY += 2 * Math.PI;
      if (diffY > Math.PI) diffY -= 2 * Math.PI;

      this.targetRotY = this.globeGroup.rotation.y + diffY;
      this.targetRotX = targetX;
      this.isLerpingRotation = true;
    } else {
      this.globeGroup.rotation.y = targetY;
      this.globeGroup.rotation.x = targetX;
    }

    // Update Destination Ripple
    if (this.destRipple) {
      if (city.isOrigin) {
        this.destRipple.visible = false;
      } else {
        const destPos = this.latLonToVector3(city.lat, city.lon, 16);
        this.destRipple.position.copy(destPos.clone().multiplyScalar(1.012));
        this.destRipple.lookAt(destPos.clone().multiplyScalar(2));
        this.destRipple.visible = true;
      }
    }

    // Highlight route arc & boost jet
    this.flightRoutes.forEach(r => {
      if (r.cityId === cityId) {
        r.arc.material.color.setHex(0xf59e0b);
        r.arc.material.opacity = 0.95;
        r.speed = 0.009; // Speed up
      } else {
        r.arc.material.color.setHex(0x38bdf8);
        r.arc.material.opacity = 0.35;
        r.speed = 0.004;
      }
    });

    // Marker scale highlight
    this.cityPoints.forEach(m => {
      if (m.userData.id === cityId) {
        m.scale.set(1.5, 1.5, 1.5);
      } else {
        m.scale.set(1.0, 1.0, 1.0);
      }
    });
  }

  initDOMControls() {
    // City Selector Pills
    document.querySelectorAll('.globe-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cityId = btn.getAttribute('data-city');
        this.focusCity(cityId, true);
        if (window.SoundFXEngine) {
          const sfx = new window.SoundFXEngine();
          sfx.playAirportChime();
        }
      });
    });

    // Zoom In
    const zoomInBtn = document.getElementById('globeZoomIn');
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        this.camera.position.z = Math.max(this.minCameraZ, this.camera.position.z - 4);
      });
    }

    // Zoom Out
    const zoomOutBtn = document.getElementById('globeZoomOut');
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.camera.position.z = Math.min(this.maxCameraZ, this.camera.position.z + 4);
      });
    }

    // Reset View
    const resetBtn = document.getElementById('globeResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.camera.position.z = this.defaultCameraZ;
        this.focusCity('hanoi', true);
      });
    }

    // Auto-spin Toggle
    const spinToggleBtn = document.getElementById('globeSpinToggle');
    if (spinToggleBtn) {
      spinToggleBtn.addEventListener('click', () => {
        this.isAutoSpinning = !this.isAutoSpinning;
        spinToggleBtn.textContent = this.isAutoSpinning ? '⏸' : '▶';
        spinToggleBtn.setAttribute('title', this.isAutoSpinning ? 'Tạm dừng xoay' : 'Tiếp tục tự động xoay');
      });
    }
  }

  initVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    observer.observe(this.container);
  }

  initInteraction() {
    // Mouse wheel zoom
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.04;
      this.camera.position.z = Math.min(this.maxCameraZ, Math.max(this.minCameraZ, this.camera.position.z + delta));
    }, { passive: false });

    // Drag rotation
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.isLerpingRotation = false;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;

      this.globeGroup.rotation.y += deltaX * 0.006;
      this.globeGroup.rotation.x += deltaY * 0.006;

      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch support
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.isLerpingRotation = false;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.prevMouseX;
      const deltaY = e.touches[0].clientY - this.prevMouseY;

      this.globeGroup.rotation.y += deltaX * 0.006;
      this.globeGroup.rotation.x += deltaY * 0.006;

      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Raycasting for City Marker Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.container.addEventListener('mousemove', (e) => {
      if (this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.cityPoints);

      if (intersects.length > 0) {
        const city = intersects[0].object.userData;
        this.canvas.style.cursor = 'pointer';
        if (this.infoBox) {
          this.infoBox.innerHTML = `<strong>${city.flag} ${city.name}</strong><span>${city.univ} • ${city.distance}</span>`;
          this.infoBox.classList.add('show');
        }
      } else {
        this.canvas.style.cursor = 'grab';
        if (this.infoBox) {
          this.infoBox.classList.remove('show');
        }
      }
    });

    this.container.addEventListener('click', (e) => {
      if (this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.cityPoints);

      if (intersects.length > 0) {
        const city = intersects[0].object.userData;
        this.focusCity(city.id, true);
        if (window.SoundFXEngine) {
          const sfx = new window.SoundFXEngine();
          sfx.playAirportChime();
        }
      }
    });
  }

  onResize() {
    if (!this.camera || !this.renderer || !this.container) return;
    const width = this.container.clientWidth || 460;
    const height = this.container.clientHeight || 440;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Do NOT render when scrolled away! 0% GPU idle!
    if (!this.isVisible) return;

    // Smooth Lerp Rotation to Focus City
    if (this.isLerpingRotation && this.targetRotY !== null && this.targetRotX !== null) {
      this.globeGroup.rotation.y += (this.targetRotY - this.globeGroup.rotation.y) * 0.08;
      this.globeGroup.rotation.x += (this.targetRotX - this.globeGroup.rotation.x) * 0.08;

      if (
        Math.abs(this.targetRotY - this.globeGroup.rotation.y) < 0.002 &&
        Math.abs(this.targetRotX - this.globeGroup.rotation.x) < 0.002
      ) {
        this.globeGroup.rotation.y = this.targetRotY;
        this.globeGroup.rotation.x = this.targetRotX;
        this.isLerpingRotation = false;
      }
    } else if (!this.isDragging && this.isAutoSpinning) {
      // Gentle idle auto-spin
      this.globeGroup.rotation.y += this.autoSpinSpeed;
    }

    // Animate Origin Sonar Ripple Wave
    if (this.originRipple) {
      this.rippleScale += 0.022;
      if (this.rippleScale > 3.0) this.rippleScale = 1.0;
      this.originRipple.scale.set(this.rippleScale, this.rippleScale, 1);
      this.originRipple.material.opacity = Math.max(0, 0.85 * (1 - (this.rippleScale - 1) / 2));
    }

    // Animate Active Destination Ripple
    if (this.destRipple && this.destRipple.visible) {
      this.destRippleScale += 0.025;
      if (this.destRippleScale > 2.6) this.destRippleScale = 1.0;
      this.destRipple.scale.set(this.destRippleScale, this.destRippleScale, 1);
      this.destRipple.material.opacity = Math.max(0, 0.8 * (1 - (this.destRippleScale - 1) / 1.6));
    }

    // Animate Continuous Orbital Cruisers circling the globe
    if (this.orbitalPlanes) {
      this.orbitalPlanes.forEach(p => {
        p.angle += p.speed;
        const x = Math.cos(p.angle) * p.radius;
        const z = Math.sin(p.angle) * p.radius;
        p.mesh.position.set(x, 0, z);

        // Orient nose tangent to circular orbit
        const nextX = Math.cos(p.angle + 0.05) * p.radius;
        const nextZ = Math.sin(p.angle + 0.05) * p.radius;
        p.mesh.lookAt(nextX, 0, nextZ);
      });
    }

    // Animate Mini Supersonic Jetliners along Flight Arcs
    this.flightRoutes.forEach(r => {
      r.progress += r.speed;
      if (r.progress >= 1.0) r.progress = 0;

      const pos = r.curve.getPointAt(r.progress);
      r.jet.position.copy(pos);

      // Orient Jet nose along the trajectory curve
      const nextProgress = Math.min(1.0, r.progress + 0.015);
      const nextPos = r.curve.getPointAt(nextProgress);
      r.jet.lookAt(nextPos);
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.GoGlobalGlobe = GoGlobalGlobe;
