<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Menu from './Menu.vue';
import Footer from '../Footer/Footer.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const cursorRef = ref<HTMLImageElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

let lastX = 0;
let lastY = 0;

const MIN_DISTANCE_BETWEEN_DOTS = 25;

let lastDotX = 0;
let lastDotY = 0;
let isOverLink = false;
let lastAngle = 0;

const handleMouseMove = (e: MouseEvent): void => {
  const cursor = cursorRef.value;
  const container = containerRef.value;

  if (!cursor || !container) return;

  const x = e.clientX;
  const y = e.clientY;

  const deltaX = x - lastX;
  const deltaY = y - lastY;

  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);



  if (Math.abs(deltaX) > 0.8 || Math.abs(deltaY) > 0.8) {
    if (!isOverLink) {
      lastAngle = angle;
      cursor.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
    }

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    if (!isOverLink) {
      const distanceSinceLastDot = Math.hypot(x - lastDotX, y - lastDotY);

      if (distanceSinceLastDot > MIN_DISTANCE_BETWEEN_DOTS) {
        createDot(x, y, angle, container);
        lastDotX = x;
        lastDotY = y;
      }
    }
  }

  lastX = x;
  lastY = y;
};

const createDot = (x: number, y: number, angle: number, targetContainer: HTMLDivElement): void => {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  dot.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

  targetContainer.appendChild(dot);

  setTimeout(() => {
    dot.remove();
  }, 500);
};

const handleComponentLeave = (): void => {
  const cursor = cursorRef.value;
  const container = containerRef.value;

  if (cursor) {
    cursor.style.transform = 'translate(-50%, -50%)';
  }
  if (container) {
    container.innerHTML = '';
  }
};

onMounted(() => {
  window.addEventListener('mousemove', (e) => {
    handleMouseMove(e);

    let target = (e.target as HTMLElement).closest('a, router-link');
    if (target) {
      isOverLink = true;
      const cursor = cursorRef.value;
      if (cursor) {
        const rect = target.getBoundingClientRect();
        cursor.style.left = `${rect.right + 15}px`;
        cursor.style.top = `${rect.top - 15}px`;
        cursor.style.transform = `translate(-100%, 0) rotate(${lastAngle + 90}deg)`;
      }
    } else {
      isOverLink = false;
    }
  });

  const homeComponent = document.querySelector('.home-component');
  homeComponent?.addEventListener('mouseleave', handleComponentLeave);
});

onUnmounted(() => {
  const homeComponent = document.querySelector('.home-component');
  homeComponent?.removeEventListener('mouseleave', handleComponentLeave);
});
</script>

<template>
  <div style="left: 0; right: 0; position: fixed; height: 120px; margin-top: -82px;
    backdrop-filter: blur(100px);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%); z-index: 3;"></div>

  <div class="home-component">
    <Menu />

    <!-- Cursor -->
    <img ref="cursorRef" src="/img/icon-noBG.png" alt="Cursor" class="custom-cursor" />
    <div ref="containerRef" class="trail-container"></div>

    <h2 style="margin-bottom: 0px; margin-top: 150px;" class="disable-text-select">Vous cherchez quelques cadeaux?</h2>
    <p style="margin-bottom: 30px;">Découvrez notre magasin pour tous les goûts et tous les âges.</p>
    <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 100px;"
      class="disable-text-select">
      <a href="/shop/clothe" class="box-shop dash-box">
        <h4 style="margin-bottom: 15px;">Vêtements</h4>
      </a>
      <a href="/shop/amigurumi" class="dash-box box-shop">
        <h4 style="margin-bottom: 15px;">Toutou</h4>
      </a>
      <a href="/shop/pattern" class="dash-box box-shop">
        <h4 style="margin-bottom: 15px;">Patrons</h4>
      </a>
    </div>

    <div class="wave-container">
      <svg viewBox="0 0 500 800" preserveAspectRatio="none">
        <path d="M0,100 
           C150,200 350,0 500,100 
           L500,700 
           C350,600 150,800 0,700 
           Z" style="stroke: none; fill:var(--middle-color);"></path>
      </svg>
      <div class="wave-content">
        <div class="dash-box"
          style="background-color: var(--light-color); padding: 80px 50px; border-radius: 8px; width: 750px;">
          <h2 style="margin-bottom: 35px;" class="disable-text-select">Conserver vos projets!</h2>
          <p></p>
          <router-link to="/myProject" class="buttonColor" style="padding: 20px 25px; border-radius: 30px;">
            +
          </router-link>
        </div>
      </div>
    </div>

    <h2 style="margin-bottom: 50px; margin-top: 150px;" class="disable-text-select">Besoin d'un petit coup de pouce?</h2>
    <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 100px;"
      class="disable-text-select">
      <a href="/shop/clothe" class="dash-box"
        style="border-radius: 12px; width: 250px; background-color: var(--light-color);">
        <div style="height: 50%;  background-color: var(--green-color); border-radius: 12px 12px 0 0;">
          <h4 style="padding: 15px 0 15px 0; margin: 0;">Débutants</h4>
        </div>
        <div style="height: 50%;">
          <p style="margin: 15px 0 35px 0;">Apprenez les bases du crochet</p>
        </div>
      </a>

      <a href="/shop/amigurumi" class="dash-box"
        style="border-radius: 12px; width: 250px; background-color: var(--light-color);">
        <div style="height: 50%; background-color: var(--yellow-color); border-radius: 12px 12px 0 0;">
          <h4 style="padding: 15px 0 15px 0; margin: 0;">Intermédiaires</h4>
        </div>
        <div style="height: 50%;">
          <p style="margin: 15px 0 35px 0;">Affinez vos compétences</p>
        </div>
      </a>

      <a href="/shop/pattern" class="dash-box"
        style="border-radius: 12px; width: 250px; background-color: var(--light-color);">
        <div style="height: 50%; background-color: var(--orange-color); border-radius: 12px 12px 0 0;">
          <h4 style="padding: 15px 0 15px 0; margin: 0;">Avancés</h4>
        </div>
        <div style="height: 50%;">
          <p style="margin: 15px 0 35px 0;">Créez des modèles uniques</p>
        </div>
      </a>
    </div>

    <div class="wave-container">
      <svg viewBox="0 0 500 800" preserveAspectRatio="none">
        <path d="M0,100 
           C150,200 350,0 500,100 
           L500,700 
           C350,600 150,800 0,700 
           Z" style="stroke: none; fill:var(--middle-color);"></path>
      </svg>
      <div class="wave-content">
        <div class="dash-box"
          style="background-color: var(--light-color); padding: 80px 50px; border-radius: 8px; width: 750px;">
          <h2 style="margin-bottom: 35px;" class="disable-text-select">Frabriquons de nouvelles idées!</h2>
          <router-link to="/maker" class="buttonColor" style="padding: 12px 22px; border-radius: 30px;">
            Creer un patron
          </router-link>
        </div>
      </div>
    </div>

    <h2 style="margin-bottom: 15px; margin-top: 150px;" class="disable-text-select">Commencez vos nouveaux projets!</h2>
    <p style="margin-bottom: 30px;">Vous avez toujours voulus un endroit pour lire des pdf de patrons de crochet du monde entier sans devoir faire le travail de traduction, c'est l'endroit idéal!</p>
    <router-link to="/reader" class="buttonColor" style="padding: 12px 22px; border-radius: 30px;">
      Commencer
    </router-link>

    <Footer class="footer" />
  </div>
</template>

<style scoped>
.home-component {
  cursor: none;
}

.wave-container {
  display: block;
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;

  padding-bottom: 80%;
}

.wave-container svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.wave-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.box-shop {
  background-color: var(--light-color);
  padding: 50px 0;
  border-radius: 12px;
  width: 300px;
  cursor: pointer !important;
}
</style>

<style>
.custom-cursor {
  position: fixed;
  pointer-events: none;
  z-index: 101;
  transform: translate(-50%, -50%);
  width: 32px;
  height: auto;
  will-change: left, top, transform;
}

.trail-dot {
  position: fixed;
  width: 12px;
  height: 2px;
  background-color: var(--text-color);
  border-radius: 0px;
  pointer-events: none;
  z-index: 9998;
  animation: fadeOut 0.7s forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
