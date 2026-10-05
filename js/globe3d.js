/**
 * GOGLOBAL 3D INTERACTIVE FLIGHT GLOBE (Three.js)
 * Visualizing Global Student Exchange Routes from Hanoi (FTU)
 * Highly optimized with IntersectionObserver (Only renders when in viewport)
 */

class GoGlobalGlobe {
  constructor() {
    this.container = document.getElementById('globeContainer');
    this.canvas = document.getElementById('globe3dCanvas');
    this.infoBox = document.getElementById('globeInfo');

    if (!this.container || !this.canvas || typeof THREE === 'undefined') return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globeGroup = null;
    this.cityPoints = [];
    this.particles = [];
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.isVisible = false; // Only render when scrolled into view!

    // City definitions (Latitude, Longitude, Program Info)
    this.cities = [
      { name: 'Hà Nội (FTU)', lat: 21.0285, lon: 105.8542, isOrigin: true, desc: 'Điểm khởi hành • Đại học Ngoại thương FTU' },
      { name: 'Tokyo, Nhật Bản', lat: 35.6762, lon: 139.6503, desc: 'Trao đổi sinh viên • Waseda / Keio University' },
      { name: 'Seoul, Hàn Quốc', lat: 37.5665, lon: 126.9780, desc: 'Chương trình giao lưu văn hóa • Yonsei / SNU' },
      { name: 'London, Vương quốc Anh', lat: 51.5074, lon: -0.1278, desc: 'Học bổng lãnh đạo trẻ • Warwick / LSE' },
      { name: 'Paris, Pháp', lat: 48.8566, lon: 2.3522, desc: 'Thương mại quốc tế • HEC Paris / Sciences Po' },
      { name: 'New York, Hoa Kỳ', lat: 40.7128, lon: -74.0060, desc: 'Kinh tế toàn cầu • Columbia / NYU Programs' },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198, desc: 'ASEAN Business Youth Forum • NUS / SMU' },
      { name: 'Sydney, Úc', lat: -33.8688, lon: 151.2093, desc: 'Kinh tế đối ngoại & Tài chính • USYD / UNSW' }
    ];

    this.init();
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
    const width = this.container.clientWidth || 440;
    const height = this.container.clientHeight || 380;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 5, 48);

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

    // 1. Core Sphere
    const globeRadius = 16;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 36, 36);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.12,
      shininess: 40
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    this.globeGroup.add(sphere);

    // 2. Wireframe / Latitude Grid
    const wireGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    this.globeGroup.add(wireframe);

    // 3. City Markers & Origin
    const originCity = this.cities[0]; // Hanoi
    const originPos = this.latLonToVector3(originCity.lat, originCity.lon, globeRadius);

    this.cities.forEach(city => {
      const pos = this.latLonToVector3(city.lat, city.lon, globeRadius);

      const markerSize = city.isOrigin ? 0.75 : 0.45;
      const markerGeo = new THREE.SphereGeometry(markerSize, 10, 10);
      const markerMat = new THREE.MeshBasicMaterial({
        color: city.isOrigin ? 0xf59e0b : 0x0284c7
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      marker.userData = city;
      this.globeGroup.add(marker);
      this.cityPoints.push(marker);

      // Connecting Flight Arcs from Hanoi to each destination
      if (!city.isOrigin) {
        this.createFlightArc(originPos, pos, globeRadius);
      }
    });

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(20, 40, 30);
    this.scene.add(dirLight);

    this.initInteraction();
    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  // Create curved 3D CatmullRom curve (Fully supported in Three.js r128)
  createFlightArc(p1, p2, radius) {
    const distance = p1.distanceTo(p2);
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const altitude = radius + (distance * 0.22);
    midPoint.normalize().multiplyScalar(altitude);

    // Use CatmullRomCurve3 which exists and is 100% stable
    const curve = new THREE.CatmullRomCurve3([p1, midPoint, p2]);
    const points = curve.getPoints(32);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

    const curveMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });

    const flightArc = new THREE.Line(curveGeo, curveMat);
    this.globeGroup.add(flightArc);

    // Animated Flight Pulse Particle
    const particleGeo = new THREE.SphereGeometry(0.32, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const pulse = new THREE.Mesh(particleGeo, particleMat);
    this.globeGroup.add(pulse);

    this.particles.push({
      mesh: pulse,
      curve: curve,
      progress: Math.random()
    });
  }

  initVisibilityObserver() {
    // Only render when globe is visible in viewport! Massive performance boost!
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    observer.observe(this.container);
  }

  initInteraction() {
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
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
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.prevMouseX;
      const deltaY = e.touches[0].clientY - this.prevMouseY;

      this.globeGroup.rotation.y += deltaX * 0.006;
      this.globeGroup.rotation.x += deltaY * 0.006;

      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Raycaster hover
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
        if (this.infoBox) {
          this.infoBox.innerHTML = `<strong>✈ ${city.name}</strong><span>${city.desc}</span>`;
          this.infoBox.classList.add('show');
        }
      } else {
        if (this.infoBox) {
          this.infoBox.classList.remove('show');
        }
      }
    });
  }

  onResize() {
    if (!this.camera || !this.renderer || !this.container) return;
    const width = this.container.clientWidth || 440;
    const height = this.container.clientHeight || 380;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Do NOT render or compute if not visible! Saves 100% of GPU/CPU when browsing other sections!
    if (!this.isVisible) return;

    if (!this.isDragging) {
      this.globeGroup.rotation.y += 0.0035;
    }

    this.particles.forEach(p => {
      p.progress += 0.0065;
      if (p.progress > 1.0) p.progress = 0;
      const point = p.curve.getPoint(p.progress);
      p.mesh.position.copy(point);
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.GoGlobalGlobe = GoGlobalGlobe;
