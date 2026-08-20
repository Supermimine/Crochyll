<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useScreen } from '@/tools/appTools';
import Menu from './Menu.vue';
import Footer from '../Footer/Footer.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { isMobile } = useScreen();

const cursorRef = ref<HTMLImageElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const isTouchModeActive = ref(false);
const shouldUseCustomCursor = computed(() => !isMobile.value || isTouchModeActive.value);

let lastX = 0;
let lastY = 0;
const MIN_DISTANCE_BETWEEN_DOTS = 25;
let lastDotX = 0;
let lastDotY = 0;
let isOverLink = false;
let lastAngle = 0;

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

const updateCursorPosition = (x: number, y: number, targetElement: EventTarget | null, container: HTMLDivElement): void => {
  const cursor = cursorRef.value;

  if (!cursor) return;

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

  const target = (targetElement as HTMLElement | null)?.closest('a, router-link');
  if (target) {
    isOverLink = true;
    const rect = target.getBoundingClientRect();
    cursor.style.left = `${rect.right + 15}px`;
    cursor.style.top = `${rect.top - 15}px`;
    cursor.style.transform = `translate(-100%, 0) rotate(${lastAngle + 90}deg)`;
  } else {
    isOverLink = false;
  }
};

const handleMouseMove = (e: MouseEvent): void => {
  if (isTouchModeActive.value) return;

  const container = containerRef.value;
  if (!container) return;

  updateCursorPosition(e.clientX, e.clientY, e.target, container);
};

const handleTouchMove = (e: TouchEvent): void => {
  if (!isTouchModeActive.value) return;

  const touch = e.touches[0];
  const container = containerRef.value;
  if (!touch || !container) return;

  updateCursorPosition(touch.clientX, touch.clientY, e.target, container);
};

const handleTouchStart = (e: TouchEvent): void => {
  if (!isTouchModeActive.value) return;

  const touch = e.touches[0];
  if (!touch) return;

  const cursor = cursorRef.value;
  if (!cursor) return;

  cursor.style.left = `${touch.clientX}px`;
  cursor.style.top = `${touch.clientY}px`;
  cursor.style.transform = 'translate(-50%, -50%)';

  lastX = touch.clientX;
  lastY = touch.clientY;
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

const toggleTouchMode = (event?: Event): void => {
  event?.preventDefault();
  event?.stopPropagation();
  isTouchModeActive.value = !isTouchModeActive.value;
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchstart', handleTouchStart, { passive: false });

  const homeComponent = document.querySelector('.home-component');
  homeComponent?.addEventListener('mouseleave', handleComponentLeave);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchstart', handleTouchStart);

  const homeComponent = document.querySelector('.home-component');
  homeComponent?.removeEventListener('mouseleave', handleComponentLeave);
});
</script>

<template>
  <div style="left: 0; right: 0; position: fixed; height: 120px; margin-top: -82px;
    backdrop-filter: blur(100px);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%); z-index: 3;"></div>

  <div class="home-component h-card"
    :class="{ 'mobile-normal': isMobile && !isTouchModeActive, 'mobile-touch-active': isMobile && isTouchModeActive }">
    <Menu />

    <!-- Cursor -->
    <img v-if="shouldUseCustomCursor" ref="cursorRef" src="/img/icon-noBG.png" alt="Cursor" title="Cursor" class="custom-cursor" />
    <div v-if="shouldUseCustomCursor" ref="containerRef" class="trail-container"></div>

    <button v-if="isMobile" type="button" class="touch-mode-toggle" :class="{ active: isTouchModeActive }"
      @click.stop.prevent="toggleTouchMode" @touchend.stop.prevent="toggleTouchMode"
      :aria-label="isTouchModeActive ? 'Désactiver le mode tactile' : 'Activer le mode tactile'">
      <v-icon v-if="isTouchModeActive" icon="mdi-lock-outline" size="25" />
      <v-icon v-else icon="mdi-lock-open-variant-outline" size="25" />
    </button>

    <h2 style="margin-bottom: 0px; margin-top: 150px;" class="disable-text-select">{{ t('home.shop') }}</h2>
    <p style="margin-bottom: 30px;" class="disable-text-select">{{ t('home.shopDescription') }}</p>
    <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 100px;"
      class="disable-text-select">
      <a href="/shop/clothe" class="box-shop dash-box">
        <h4 style="margin-bottom: 15px;">{{ t('home.shopOption1') }}</h4>
      </a>
      <a href="/shop/amigurumi" class="dash-box box-shop">
        <h4 style="margin-bottom: 15px;">{{ t('home.shopOption2') }}</h4>
      </a>
      <a href="/shop/pattern" class="dash-box box-shop">
        <h4 style="margin-bottom: 15px;">{{ t('home.shopOption3') }}</h4>
      </a>
    </div>

    <div class="wave-container" :class="{ 'mobile-wave': isMobile }">
      <svg viewBox="0 0 500 800" preserveAspectRatio="none">
        <path d="M0,100 
           C150,200 350,0 500,100 
           L500,700 
           C350,600 150,800 0,700 
           Z" style="stroke: none; fill:var(--middle-color);"></path>
      </svg>
      <div class="wave-content">
        <div class="dash-box big-dash-box">
          <h2 style="margin-bottom: 0;" class="disable-text-select">{{ t('home.myProject') }}</h2>
          <p style="margin-bottom: 35px;" class="disable-text-select">{{ t('home.myProjectDescription') }}</p>
          <router-link to="/myProfil" class="buttonColor" style="padding: 20px 25px; border-radius: 30px;">
            +
          </router-link>
        </div>
      </div>
    </div>

    <h2 style="margin-bottom: 0; margin-top: 150px;" class="disable-text-select">{{ t('home.learn') }}</h2>
    <p style="margin-bottom: 50px;" class="disable-text-select">{{ t('home.learnDescription') }}</p>
    <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 100px;"
      class="disable-text-select">
      <a href="/learn#beginner" class="dash-box"
        style="border-radius: 12px; width: 250px; background-color: var(--light-color);">
        <div style="height: 50%;  background-color: var(--green-color); border-radius: 12px 12px 0 0;">
          <h4 style="padding: 15px 0 15px 0; margin: 0;">{{ t('home.learnOption1') }}</h4>
        </div>
        <div style="height: 50%;">
          <p style="margin: 15px 0 35px 0;" class="disable-text-select">{{ t('home.learnOption1Description') }}</p>
        </div>
      </a>

      <a href="/learn#intermediate" class="dash-box"
        style="border-radius: 12px; width: 250px; background-color: var(--light-color);">
        <div style="height: 50%; background-color: var(--yellow-color); border-radius: 12px 12px 0 0;">
          <h4 style="padding: 15px 0 15px 0; margin: 0;">{{ t('home.learnOption2') }}</h4>
        </div>
        <div style="height: 50%;">
          <p style="margin: 15px 0 35px 0;" class="disable-text-select">{{ t('home.learnOption2Description') }}</p>
        </div>
      </a>

      <a href="/learn#advanced" class="dash-box"
        style="border-radius: 12px; width: 250px; background-color: var(--light-color);">
        <div style="height: 50%; background-color: var(--orange-color); border-radius: 12px 12px 0 0;">
          <h4 style="padding: 15px 0 15px 0; margin: 0;">{{ t('home.learnOption3') }}</h4>
        </div>
        <div style="height: 50%;">
          <p style="margin: 15px 0 35px 0;" class="disable-text-select">{{ t('home.learnOption3Description') }}</p>
        </div>
      </a>
    </div>

    <div class="wave-container" :class="{ 'mobile-wave': isMobile }">
      <svg viewBox="0 0 500 800" preserveAspectRatio="none">
        <path d="M0,100 
           C150,200 350,0 500,100 
           L500,700 
           C350,600 150,800 0,700 
           Z" style="stroke: none; fill:var(--middle-color);"></path>
      </svg>
      <div class="wave-content">
        <div class="dash-box big-dash-box">
          <h2 style="margin-bottom: 0;" class="disable-text-select">{{ t('home.maker') }}</h2>
          <p style="margin-bottom: 35px;" class="disable-text-select">{{ t('home.makerDescription') }}</p>
          <router-link to="/maker" class="buttonColor" style="padding: 12px 22px; border-radius: 30px;">
            {{ t('home.makerBtn') }}
          </router-link>
        </div>
      </div>
    </div>

    <h2 style="margin-bottom: 0; margin-top: 150px;" class="disable-text-select">{{ t('home.reader') }}</h2>
    <p style="margin-bottom: 30px;" class="disable-text-select">{{ t('home.readerDescription') }}</p>
    <router-link to="/reader" class="buttonColor" style="padding: 12px 22px; border-radius: 30px;">
      {{ t('home.readerBtn') }}
    </router-link>

    <Footer class="footer" />
  </div>
</template>

<style scoped>
.home-component {
  cursor: none;
  touch-action: none;
  overflow-x: visible;

}

.home-component.mobile-normal {
  cursor: auto;
  touch-action: auto;
}

.home-component.mobile-touch-active {
  cursor: none;
  touch-action: none;
}

.touch-mode-toggle {
  touch-action: manipulation;
}

@supports (-moz-appearance: none) {
  .wave-container {
    width: 100vw;
    left: 50%;
    right: 50%;
    transform: translateX(-50%);
  }
}

.wave-container {
  display: block;
  position: relative;
  left: 50%;
  right: 50%;
  width: 100vw;
  max-width: none;
  transform: translateX(-50%);
  overflow: hidden;
  box-sizing: border-box;

  padding-bottom: 80%;
}

.wave-container.mobile-wave {
  padding-bottom: 200%;
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

.big-dash-box {
  background-color: var(--light-color);
  padding: 80px 50px;
  border-radius: 8px;
  width: 750px;
}

@media (max-width: 650px) {
  .big-dash-box {
    width: 370px;
  }
}

.touch-mode-toggle {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 102;
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 50%;
  background: var(--light-color);
  color: var(--text-color);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
