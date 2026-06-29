<template>
  <div ref="container" class="pattern-3d-container">
    <div class="controls">
      <v-btn @click="resetCamera">Reset Camera</v-btn>
      <v-btn @click="toggleAnimation" :class="{ active: isAnimating }">{{ isAnimating ? 'Stop' : 'Animate' }} Construction</v-btn>
      <label>
        <input type="checkbox" v-model="showConnections" /> Show Connections
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

interface Props {
  pattern: {
    rows: Array<{
      stitches: Array<{
        type: string;
        count: number;
      }>;
      isCircular?: boolean;
    }>;
  };
}

const props = defineProps<Props>();
const container = ref<HTMLDivElement>();
const isAnimating = ref(false);
const showConnections = ref(true);
const animationProgress = ref(0);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationId: number;
let meshes: THREE.Object3D[] = [];
let connectionLines: THREE.Line[] = [];

const init3D = () => {
  if (!container.value) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  // Camera
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
  camera.position.set(20, 20, 20);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap deprecated -> use PCFShadowMap
  renderer.shadowMap.autoUpdate = true;
  renderer.shadowMap.needsUpdate = true;
  container.value.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffaa00, 0.5);
  pointLight.position.set(-10, 10, -10);
  scene.add(pointLight);


  updatePattern();
};

const createStitchMesh = (type: string, position: THREE.Vector3): THREE.Object3D => {
  const color = getStitchColor3D(type);
  const material = new THREE.MeshLambertMaterial({ color });

  if (type === 'mc') {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.15, 12, 24), material);
    torus.position.copy(position);
    torus.castShadow = true;
    torus.receiveShadow = true;
    return torus;
  }

  if (type === 'ch') {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.1, 8, 16), material);
    torus.position.copy(position);
    torus.castShadow = true;
    torus.receiveShadow = true;
    return torus;
  }

  if (type === 'sl st') {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 16), material);
    torus.position.copy(position);
    torus.castShadow = true;
    torus.receiveShadow = true;
    return torus;
  }

  if (type === 'close') {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 8, 16), new THREE.MeshPhongMaterial({ color: 0x111111 }));
    torus.position.copy(position);
    torus.castShadow = true;
    torus.receiveShadow = true;
    return torus;
  }

  if (type === 'sc') {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), material);
    cube.position.copy(position);
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube;
  }

  if (type === 'hdc') {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 10), material);
    cyl.position.copy(position);
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    return cyl;
  }

  if (type === 'dc') {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.86, 10), material);
    cyl.position.copy(position).y += 0.16;
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    return cyl;
  }

  if (type === 'tr') {
    const group = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.05, 10), material);
    cyl.position.copy(position).y += 0.25;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.25, 8), material);
    tip.position.copy(position).y += 0.7;
    group.add(cyl, tip);
    return group;
  }

  if (type === 'inc') {
    const group = new THREE.Group();
    const main = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 10), material);
    main.position.copy(position).y += 0.3;
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), material);
    top.position.copy(position).y += 0.75;
    group.add(main, top);
    return group;
  }

  if (type === 'dec') {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 10), material);
    base.position.copy(position).y += 0.25;
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), material);
    top.position.copy(position).y += 0.55;
    group.add(base, top);
    return group;
  }

  // fallback
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 8), material);
  sphere.position.copy(position);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  return sphere;
};

const createConnectionLine = (start: THREE.Vector3, end: THREE.Vector3): THREE.Line => {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 2 });
  const line = new THREE.Line(geometry, material);
  return line;
};

const updatePattern = () => {
  if (!scene) return;

  // Clear existing meshes and lines
  meshes.forEach(mesh => scene.remove(mesh));
  connectionLines.forEach(line => scene.remove(line));
  meshes = [];
  connectionLines = [];

  const stitchSpacing = 1;
  const rowSpacing = 1.5;

  const circularRows = props.pattern.rows.filter(r => r.isCircular);
  const maxCircularStitches = circularRows.length > 0 ? Math.max(...circularRows.map(r => r.stitches.reduce((sum, s) => sum + s.count, 0))) : 1;
  const circularRowCount = circularRows.length;

  let globalStitchIndex = 0;

  const rowsMeshes: Array<{ meshes: THREE.Object3D[]; direction: 'rtl' | 'ltr' }> = [];

  props.pattern.rows.forEach((row, rowIndex) => {
    let rowStitchIndex = 0;
    const rowMeshes: THREE.Object3D[] = [];
    const totalStitchesInRow = row.stitches.reduce((sum, s) => sum + s.count, 0);

    const circularRowIndex = row.isCircular ? props.pattern.rows.slice(0, rowIndex + 1).filter(r => r.isCircular).length - 1 : -1;
    const verticalCenterOffset = ((circularRowCount - 1) * rowSpacing) / 2;

    row.stitches.forEach(stitch => {
      for (let i = 0; i < stitch.count; i++) {
        let x, y, z;

        if (row.isCircular && totalStitchesInRow > 0) {
          // Arrange stitches in a circle with size based on number of stitches
          const angle = (rowStitchIndex / totalStitchesInRow) * Math.PI * 2;
          const minRadius = 1.2;
          const maxRadius = 5;
          const baseRadius = minRadius + ((totalStitchesInRow / Math.max(maxCircularStitches, 1)) * (maxRadius - minRadius));

          const normalizedRow = circularRowCount > 1 ? circularRowIndex / (circularRowCount - 1) : 0.5;
          const sphereProfile = Math.sqrt(Math.max(0, 1 - Math.pow((normalizedRow - 0.5) * 2, 2)));
          const yOffset = ((normalizedRow - 0.5) * (circularRowCount * rowSpacing));
          const radius = baseRadius * (0.6 + 0.4 * sphereProfile);

          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;
          y = yOffset;
        } else {
          // Linear arrangement
          x = (rowStitchIndex - totalStitchesInRow / 2) * stitchSpacing;
          y = 0.5;
          z = -rowIndex * rowSpacing;
        }

        const position = new THREE.Vector3(x, y, z);
        const mesh = createStitchMesh(stitch.type, position);

        // Animation: scale based on progress
        if (isAnimating.value) {
          const progress = Math.min(1, animationProgress.value - globalStitchIndex * 0.1);
          mesh.scale.setScalar(Math.max(0, progress));
        }

        scene.add(mesh);
        meshes.push(mesh);
        rowMeshes.push(mesh);

        rowStitchIndex++;
        globalStitchIndex++;
      }
    });

    // Create connections within the row
    if (showConnections.value && rowMeshes.length > 1) {
      // Determine row direction for serpentine effect (even row = right->left start)
      const rowDirection = !row.isCircular && (rowIndex % 2 === 0) ? 'rtl' : 'ltr';
      for (let i = 0; i < rowMeshes.length - 1; i++) {
        const source = rowDirection === 'rtl' ? rowMeshes[rowMeshes.length - 1 - i] : rowMeshes[i];
        const target = rowDirection === 'rtl' ? rowMeshes[rowMeshes.length - 2 - i] : rowMeshes[i + 1];
        const line = createConnectionLine(source.position, target.position);
        scene.add(line);
        connectionLines.push(line);
      }

      // If circular, connect first and last
      if (row.isCircular && rowMeshes.length > 2) {
        const closingLine = createConnectionLine(
          rowMeshes[rowMeshes.length - 1].position,
          rowMeshes[0].position
        );
        (closingLine.material as THREE.LineBasicMaterial).color.setHex(0xff0000);
        (closingLine.material as THREE.LineBasicMaterial).linewidth = 3;
        scene.add(closingLine);
        connectionLines.push(closingLine);
      }
    }

    rowsMeshes.push({ meshes: rowMeshes, direction: (!row.isCircular && rowIndex % 2 === 0) ? 'rtl' : 'ltr' });
  });

  const getExtremeMesh = (meshArray: THREE.Mesh[], side: 'left' | 'right'): THREE.Mesh | null => {
    if (meshArray.length === 0) return null;
    return meshArray.reduce((extreme, mesh) => {
      if (!extreme) return mesh;
      return side === 'left' ? (mesh.position.x < extreme.position.x ? mesh : extreme) : (mesh.position.x > extreme.position.x ? mesh : extreme);
    }, meshArray[0]);
  };

  // Create connections between rows (alternating right-left / left-right start points)
  if (showConnections.value && rowsMeshes.length > 1) {
    for (let rowIndex = 0; rowIndex < rowsMeshes.length - 1; rowIndex++) {
      const current = rowsMeshes[rowIndex];
      const next = rowsMeshes[rowIndex + 1];

      if (!current.meshes.length || !next.meshes.length) continue;

      const currentEnd = current.direction === 'rtl' ? current.meshes[0] : current.meshes[current.meshes.length - 1];
      const nextStart = next.direction === 'rtl' ? next.meshes[next.meshes.length - 1] : next.meshes[0];

      const connection = createConnectionLine(currentEnd.position, nextStart.position);
      (connection.material as THREE.LineBasicMaterial).color.setHex(0xffff00);
      (connection.material as THREE.LineBasicMaterial).linewidth = 3;
      scene.add(connection);
      connectionLines.push(connection);
    }
  }
};


const getStitchColor3D = (type: string) => {
  switch (type) {
    case 'mc': return 0xE91E63;
    case 'sc': return 0x4CAF50;
    case 'dc': return 0x2196F3;
    case 'tr': return 0x9C27B0;
    case 'hdc': return 0x00BCD4;
    case 'ch': return 0xFFEB3B;
    case 'inc': return 0xFF9800;
    case 'dec': return 0xF44336;
    case 'sl st': return 0x795548;
    case 'close': return 0x000000;
    default: return 0x9E9E9E;
  }
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  if (renderer && scene && camera) {
    controls.update();
    renderer.render(scene, camera);

    if (isAnimating.value) {
      animationProgress.value += 0.02;
      if (animationProgress.value > props.pattern.rows.reduce((sum, row) => sum + row.stitches.reduce((s, stitch) => s + stitch.count, 0), 0) * 0.1 + 1) {
        animationProgress.value = 0;
      }
      updatePattern();
    }
  }
};

const resetCamera = () => {
  camera.position.set(20, 20, 20);
  controls.reset();
};

const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value;
  if (!isAnimating.value) {
    animationProgress.value = 0;
    updatePattern(); // Reset to full pattern
  }
};

const onResize = () => {
  if (!container.value || !camera || !renderer) return;
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

onMounted(() => {
  init3D();
  animate();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  window.removeEventListener('resize', onResize);
});

watch(() => props.pattern, updatePattern, { deep: true });
watch(showConnections, updatePattern);
</script>

<style scoped>
.pattern-3d-container {
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.controls button, .controls label {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.controls button.active {
  background: #4CAF50;
  color: white;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}
</style>