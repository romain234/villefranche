// Lecteur vidéo 360° simple
class Video360Player {
  constructor(containerId, videoUrl) {
    this.container = document.getElementById(containerId);
    this.videoUrl = videoUrl;
    this.isMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    
    this.init();
  }

  init() {
    // Scene Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 0.1;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x000000);
    this.container.appendChild(this.renderer.domElement);

    // Créer la vidéo HTML5
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.autoplay = false;
    video.controls = false;
    video.loop = true;
    video.src = this.videoUrl;
    
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Créer une sphère pour la vidéo 360°
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1); // Inverser pour voir de l'intérieur

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    this.scene.add(sphere);

    this.video = video;
    this.video.addEventListener('playing', () => {
      console.log("Vidéo en cours de lecture");
    });

    // Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.container.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('mouseup', () => this.onMouseUp());
    this.container.addEventListener('touchstart', (e) => this.onTouchStart(e));
    this.container.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.container.addEventListener('touchend', () => this.onTouchEnd());
    this.container.addEventListener('wheel', (e) => this.onMouseWheel(e));

    // Démarrer l'animation
    this.animate();
  }

  onMouseDown(e) {
    this.isMouseDown = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  onMouseMove(e) {
    if (!this.isMouseDown) return;

    const deltaX = e.clientX - this.mouseX;
    const deltaY = e.clientY - this.mouseY;

    this.targetRotationY += deltaX * 0.01;
    this.targetRotationX += deltaY * 0.01;

    // Limiter la rotation verticale
    this.targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotationX));

    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  onMouseUp() {
    this.isMouseDown = false;
  }

  onTouchStart(e) {
    this.isMouseDown = true;
    this.mouseX = e.touches[0].clientX;
    this.mouseY = e.touches[0].clientY;
  }

  onTouchMove(e) {
    if (!this.isMouseDown) return;

    const deltaX = e.touches[0].clientX - this.mouseX;
    const deltaY = e.touches[0].clientY - this.mouseY;

    this.targetRotationY += deltaX * 0.01;
    this.targetRotationX += deltaY * 0.01;

    this.targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotationX));

    this.mouseX = e.touches[0].clientX;
    this.mouseY = e.touches[0].clientY;
  }

  onTouchEnd() {
    this.isMouseDown = false;
  }

  onMouseWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const currentFOV = this.camera.fov + (e.deltaY > 0 ? zoomSpeed : -zoomSpeed);
    this.camera.fov = Math.max(20, Math.min(120, currentFOV));
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smooth rotation
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.1;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.currentRotationY;
    this.camera.rotation.x = this.currentRotationX;

    this.renderer.render(this.scene, this.camera);
  }

  play() {
    if (this.video) {
      this.video.play();
    }
  }

  pause() {
    if (this.video) {
      this.video.pause();
    }
  }

  stop() {
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
    }
  }

  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
