import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./ParticleBackground.module.css";

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 120;
const ACCENT = new THREE.Color(0xe8590a);
const DIM = new THREE.Color(0x333333);

export default function ParticleBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    const W = el.clientWidth;
    const H = el.clientHeight;

    // scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // particles
    const positions = [];
    const velocities = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions.push(
        (Math.random() - 0.5) * W,
        (Math.random() - 0.5) * H,
        (Math.random() - 0.5) * 200
      );
      velocities.push(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        0
      );
    }

    const pGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(positions);
    pGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x555555,
      size: 2.5,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // lines geometry (dynamic)
    const maxLines = PARTICLE_COUNT * PARTICLE_COUNT;
    const linePos = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lMat = new THREE.LineSegments(
      lGeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
      })
    );
    scene.add(lMat);

    // mouse influence
    let mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * W;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * H;
    };
    window.addEventListener("mousemove", onMouseMove);

    // resize
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // animate
    let animId;
    const tmp = new THREE.Vector3();

    function animate() {
      animId = requestAnimationFrame(animate);

      const pos = pGeo.attributes.position.array;

      // move particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        pos[ix]     += velocities[ix];
        pos[ix + 1] += velocities[ix + 1];

        // slight attraction toward mouse
        const dx = mouse.x - pos[ix];
        const dy = mouse.y - pos[ix + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          pos[ix]     += (dx / dist) * 0.08;
          pos[ix + 1] += (dy / dist) * 0.08;
        }

        // wrap edges
        if (pos[ix] > W / 2)  pos[ix] = -W / 2;
        if (pos[ix] < -W / 2) pos[ix] = W / 2;
        if (pos[ix + 1] > H / 2)  pos[ix + 1] = -H / 2;
        if (pos[ix + 1] < -H / 2) pos[ix + 1] = H / 2;
      }
      pGeo.attributes.position.needsUpdate = true;

      // update lines
      let lineIdx = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const ix = i * 3, jx = j * 3;
          const dx = pos[ix] - pos[jx];
          const dy = pos[ix + 1] - pos[jx + 1];
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < CONNECTION_DISTANCE) {
            const alpha = 1 - d / CONNECTION_DISTANCE;
            const col = lineIdx < 30 ? ACCENT : DIM;

            linePos[lineIdx * 6]     = pos[ix];
            linePos[lineIdx * 6 + 1] = pos[ix + 1];
            linePos[lineIdx * 6 + 2] = pos[ix + 2];
            linePos[lineIdx * 6 + 3] = pos[jx];
            linePos[lineIdx * 6 + 4] = pos[jx + 1];
            linePos[lineIdx * 6 + 5] = pos[jx + 2];

            lineColors[lineIdx * 6]     = col.r * alpha;
            lineColors[lineIdx * 6 + 1] = col.g * alpha;
            lineColors[lineIdx * 6 + 2] = col.b * alpha;
            lineColors[lineIdx * 6 + 3] = col.r * alpha;
            lineColors[lineIdx * 6 + 4] = col.g * alpha;
            lineColors[lineIdx * 6 + 5] = col.b * alpha;

            lineIdx++;
            if (lineIdx >= maxLines / 2) break;
          }
        }
        if (lineIdx >= maxLines / 2) break;
      }

      lGeo.attributes.position.needsUpdate = true;
      lGeo.attributes.color.needsUpdate = true;
      lGeo.setDrawRange(0, lineIdx * 2);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={styles.bg} />;
}
