/**
 * FULL-SCREEN CINEMATIC FLIGHT 3D SIMULATION (Three.js)
 * High-performance: Only renders during active flight transitions (2.8s)
 * Zero idle GPU usage when reading the page.
 */

// Procedural 3D airliner builder
function createJetlinerMesh() {
  const airplane = new THREE.Group();

  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.15
  });

  const blueStripeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3,
    metalness: 0.2
  });

  const darkGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.9
  });

  const engineGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.8
  });

  // 1. Fuselage
  const bodyGeo = new THREE.CylinderGeometry(2.2, 1.6, 26, 20);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, fuselageMat);
  airplane.add(body);

  // 2. Nose
  const noseGeo = new THREE.ConeGeometry(2.2, 6, 20);
  noseGeo.rotateX(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, fuselageMat);
  nose.position.z = 15;
  airplane.add(nose);

  // 3. Cockpit
  const cockpitGeo = new THREE.SphereGeometry(2.0, 14, 10, 0, Math.PI);
  const cockpit = new THREE.Mesh(cockpitGeo, darkGlassMat);
  cockpit.scale.set(0.9, 0.6, 1.4);
  cockpit.position.set(0, 1.1, 11);
  cockpit.rotation.x = -0.3;
  airplane.add(cockpit);

  // 4. Stripe
  const stripeGeo = new THREE.CylinderGeometry(2.24, 2.0, 5, 20);
  stripeGeo.rotateX(Math.PI / 2);
  const stripe = new THREE.Mesh(stripeGeo, blueStripeMat);
  stripe.position.z = 1;
  airplane.add(stripe);

  // 5. Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(24, -8);
  wingShape.lineTo(23, -11);
  wingShape.lineTo(0, -6);
  wingShape.closePath();

  const extrudeSettings = { depth: 0.45, bevelEnabled: false };
  const rightWingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
  rightWingGeo.rotateX(Math.PI / 2);

  const rightWing = new THREE.Mesh(rightWingGeo, fuselageMat);
  rightWing.position.set(1.5, -0.2, 3);
  airplane.add(rightWing);

  const leftWingGeo = rightWingGeo.clone();
  leftWingGeo.scale(-1, 1, 1);
  const leftWing = new THREE.Mesh(leftWingGeo, fuselageMat);
  leftWing.position.set(-1.5, -0.2, 3);
  airplane.add(leftWing);

  // Winglets
  const wingletGeo = new THREE.BoxGeometry(0.3, 2.4, 1.6);
  const rightWinglet = new THREE.Mesh(wingletGeo, blueStripeMat);
  rightWinglet.position.set(24.5, 1.0, -6.5);
  rightWinglet.rotation.z = -0.3;
  airplane.add(rightWinglet);

  const leftWinglet = new THREE.Mesh(wingletGeo, blueStripeMat);
  leftWinglet.position.set(-24.5, 1.0, -6.5);
  leftWinglet.rotation.z = 0.3;
  airplane.add(leftWinglet);

  // 6. Engines
  const engineGeo = new THREE.CylinderGeometry(1.0, 0.9, 5.5, 14);
  engineGeo.rotateX(Math.PI / 2);

  const rightEngine = new THREE.Mesh(engineGeo, fuselageMat);
  rightEngine.position.set(8.5, -1.8, 1);
  airplane.add(rightEngine);

  const leftEngine = new THREE.Mesh(engineGeo, fuselageMat);
  leftEngine.position.set(-8.5, -1.8, 1);
  airplane.add(leftEngine);

  // Exhaust Glows
  const exhaustGeo = new THREE.CircleGeometry(0.85, 12);
  const rightExhaust = new THREE.Mesh(exhaustGeo, engineGlowMat);
  rightExhaust.position.set(8.5, -1.8, -1.8);
  rightExhaust.rotation.y = Math.PI;
  airplane.add(rightExhaust);

  const leftExhaust = new THREE.Mesh(exhaustGeo, engineGlowMat);
  leftExhaust.position.set(-8.5, -1.8, -1.8);
  leftExhaust.rotation.y = Math.PI;
  airplane.add(leftExhaust);

  // 7. Tail Fin
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(0, 9);
  tailShape.lineTo(-5.5, 9);
  tailShape.lineTo(-9, 0);
  tailShape.closePath();

  const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.35, bevelEnabled: false });
  tailGeo.rotateY(Math.PI / 2);
  const tailFin = new THREE.Mesh(tailGeo, blueStripeMat);
  tailFin.position.set(0.18, 1.8, -7);
  airplane.add(tailFin);

  const starGeo = new THREE.SphereGeometry(0.65, 8, 8);
  const tailStar = new THREE.Mesh(starGeo, goldAccentMat);
  tailStar.position.set(0, 7.5, -10.5);
  airplane.add(tailStar);

  // 8. Horizontal Stabilizers
  const hTailGeo = new THREE.BoxGeometry(11, 0.3, 3.2);
  const hTail = new THREE.Mesh(hTailGeo, fuselageMat);
  hTail.position.set(0, 1.8, -11.5);
  airplane.add(hTail);

  airplane.scale.set(0.72, 0.72, 0.72);
  return airplane;
}

class Flight3DEngine {
  constructor() {
    this.canvas = document.getElementById('flight3dCanvas');
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.airplane = null;
    this.clouds = [];
    this.animId = null;
    this.isFlying = false;

    this.init();
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 16, 70);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.1);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(40, 60, 50);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-30, -20, -30);
    this.scene.add(rimLight);

    this.airplane = createJetlinerMesh();
    this.scene.add(this.airplane);

    this.buildClouds();
    this.buildContrails();

    window.addEventListener('resize', () => this.onResize());
  }

  buildClouds() {
    const cloudGeo = new THREE.DodecahedronGeometry(6.5, 1);
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });

    for (let i = 0; i < 24; i++) {
      const cloudGroup = new THREE.Group();
      const numPuffs = 3 + Math.floor(Math.random() * 3);

      for (let j = 0; j < numPuffs; j++) {
        const puff = new THREE.Mesh(cloudGeo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 6
        );
        const s = 0.6 + Math.random() * 0.8;
        puff.scale.set(s, s * 0.7, s);
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        -90 + Math.random() * 180,
        -18 + Math.random() * 40,
        -55 + Math.random() * 80
      );
      this.clouds.push(cloudGroup);
      this.scene.add(cloudGroup);
    }
  }

  buildContrails() {
    const particleCount = 70;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = -i * 1.6;

      colors[i * 3] = 0.85;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 1.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.rightContrail = new THREE.Points(geo, mat);
    this.leftContrail = new THREE.Points(geo.clone(), mat);

    this.scene.add(this.rightContrail);
    this.scene.add(this.leftContrail);
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Slower, smoother, majestic flight transition (2.8 seconds)
   * ONLY renders during this active period to save 100% of GPU resources at all other times!
   */
  startFlightTransition(onComplete) {
    if (!this.airplane) return;
    this.isFlying = true;
    const startTime = performance.now();
    const flightDuration = 2800; // 2.8s

    this.airplane.position.set(-75, -10, -20);
    this.airplane.rotation.set(0.12, 0.4, -0.42);

    if (this.animId) cancelAnimationFrame(this.animId);

    const animateFlight = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / flightDuration, 1.0);

      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.airplane.position.x = -75 + ease * 160;
      this.airplane.position.y = -10 + Math.sin(t * Math.PI) * 18 + (t * 6);
      this.airplane.position.z = -20 + Math.sin(t * Math.PI * 0.9) * 32;

      this.airplane.rotation.z = -0.42 + (1 - t) * 0.28 + Math.sin(t * Math.PI) * 0.32;
      this.airplane.rotation.y = 0.32 + (1 - ease) * 0.18;
      this.airplane.rotation.x = 0.1 - (t * 0.18);

      this.clouds.forEach(cloud => {
        cloud.position.x -= 0.45;
        if (cloud.position.x < -90) cloud.position.x = 90;
      });

      if (this.rightContrail && this.leftContrail) {
        const rightEnginePos = new THREE.Vector3(6, -1.2, -2).applyMatrix4(this.airplane.matrixWorld);
        const leftEnginePos = new THREE.Vector3(-6, -1.2, -2).applyMatrix4(this.airplane.matrixWorld);

        this.rightContrail.position.copy(rightEnginePos);
        this.leftContrail.position.copy(leftEnginePos);
        this.rightContrail.rotation.copy(this.airplane.rotation);
        this.leftContrail.rotation.copy(this.airplane.rotation);
      }

      this.camera.position.x = this.airplane.position.x * 0.18;
      this.camera.lookAt(this.airplane.position.x * 0.4, this.airplane.position.y * 0.25, 0);

      this.renderer.render(this.scene, this.camera);

      if (t < 1.0) {
        this.animId = requestAnimationFrame(animateFlight);
      } else {
        this.isFlying = false;
        // Stop rendering when finished! Zero GPU usage!
        if (typeof onComplete === 'function') onComplete();
      }
    };

    this.animId = requestAnimationFrame(animateFlight);
  }
}

window.Flight3DEngine = Flight3DEngine;
