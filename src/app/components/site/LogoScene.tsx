import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * 3D Strativu mark — tam ekran, sabit fon səhnəsi (azcon.gov.az-dakı `#scene` kimi).
 *
 * Quruluş:
 *   <LogoScene/>        → position: fixed; inset: 0; z-index: 0   (bütün kontentin ARXASINDA)
 *   <main/>, <footer/>  → position: relative; z-index: 10         (səhnənin ÜSTÜNDƏ)
 *
 * Davranış (aşağıdakı CHOREO cədvəli ilə idarə olunur):
 *  - Ana səhifə açılanda loqo böyük və parlaqdır (hero).
 *  - Scroll etdikcə loqo fırlanır və kənara, məzmunun arxasına keçir (solğunlaşır).
 *  - Səhifənin sonunda (closing CTA) mərkəzə qayıdır və üzü yenidən qabağa dönür.
 *  - Siçanı hərəkət etdirdikdə loqo yüngülcə ona tərəf əyilir.
 *  - Səhifə dəyişəndə loqo yeni pozaya yumşaq "uçur".
 *
 * Model: `public/models/strativu-mark.glb` (bax: tools/logo3d/README.md). Ön/arxa üz orijinal
 * artwork teksturasıdır və işıqsız render olunur ki, rənglər loqo ilə eyni qalsın.
 *
 * Performans: three.js yalnız səhifə yüklənib boşalandan sonra dinamik import olunur;
 * `prefers-reduced-motion` və ya WebGL yoxdursa qurulmur; mobildə 30 fps; tab gizli olanda render yoxdur.
 */

const MODEL_URL = "/models/strativu-mark.glb";

/** Loqodan ölçülmüş rənglər (public/brand/mark-texture.png). */
const BRAND_CYAN = "#03C1FD"; // dairələr və yuxarı qanadlar
const BRAND_DEEP = "#0159C5"; // içəri dağ / aşağı mavi

/* ── Tənzimləmə ── */
/**
 * Scroll xoreoqrafiyası (azcon.gov.az üslubu): loqo səhifə boyu "səyahət" edir.
 * Hər poza: x/y → mərkəzdən sürüşmə (ekran eni/hündürlüyünün payı, x sağa, y yuxarı),
 * size → loqonun ölçüsü (ekran hündürlüyünün payı), op → şəffaflıq (0–1).
 *
 *   hero  → səhifə açılanda (scroll = 0)
 *   rest  → bir ekran aşağı scroll edəndən sonra, məzmunun arxasında (solğun)
 *   end   → `data-logo-stage` elementi ekrana gələndə (ana səhifədə closing CTA): mərkəzə qayıdır
 *           və həmin bölmə ilə birlikdə yuxarı qalxır, footer-in üstünə düşmür.
 */
type Pose = { x: number; y: number; size: number; op: number };
type Choreo = { hero: Pose; rest: Pose; end?: Pose };

const CHOREO: Record<"home" | "page", { desktop: Choreo; mobile: Choreo }> = {
  home: {
    desktop: {
      hero: { x: 0.28, y: 0.0, size: 0.46, op: 1 },
      rest: { x: -0.33, y: 0.04, size: 0.34, op: 0.28 },
      end: { x: 0, y: 0.17, size: 0.34, op: 0.95 },
    },
    mobile: {
      hero: { x: 0, y: 0.27, size: 0.26, op: 1 },
      rest: { x: 0.2, y: 0.12, size: 0.3, op: 0.14 },
      end: { x: 0, y: 0.24, size: 0.24, op: 0.85 },
    },
  },
  page: {
    desktop: {
      hero: { x: 0.31, y: 0.04, size: 0.36, op: 0.8 },
      rest: { x: 0.34, y: 0.0, size: 0.3, op: 0.18 },
    },
    mobile: {
      hero: { x: 0.26, y: 0.32, size: 0.15, op: 0.55 },
      rest: { x: 0.26, y: 0.2, size: 0.2, op: 0.1 },
    },
  },
};

/** Baxış bucağı (radian). */
const BASE_ROT_Y = -0.34;
const BASE_ROT_X = 0.1;
/** Scroll ilə fırlanma: hər ekran hündürlüyü scroll üçün neçə radian (≈ 5 ekranda tam dövr). */
const SPIN_PER_SCREEN = 1.25;
/** Siçan ilə əyilmə (radian). 0 = söndürülür. */
const TILT = 0.14;
/** Hərəkətin yumşaqlığı: böyük → daha sürətli izləyir. */
const FOLLOW = 5.5;
/** Yavaş "nəfəs" hərəkəti (radian / ekran payı). */
const SWAY = 0.05;
const BOB = 0.006;
/** Bloom. strength: parıltının gücü, radius: yayılma, threshold: hansı parlaqlıqdan yuxarı parıldasın (0-1). */
const BLOOM = { strength: 0.5, radius: 0.65, threshold: 0.5 };
const BLOOM_MOBILE = { strength: 0.35, radius: 0.5, threshold: 0.56 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  size: mix(a.size, b.size, t),
  op: mix(a.op, b.op, t),
});

export function LogoScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const modeRef = useRef<"home" | "page">(pathname === "/" ? "home" : "page");
  modeRef.current = pathname === "/" ? "home" : "page";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const narrowMq = window.matchMedia("(max-width: 767px)");

    let disposed = false;
    const cleanups: Array<() => void> = [];

    /** Wait for window load, then for an idle slot, so the 3D bundle never competes with content. */
    const whenIdle = () =>
      new Promise<void>((resolve) => {
        const idle = () => {
          if (typeof window.requestIdleCallback === "function") {
            const id = window.requestIdleCallback(() => resolve(), { timeout: 2000 });
            cleanups.push(() => window.cancelIdleCallback(id));
          } else {
            const t = window.setTimeout(resolve, 400);
            cleanups.push(() => window.clearTimeout(t));
          }
        };
        if (document.readyState === "complete") idle();
        else {
          window.addEventListener("load", idle, { once: true });
          cleanups.push(() => window.removeEventListener("load", idle));
        }
      });

    (async () => {
      await whenIdle();
      if (disposed) return;
      const THREE = await import("three");
      const [{ GLTFLoader }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] =
        await Promise.all([
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/postprocessing/EffectComposer.js"),
          import("three/examples/jsm/postprocessing/RenderPass.js"),
          import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
          import("three/examples/jsm/postprocessing/OutputPass.js"),
        ]);
      if (disposed || !hostRef.current) return;

      // ── renderer ──────────────────────────────────────────────────────────
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        return; // WebGL yoxdur — səssizcə heç nə göstərmirik
      }
      const pixelRatio = Math.min(window.devicePixelRatio, narrowMq.matches ? 1.25 : 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.NoToneMapping; // brend rəngləri olduğu kimi qalsın
      host.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
      host.style.opacity = "0";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 9);

      // İşıqlar yalnız yan üzlərə və kürələrə təsir edir.
      scene.add(new THREE.AmbientLight(0xffffff, 2.6));
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(2.6, 3.4, 4.2);
      scene.add(key);

      // ── model ─────────────────────────────────────────────────────────────
      const spin = new THREE.Group(); // bucaq
      const rig = new THREE.Group(); // mövqe / ölçü
      rig.add(spin);
      scene.add(rig);

      const disposables: Array<{ dispose: () => void }> = [];

      const gltf = await new GLTFLoader().loadAsync(MODEL_URL).catch(() => null);
      if (disposed || !gltf) {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }

      const model = gltf.scene;
      model.traverse((child) => {
        const mesh = child as import("three").Mesh;
        if (!mesh.isMesh) return;
        if (mesh.geometry) disposables.push(mesh.geometry);

        const source = mesh.material as import("three").MeshStandardMaterial;

        if (source.map) {
          // Ön/arxa üz: işıqsız → ekrandakı piksel = orijinal loqo pikseli
          const flat = new THREE.MeshBasicMaterial({ map: source.map, side: source.side, toneMapped: false });
          flat.map!.anisotropy = 8;
          mesh.material = flat;
          disposables.push(flat);
          return;
        }

        // Yan üzlər və kürələr: tutqun (mat) material, loqodan ölçülmüş rənglərlə
        const isSide = source.name === "MarkSide";
        const matte = new THREE.MeshLambertMaterial({
          color: new THREE.Color(isSide ? BRAND_DEEP : BRAND_CYAN),
          side: source.side,
        });
        mesh.material = matte;
        disposables.push(matte);
      });

      // ── post-processing: bloom ────────────────────────────────────────────
      const composer = new EffectComposer(renderer);
      composer.setPixelRatio(pixelRatio);
      composer.addPass(new RenderPass(scene, camera));
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), BLOOM.strength, BLOOM.radius, BLOOM.threshold);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
      disposables.push(composer, bloomPass);

      const applyBloomPreset = () => {
        const b = narrowMq.matches ? BLOOM_MOBILE : BLOOM;
        bloomPass.strength = b.strength;
        bloomPass.radius = b.radius;
        bloomPass.threshold = b.threshold;
      };
      applyBloomPreset();

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(box.getCenter(new THREE.Vector3()));
      spin.add(model);
      const unit = 1 / Math.max(size.x, size.y); // modelin ən böyük ölçüsü = 1 vahid

      // ── vəziyyət ──────────────────────────────────────────────────────────
      let visible = document.visibilityState === "visible";
      let viewW = 1; // z=0 müstəvisində görünən en (vahid)
      let viewH = 1;
      const pointer = { x: 0, y: 0 };
      /** Hazırkı (yumşaldılmış) vəziyyət. İlk kadrda birbaşa hədəfə qoyulur. */
      let cur: (Pose & { ry: number; rx: number }) | null = null;

      /** Scroll mövqeyindən hədəf pozanı hesablayır. */
      const target = () => {
        const vh = window.innerHeight || 1;
        const y = window.scrollY;
        const c = CHOREO[modeRef.current][narrowMq.matches ? "mobile" : "desktop"];

        const tRest = ease(clamp01(y / (vh * 0.9)));
        let pose = mixPose(c.hero, c.rest, tRest);
        let tEnd = 0;
        const stage = c.end ? document.querySelector("[data-logo-stage]") : null;
        if (c.end && stage) {
          const top = stage.getBoundingClientRect().top;
          tEnd = ease(clamp01(1 - top / (vh * 0.9)));
          pose = mixPose(pose, c.end, tEnd);
          // Bölmə yuxarı keçəndə loqo onunla birlikdə qalxır.
          if (top < 0) pose.y += -top / vh;
        }

        // Scroll ilə fırlanma; sonda üzü qabağa (ən yaxın tam dövrə) qayıdır.
        const spinY = BASE_ROT_Y + (y / vh) * SPIN_PER_SCREEN;
        const home = BASE_ROT_Y + Math.round((spinY - BASE_ROT_Y) / (Math.PI * 2)) * Math.PI * 2;
        const ry = mix(spinY, home, tEnd) + pointer.x * TILT;
        const rx = BASE_ROT_X - pointer.y * TILT * 0.6;
        return { ...pose, ry, rx };
      };

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        viewH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
        viewW = viewH * camera.aspect;
        applyBloomPreset();
      };

      const onVisibility = () => {
        visible = document.visibilityState === "visible";
      };
      const onPointer = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };

      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pointermove", onPointer, { passive: true });
      cleanups.push(() => window.removeEventListener("resize", resize));
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));
      cleanups.push(() => window.removeEventListener("pointermove", onPointer));

      resize();

      // ── kadr döngəsi ──────────────────────────────────────────────────────
      const t0 = performance.now();
      let last = t0;
      const frame = () => {
        if (!visible) return;
        const now = performance.now();
        if (narrowMq.matches && now - last < 1000 / 30) return; // mobil: 30 fps limiti
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        const t = (now - t0) / 1000;

        const goal = target();
        if (!cur) cur = { ...goal, op: 0 };
        const k = 1 - Math.exp(-dt * FOLLOW);
        cur.x = mix(cur.x, goal.x, k);
        cur.y = mix(cur.y, goal.y, k);
        cur.size = mix(cur.size, goal.size, k);
        cur.op = mix(cur.op, goal.op, k);
        cur.ry = mix(cur.ry, goal.ry, k);
        cur.rx = mix(cur.rx, goal.rx, k);

        const px = Math.min(viewH * cur.size, viewW * 0.85);
        rig.scale.setScalar(px * unit);
        rig.position.x = viewW * cur.x;
        rig.position.y = viewH * cur.y + Math.sin(t * 0.5) * viewH * BOB;
        spin.rotation.y = cur.ry + Math.sin(t * 0.35) * SWAY;
        spin.rotation.x = cur.rx + Math.sin(t * 0.22) * SWAY * 0.3;
        host.style.opacity = cur.op.toFixed(3);
        composer.render();
      };
      renderer.setAnimationLoop(frame);

      cleanups.push(() => {
        renderer.setAnimationLoop(null);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      });
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      data-logo-scene
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

export default LogoScene;
