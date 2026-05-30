<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import logoUrl from '../assets/images/logo.png'

defineProps({
  anchor: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const imgFailed = ref(false)
</script>

<template>
  <a
    v-if="anchor"
    href="#"
    class="nav-brand"
    @click.prevent="$emit('click')"
  >
    <img
      v-if="!imgFailed"
      :src="logoUrl"
      alt=""
      class="nav-brand__img"
      width="120"
      height="120"
      decoding="async"
      @error="imgFailed = true"
    />
    <span class="nav-brand__text">
      <span class="nav-brand__main">LATITUDE</span>
      <span class="nav-brand__sub">TRANSPORT SERVICES, INC.</span>
    </span>
  </a>
  <RouterLink v-else to="/" class="nav-brand" @click="$emit('click')">
    <img
      v-if="!imgFailed"
      :src="logoUrl"
      alt="Latitude Transport Services, Inc."
      class="nav-brand__img"
      width="120"
      height="120"
      decoding="async"
      @error="imgFailed = true"
    />
    <span class="nav-brand__text">
      <span class="nav-brand__main">LATITUDE</span>
      <span class="nav-brand__sub">TRANSPORT SERVICES, INC.</span>
    </span>
  </RouterLink>
</template>

<style scoped>
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
  text-decoration: none;
  color: inherit;
}

.nav-brand__img {
  display: block;
  flex-shrink: 0;
  height: 3.5rem;
  width: 3.5rem;
  object-fit: contain;
  object-position: center;
}

.nav-brand__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.12;
}

.nav-brand__main {
  font-size: 1.2rem;
  font-weight: 800;
  font-style: italic;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.nav-brand__sub {
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  opacity: 0.95;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .nav-brand {
    gap: 0.75rem;
  }

  .nav-brand__img {
    height: 4rem;
    width: 4rem;
  }

  .nav-brand__main {
    font-size: 1.35rem;
  }

  .nav-brand__sub {
    font-size: 0.62rem;
  }
}

@media (max-width: 767px) {
  .nav-brand__img {
    height: 3rem;
    width: 3rem;
  }

  .nav-brand__main {
    font-size: 1.05rem;
  }

  .nav-brand__sub {
    font-size: 0.5rem;
  }
}
</style>
