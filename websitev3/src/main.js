import "./style.css";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ===================== Renderer ===================== */
const canvas = document.querySelector("#bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ===================== Scene ===================== */
const scene = new THREE.Scene();

/* ===================== Camera ===================== */
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// Camera nudged right to keep cube framed cleanly
camera.position.set(5.9, 3.4, 6.6);
camera.lookAt(3.0, 0, 0);
scene.add(camera);

/* ===================== Lighting ===================== */
scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 0.9));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(6, 8, 4);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(-6, 2, -4);
scene.add(rimLight);

/* ===================== Top Navigation ===================== */
const topNav = document.getElementById("top-nav");

function setupSectionSpy(navEl) {
  if (!navEl) return;
  const links = Array.from(navEl.querySelectorAll("a[href^=\"#\"]"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });
  };

  let ticking = false;
  const updateActive = () => {
    const targetY = window.innerHeight * 0.45;
    let current = sections[0];

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom >= targetY) {
        current = section;
      } else if (rect.top <= targetY) {
        current = section;
      }
    });

    setActive(current.id);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActive();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateActive);
  updateActive();
}
setupSectionSpy(topNav);

/* ===================== Text Overlay ===================== */
const overlayEl = document.getElementById("name-overlay");
const overlay = overlayEl
  ? {
      el: overlayEl,
      first: overlayEl.querySelector(".first"),
      last: overlayEl.querySelector(".last"),
      sub: overlayEl.querySelector(".sub"),
    }
  : null;

function updateOverlayVisibility() {
  if (!overlay || !overlay.el) return;
  const h = window.innerHeight || 1;
  const y = window.scrollY;
  const fadeStart = h * 0.15;
  const fadeEnd = h * 0.55;
  const t = Math.min(Math.max((y - fadeStart) / (fadeEnd - fadeStart), 0), 1);
  overlay.el.style.opacity = String(1 - t);
}

/* ===================== Rubik's Cube ===================== */
const COLORS = {
  R: 0xd32f2f,
  L: 0xff9800,
  U: 0xffffff,
  D: 0xffeb3b,
  F: 0x2e7d32,
  B: 0x1565c0,
};

function addSticker(parent, color, pos, rot) {
  const border = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.78),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
  );
  const sticker = new THREE.Mesh(
    new THREE.PlaneGeometry(0.70, 0.70),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  );

  border.position.copy(pos);
  border.rotation.copy(rot);
  sticker.position.copy(pos);
  sticker.rotation.copy(rot);

  const normal = new THREE.Vector3(0, 0, 1).applyEuler(rot);
  sticker.position.add(normal.multiplyScalar(0.004));

  parent.add(border);
  parent.add(sticker);
}

const RUBIK = new THREE.Group();
const RUBIK_Y_OFFSET = 0.3;

// Push cube further RIGHT to fill space
RUBIK.position.x = 6;
RUBIK.position.y = RUBIK_Y_OFFSET;
scene.add(RUBIK);

const cubeletSize = 0.95;
const gap = 0.07;
const step = cubeletSize + gap;

const cubeGeo = new RoundedBoxGeometry(cubeletSize, cubeletSize, cubeletSize, 6, 0.12);
const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x070707,
  roughness: 0.35,
  metalness: 0.1,
});

for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      const cubelet = new THREE.Mesh(cubeGeo, bodyMat);
      cubelet.position.set(x * step, y * step, z * step);

      const o = cubeletSize / 2 + 0.02;

      if (x === 1) addSticker(cubelet, COLORS.R, new THREE.Vector3(o, 0, 0), new THREE.Euler(0, Math.PI / 2, 0));
      if (x === -1) addSticker(cubelet, COLORS.L, new THREE.Vector3(-o, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0));
      if (y === 1) addSticker(cubelet, COLORS.U, new THREE.Vector3(0, o, 0), new THREE.Euler(-Math.PI / 2, 0, 0));
      if (y === -1) addSticker(cubelet, COLORS.D, new THREE.Vector3(0, -o, 0), new THREE.Euler(Math.PI / 2, 0, 0));
      if (z === 1) addSticker(cubelet, COLORS.F, new THREE.Vector3(0, 0, o), new THREE.Euler(0, 0, 0));
      if (z === -1) addSticker(cubelet, COLORS.B, new THREE.Vector3(0, 0, -o), new THREE.Euler(0, Math.PI, 0));

      RUBIK.add(cubelet);
    }
  }
}

RUBIK.rotation.set(
  THREE.MathUtils.degToRad(18),
  THREE.MathUtils.degToRad(35),
  0
);

/* ===================== Responsive Layout ===================== */
const lookAtTarget = new THREE.Vector3();

function setCamera(x, y, z, lx, ly, lz) {
  camera.position.set(x, y, z);
  lookAtTarget.set(lx, ly, lz);
  camera.lookAt(lookAtTarget);
}

function applyResponsiveLayout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = h > w;

  let cam;
  if (w >= 1100) {
    cam = { x: 5.9, y: 3.4, z: 6.6, lx: 3.0, ly: 0, lz: 0, rubikX: 6 };
  } else if (w >= 800) {
    cam = { x: 4.6, y: 3.1, z: 7.2, lx: 2.3, ly: 0, lz: 0, rubikX: 4.6 };
  } else if (w >= 600) {
    cam = { x: 3.2, y: 2.8, z: 7.8, lx: 1.6, ly: 0, lz: 0, rubikX: 3.2 };
  } else if (w >= 420) {
    cam = { x: 2.1, y: 2.6, z: 8.6, lx: 1.1, ly: 0, lz: 0, rubikX: 2.2 };
  } else {
    cam = { x: 0.0, y: 2.4, z: 9.2, lx: 0.0, ly: 0, lz: 0, rubikX: 0.0 };
  }

  if (isPortrait) {
    cam = { x: 0.0, y: 2.7, z: 9.2, lx: 0.0, ly: 0, lz: 0, rubikX: 0.0 };
  }

  setCamera(cam.x, cam.y, cam.z, cam.lx, cam.ly, cam.lz);
  RUBIK.position.x = cam.rubikX;
  RUBIK.position.y = RUBIK_Y_OFFSET;

  let scale = 1;
  if (w < 420 || (isPortrait && w < 520)) scale = 0.85;
  else if (w < 600) scale = 0.92;
  RUBIK.scale.setScalar(scale);

  if (overlay && overlay.el) {
    if (isPortrait) {
      overlay.el.style.top = "8vh";
      overlay.el.style.left = "50%";
      overlay.el.style.transform = "translate(-50%, 0)";
      overlay.el.style.textAlign = "center";
      if (overlay.sub) {
        overlay.sub.style.paddingLeft = "0";
        overlay.sub.style.marginTop = w < 420 ? "1rem" : "1.2rem";
        overlay.sub.style.letterSpacing = w < 420 ? "0.12em" : "0.16em";
      }
    } else {
      overlay.el.style.top = "50%";
      overlay.el.style.left = "6vw";
      overlay.el.style.transform = "translateY(-50%)";
      overlay.el.style.textAlign = "left";
      if (overlay.sub) {
        overlay.sub.style.paddingLeft = "0.6em";
        overlay.sub.style.marginTop = "1.6rem";
        overlay.sub.style.letterSpacing = "0.18em";
      }
    }
  }
}

function updateRendererSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ===================== Resize ===================== */
window.addEventListener("resize", () => {
  updateRendererSize();
  applyResponsiveLayout();
});

window.addEventListener("scroll", updateOverlayVisibility, { passive: true });

updateRendererSize();
applyResponsiveLayout();
updateOverlayVisibility();

/* ===================== Animate ===================== */
function animate() {
  requestAnimationFrame(animate);
  RUBIK.rotation.y += 0.002;
  renderer.render(scene, camera);
}
animate();
