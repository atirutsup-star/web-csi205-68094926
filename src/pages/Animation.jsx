import { useCallback, useEffect, useRef, useState } from "react";

const W = 576, H = 432, R = 45;
const SPEED = 230; // px / second
const ITEMS = ["None", "Basketball", "Football", "Volleyball", "Human"];
const IMAGE_SRC = { Football: "/images/football.jpg", Volleyball: "/images/volleyball.jpg", Human: "/images/profile.jpg" };

// Deterministic random so the floor looks the same every time
function rng(seed) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Wooden plank floor, drawn once to an off-screen canvas
function makeFloor() {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  const rand = rng(205);
  const rowH = 16;
  g.fillStyle = "#b5936b"; g.fillRect(0, 0, W, H);
  for (let row = 0, y = 0; y < H; row++, y += rowH) {
    let x = -rand() * 200;
    while (x < W) {
      const len = 130 + rand() * 150;
      const light = 54 + rand() * 11, sat = 28 + rand() * 11, hue = 30 + rand() * 5;
      g.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
      g.fillRect(x, y, len, rowH);
      // grain
      for (let i = 0; i < 22; i++) {
        const gy = y + rand() * rowH, gx = x + rand() * len, gl = 20 + rand() * 90;
        g.strokeStyle = rand() > 0.5 ? "rgba(90,60,30,.2)" : "rgba(255,235,200,.16)";
        g.lineWidth = 0.6 + rand() * 0.7;
        g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + gl, gy + (rand() - 0.5) * 1.2); g.stroke();
      }
      // plank edges
      g.strokeStyle = "rgba(80,50,25,.28)"; g.lineWidth = 1;
      g.strokeRect(x + 0.5, y + 0.5, len, rowH);
      x += len;
    }
  }
  return c;
}

function drawBasketball(g) {
  const grad = g.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  grad.addColorStop(0, "#f59a4d"); grad.addColorStop(1, "#d9631b");
  g.fillStyle = grad; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#2b1608"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-R, 0); g.lineTo(R, 0); g.moveTo(0, -R); g.lineTo(0, R); g.stroke();
  g.beginPath(); g.arc(-R * 1.25, 0, R * 0.95, -0.95, 0.95); g.stroke();
  g.beginPath(); g.arc(R * 1.25, 0, R * 0.95, Math.PI - 0.95, Math.PI + 0.95); g.stroke();
}

export default function Animation() {
  const canvasRef = useRef(null);
  const floorRef = useRef(null);
  const imagesRef = useRef({});
  const ballRef = useRef({ x: W / 2, y: H / 2, vx: SPEED * 0.8, vy: SPEED * 0.6, angle: 0 });
  const selectedRef = useRef("None");
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState("None");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!floorRef.current) floorRef.current = makeFloor();
    g.drawImage(floorRef.current, 0, 0);

    const { x, y, angle } = ballRef.current;
    const kind = selectedRef.current;
    g.save();
    g.translate(x, y);
    if (kind === "None") {
      g.fillStyle = "#b8e6fe"; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
    } else {
      // Human keeps upright; balls spin as they roll
      g.rotate(kind === "Human" ? 0 : angle);
      if (kind === "Basketball") drawBasketball(g);
      else {
        const img = imagesRef.current[kind];
        g.save();
        g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.clip();
        if (img && img.complete && img.naturalWidth) {
          const s = Math.max((R * 2) / img.naturalWidth, (R * 2) / img.naturalHeight);
          g.drawImage(img, -img.naturalWidth * s / 2, -img.naturalHeight * s / 2, img.naturalWidth * s, img.naturalHeight * s);
        } else { g.fillStyle = "#b8e6fe"; g.fillRect(-R, -R, R * 2, R * 2); }
        g.restore();
      }
    }
    g.strokeStyle = "#000"; g.lineWidth = 1.5;
    g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.stroke();
    g.restore();
  }, []);

  // Preload images, redraw when each one arrives
  useEffect(() => {
    Object.entries(IMAGE_SRC).forEach(([name, src]) => {
      const img = new Image();
      img.onload = () => draw();
      img.src = src;
      imagesRef.current[name] = img;
    });
    draw();
  }, [draw]);

  // Redraw when the chosen object changes
  useEffect(() => { selectedRef.current = selected; draw(); }, [selected, draw]);

  // Animation loop (only while playing)
  useEffect(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = ballRef.current;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
      if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); }
      if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); }
      if (b.y > H - R) { b.y = H - R; b.vy = -Math.abs(b.vy); }
      b.angle += (b.vx / R) * dt;
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, draw]);

  return (
    <section className="animationPage">
      <canvas ref={canvasRef} className="arena" width={W} height={H} aria-label="Animation court" />
      <div className="animControls">
        <button className={playing ? "animBtn pause" : "animBtn play"} onClick={() => setPlaying((v) => !v)}>{playing ? "Pause" : "Play"}</button>
        {ITEMS.map((name) => (
          <button key={name} className={"animBtn " + (name === "None" ? "neutral " : "") + (selected === name ? "chosen" : "")} onClick={() => setSelected(name)}>{name}</button>
        ))}
      </div>
    </section>
  );
}
