/**
 * Second Serve — 3D Hero Scene (Three.js r165 procedural low-poly)
 * TRD v2.0 §4.9 Specification
 * Independent module: zero dependencies on main.js / api.js / auth.js
 */

const THREE_URLS = [
  "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
  "https://unpkg.com/three@0.165.0/build/three.module.min.js"
];

function showFallback() {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.classList.add('use-fallback');
  }
}

async function loadThree() {
  for (const url of THREE_URLS) {
    try {
      const module = await import(url);
      if (module && module.Scene) return module;
    } catch (e) {
      // Try next CDN
    }
  }
  throw new Error("Three.js CDN unavailable");
}

function createCircleTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 245, 230, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 170, 70, 0.7)');
  gradient.addColorStop(1, 'rgba(255, 140, 50, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

async function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const heroEl = document.querySelector('.hero');
  if (!canvas || !heroEl) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showFallback();
    return;
  }

  let THREE;
  try {
    THREE = await loadThree();
  } catch (err) {
    console.warn("Could not load Three.js, activating static hero fallback.", err);
    showFallback();
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (webglErr) {
    console.warn("WebGL not supported, using fallback image.", webglErr);
    showFallback();
    return;
  }

  const isMobile = window.innerWidth < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(heroEl.clientWidth, heroEl.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, heroEl.clientWidth / heroEl.clientHeight, 0.1, 50);
  camera.position.set(0, 2.2, 7.5);
  camera.lookAt(0, 0.2, 0);

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xFFF2DF, 0x8A5A33, 0.95);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xFFF8EE, 1.6);
  dirLight.position.set(5, 8, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 25;
  scene.add(dirLight);

  const orangeRimLight = new THREE.PointLight(0xFF9F43, 0.7, 15);
  orangeRimLight.position.set(-4, -1, 3);
  scene.add(orangeRimLight);

  // Thali Master Group
  const thaliGroup = new THREE.Group();
  scene.add(thaliGroup);

  // Stainless Steel Thali Centerpiece
  const thaliMat = new THREE.MeshStandardMaterial({
    color: 0xE5E7EB,
    metalness: 0.88,
    roughness: 0.32
  });

  const plateBaseGeom = new THREE.CylinderGeometry(2.3, 2.05, 0.14, 48);
  const plateBase = new THREE.Mesh(plateBaseGeom, thaliMat);
  plateBase.receiveShadow = true;
  thaliGroup.add(plateBase);

  const plateRimGeom = new THREE.TorusGeometry(2.32, 0.08, 16, 48);
  const plateRim = new THREE.Mesh(plateRimGeom, thaliMat);
  plateRim.rotation.x = Math.PI / 2;
  plateRim.position.y = 0.07;
  thaliGroup.add(plateRim);

  // Food Group (placed on thali and gently floats/bobs)
  const foodItems = [];

  // 1. Apple
  const appleGroup = new THREE.Group();
  const appleGeom = new THREE.SphereGeometry(0.42, 20, 20);
  appleGeom.scale(1, 0.92, 1);
  const appleMat = new THREE.MeshStandardMaterial({
    color: 0xD92626,
    roughness: 0.35,
    metalness: 0.05
  });
  const appleMesh = new THREE.Mesh(appleGeom, appleMat);
  appleMesh.castShadow = true;
  appleGroup.add(appleMesh);

  // Apple stem & leaf
  const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x5C3818 });
  const stem = new THREE.Mesh(stemGeom, stemMat);
  stem.position.set(0, 0.42, 0);
  stem.rotation.z = -0.15;
  appleGroup.add(stem);

  const leafGeom = new THREE.ConeGeometry(0.08, 0.2, 5);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2F9E44 });
  const leaf = new THREE.Mesh(leafGeom, leafMat);
  leaf.position.set(0.08, 0.44, 0);
  leaf.rotation.z = -0.7;
  appleGroup.add(leaf);

  appleGroup.position.set(-0.85, 0.45, -0.4);
  thaliGroup.add(appleGroup);
  foodItems.push({ mesh: appleGroup, basePos: appleGroup.position.clone(), speed: 1.8, phase: 0 });

  // 2. Roti stack
  const rotiGroup = new THREE.Group();
  const rotiMat = new THREE.MeshStandardMaterial({
    color: 0xE8C07D,
    roughness: 0.88,
    metalness: 0.02
  });
  for (let r = 0; r < 3; r++) {
    const rotiGeom = new THREE.CylinderGeometry(0.72 - r * 0.03, 0.72 - r * 0.03, 0.04, 28);
    const roti = new THREE.Mesh(rotiGeom, rotiMat);
    roti.position.set(r * 0.04, r * 0.045, r * 0.02);
    roti.rotation.y = r * 0.6;
    roti.castShadow = true;
    rotiGroup.add(roti);
  }
  rotiGroup.position.set(0.65, 0.15, -0.75);
  thaliGroup.add(rotiGroup);
  foodItems.push({ mesh: rotiGroup, basePos: rotiGroup.position.clone(), speed: 1.5, phase: 1.2 });

  // 3. Fresh Crisp Carrot
  const carrotGroup = new THREE.Group();
  const carrotGeom = new THREE.ConeGeometry(0.18, 0.95, 14);
  const carrotMat = new THREE.MeshStandardMaterial({
    color: 0xF76707,
    roughness: 0.5,
    metalness: 0.05
  });
  const carrot = new THREE.Mesh(carrotGeom, carrotMat);
  carrot.rotation.x = Math.PI / 2 - 0.2;
  carrot.rotation.z = 0.6;
  carrot.castShadow = true;
  carrotGroup.add(carrot);

  // Carrot greens
  const carrotGreensMat = new THREE.MeshStandardMaterial({ color: 0x2F9E44 });
  for (let g = 0; g < 3; g++) {
    const cg = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.25, 6), carrotGreensMat);
    cg.position.set(-0.35 + g * 0.04, 0.1, -0.3 + g * 0.04);
    cg.rotation.z = -0.5 + g * 0.4;
    carrotGroup.add(cg);
  }
  carrotGroup.position.set(-0.7, 0.2, 0.65);
  thaliGroup.add(carrotGroup);
  foodItems.push({ mesh: carrotGroup, basePos: carrotGroup.position.clone(), speed: 2.1, phase: 2.4 });

  // 4. Sealed Meal Parcel Box
  const parcelGroup = new THREE.Group();
  const boxGeom = new THREE.BoxGeometry(0.85, 0.45, 0.75);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0xD4A373,
    roughness: 0.75,
    metalness: 0.0
  });
  const box = new THREE.Mesh(boxGeom, boxMat);
  box.castShadow = true;
  parcelGroup.add(box);

  // Band tape
  const tapeGeom = new THREE.BoxGeometry(0.86, 0.46, 0.15);
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0x2F9E44, roughness: 0.4 });
  const tape = new THREE.Mesh(tapeGeom, tapeMat);
  parcelGroup.add(tape);

  parcelGroup.position.set(0.65, 0.35, 0.45);
  parcelGroup.rotation.y = -0.35;
  thaliGroup.add(parcelGroup);
  foodItems.push({ mesh: parcelGroup, basePos: parcelGroup.position.clone(), speed: 1.7, phase: 3.6 });

  // Warm Golden Light Particles
  const particleCount = isMobile ? 35 : 75;
  const particleGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let p = 0; p < particleCount; p++) {
    positions[p * 3] = (Math.random() - 0.5) * 8;
    positions[p * 3 + 1] = Math.random() * 4.5 - 1;
    positions[p * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.18,
    map: createCircleTexture(THREE),
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  scene.add(particles);

  // Subtle Floor Shadow
  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 32),
    new THREE.ShadowMaterial({ opacity: 0.22 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.09;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // Parallax handling for desktop pointer
  let targetCamX = 0;
  let targetCamY = 2.2;
  const hasFinePointer = window.matchMedia('(pointer:fine)').matches;

  if (hasFinePointer) {
    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCamX = normX * 0.55;
      targetCamY = 2.2 + normY * 0.45;
    }, { passive: true });
  }

  // Animation Loop and Lifecycle
  let isRunning = true;
  let animationFrameId;
  const clock = new THREE.Clock();

  function animate() {
    if (!isRunning) return;
    const elapsed = clock.getElapsedTime();

    // Auto rotate the thali
    thaliGroup.rotation.y = elapsed * 0.16;

    // Bob individual food items gently
    for (let i = 0; i < foodItems.length; i++) {
      const item = foodItems[i];
      item.mesh.position.y = item.basePos.y + Math.sin(elapsed * item.speed + item.phase) * 0.035;
    }

    // Particles slow floating drift
    const posAttr = particleGeom.attributes.position;
    for (let p = 0; p < particleCount; p++) {
      let py = posAttr.getY(p);
      py += 0.003;
      if (py > 3.5) py = -1.2;
      posAttr.setY(p, py);
    }
    posAttr.needsUpdate = true;

    // Desktop camera lerp
    if (hasFinePointer) {
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, 0.2, 0);
    }

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame(animate);

  // Resize Handler
  function onResize() {
    const width = heroEl.clientWidth;
    const height = heroEl.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize, { passive: true });

  // IntersectionObserver to pause when out of viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!isRunning) {
          isRunning = true;
          clock.start();
          animate();
        }
      } else {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      }
    });
  }, { threshold: 0.05 });
  observer.observe(heroEl);

  // Tab visibility pause
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      if (heroEl.getBoundingClientRect().bottom > 0) {
        isRunning = true;
        clock.start();
        animate();
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero);
} else {
  initHero();
}
