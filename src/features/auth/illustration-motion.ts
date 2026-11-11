import {
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Texture,
  WebGLRenderer,
} from 'three';

// A single image-backed plane preserves the approved illustration and its alpha.
export function animateIllustration(element: HTMLElement, image: HTMLImageElement) {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.z = 5;
  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  const geometry = new PlaneGeometry(3.05, 3.05);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const plane = new Mesh(geometry, material);
  scene.add(plane);
  const canvas = renderer.domElement;
  element.append(canvas);
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let visible = true;
  let stopped = false;
  let pointerX = 0;
  let pointerY = 0;

  const resize = () => {
    const { width, height } = element.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const draw = (now: number) => {
    frame = 0;
    if (stopped || !visible || document.hidden) return;
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;
    elapsed += delta;
    // An eight-second float, with damped cursor movement instead of abrupt rotation.
    plane.position.y = Math.sin((elapsed * Math.PI) / 4) * 0.045;
    plane.rotation.x = MathUtils.damp(plane.rotation.x, -pointerY * 0.07, 3, delta);
    plane.rotation.y = MathUtils.damp(plane.rotation.y, pointerX * 0.1, 3, delta);
    plane.rotation.z = Math.sin((elapsed * Math.PI) / 6) * 0.012;
    renderer.render(scene, camera);
    element.dataset.animated = 'true';
    frame = requestAnimationFrame(draw);
  };
  const resume = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (!stopped && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const rect = element.getBoundingClientRect();
    pointerX = MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointerY = MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  };
  const leave = () => {
    pointerX = 0;
    pointerY = 0;
  };
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  const observer = new ResizeObserver(resize);
  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    intersection.disconnect();
    observer.disconnect();
    document.removeEventListener('visibilitychange', resume);
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerleave', leave);
    canvas.removeEventListener('webglcontextlost', cleanup);
    delete element.dataset.animated;
    canvas.remove();
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
  };
  canvas.addEventListener('webglcontextlost', cleanup);
  document.addEventListener('visibilitychange', resume);
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerleave', leave);
  observer.observe(element);
  intersection.observe(element);
  resize();
  resume();
  return cleanup;
}
