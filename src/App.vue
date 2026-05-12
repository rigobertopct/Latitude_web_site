<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  /* Paleta alineada al logo LATITUDE (globo azul marino, anillo naranja / ámbar) */
  --latitude-navy: #001b48;
  --latitude-navy-mid: #022b42;
  --latitude-deep-blue: #001b48;
  --latitude-electric-blue: #0056d2;
  --latitude-cyan: #00b4d8;
  --latitude-orange: #ff8c00;
  --latitude-amber: #ffb700;
  --latitude-cream: #fff9e3;
  --latitude-white: #ffffff;
  --latitude-silver: #e5e7eb;
  --latitude-blue-gray: #c8d4e4;
  --latitude-surface: #f0f3f9;
  --latitude-navy-rgb: 0, 27, 72;
  --latitude-orange-rgb: 255, 140, 0;
  --latitude-amber-rgb: 255, 183, 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

html {
  scroll-behavior: smooth;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.95; transform: scale(1.02); }
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

@keyframes shine {
  0% { opacity: 0; transform: translateX(-100%); }
  50% { opacity: 0.15; }
  100% { opacity: 0; transform: translateX(100%); }
}
</style>
