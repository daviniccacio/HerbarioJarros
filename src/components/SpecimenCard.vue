<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Specimen } from '@/types/specimen';
import { useScrollReveal } from '@/composables/useScrollReveal';

const props = defineProps<{
  specimen: Specimen;
  index?: number;
}>();

const emit = defineEmits<{
  (e: 'select', specimen: Specimen): void;
}>();

const imageLoaded = ref(false);
const imageFailed = ref(false);

const { observeElement, isVisible } = useScrollReveal();

const displayTitle = computed(
  () => props.specimen.scientificName || props.specimen.popularName
);

const staggerStyle = computed(() => {
  if (isVisible.value) return undefined;
  const step = (props.index ?? 0) % 4;
  return { transitionDelay: `${step * 70}ms` };
});
</script>

<template>
  <article
    :ref="observeElement"
    :style="staggerStyle"
    class="group flex flex-col transition-all duration-700 ease-out"
    :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
  >
    <!-- Fotografia da Exsicata (3:4) com Skeleton Loader -->
    <button
      type="button"
      class="relative block w-full cursor-pointer overflow-hidden rounded-t-sm border border-ink/15 bg-stone-200/80 text-left focus-visible:ring-2 focus-visible:ring-botanical focus-visible:outline-none"
      :aria-label="`Ampliar exsicata de ${displayTitle}`"
      @click="emit('select', props.specimen)"
    >
      <div
        v-if="!imageLoaded && !imageFailed"
        aria-hidden="true"
        class="flex aspect-3/4 w-full animate-pulse flex-col justify-between bg-linear-to-br from-botanical-light/80 via-paper to-stone-200 p-6"
      >
        <div class="h-3 w-24 rounded bg-ink/10" />
        <div class="space-y-2">
          <div class="h-3 w-32 rounded bg-ink/10" />
          <div class="h-2.5 w-20 rounded bg-ink/10" />
        </div>
      </div>

      <img
        v-if="!imageFailed"
        :src="props.specimen.imageUrl"
        :alt="`Exsicata de ${displayTitle} (${props.specimen.family})`"
        loading="lazy"
        decoding="async"
        class="aspect-3/4 w-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03]"
        :class="imageLoaded ? 'opacity-100' : 'absolute inset-0 opacity-0'"
        @load="imageLoaded = true"
        @error="imageFailed = true"
      />

      <!-- Fallback elegante enquanto a foto real não é adicionada -->
      <div
        v-else
        class="flex aspect-3/4 w-full flex-col items-center justify-center bg-botanical-light/70 p-6 text-center text-botanical transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      >
        <span class="font-mono text-xs uppercase tracking-widest">{{ props.specimen.family }}</span>
        <span
          class="mt-1 font-display text-2xl"
          :class="{ italic: Boolean(props.specimen.scientificName) }"
        >
          {{ displayTitle }}
        </span>
        <span class="mt-2 font-mono text-[11px] text-muted">{{ props.specimen.imageUrl }}</span>
      </div>

      <span
        class="absolute top-3 right-3 rounded bg-ink/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white opacity-90 backdrop-blur-xs transition-all duration-300 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
      >
        Ampliar + Lupa
      </span>
    </button>

    <!-- Etiqueta Botânica Sobreposta -->
    <div class="relative z-10 -mt-14 px-2.5 pb-2 sm:-mt-22 sm:ml-auto sm:w-[90%] sm:px-4">
      <div class="label-tag rounded-xs p-4 sm:p-5">
        <!-- Cabeçalho da Etiqueta -->
        <div class="mb-2 flex flex-wrap items-center justify-between gap-1 border-b-2 border-ink pb-1.5">
          <span class="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink sm:text-[11px]">
            Herbário do Jarros · HSRD
          </span>
          <span class="font-mono text-xs font-semibold text-botanical">
            Nº {{ props.specimen.collectionNumber }}
          </span>
        </div>

        <!-- Família e Identificação -->
        <p class="font-mono text-[11px] font-medium uppercase tracking-widest text-botanical">
          {{ props.specimen.family }}
        </p>

        <template v-if="props.specimen.scientificName">
          <h2 class="mt-0.5 font-display text-2xl leading-tight font-bold italic text-ink sm:text-[26px]">
            {{ props.specimen.scientificName }}
          </h2>
          <p class="mb-3 text-sm text-muted">
            “{{ props.specimen.popularName }}”
          </p>
        </template>

        <template v-else>
          <h2 class="mt-0.5 font-display text-2xl leading-tight font-bold text-ink sm:text-[26px]">
            {{ props.specimen.popularName }}
          </h2>
          <p class="mb-3 font-mono text-[11px] italic text-muted">
            Espécie em identificação
          </p>
        </template>

        <!-- Metadados de Coleta -->
        <dl class="divide-y divide-dashed divide-border-dashed border-t border-dashed border-border-dashed text-sm">
          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[7.25rem_1fr] min-[360px]:gap-2">
            <dt class="pt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
              Localidade
            </dt>
            <dd class="leading-snug text-ink">{{ props.specimen.locality }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[7.25rem_1fr] min-[360px]:gap-2">
            <dt class="pt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
              Coletor
            </dt>
            <dd class="text-ink">{{ props.specimen.collector }}</dd>
          </div>

          <div
            v-if="props.specimen.contributor"
            class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[7.25rem_1fr] min-[360px]:gap-2"
          >
            <dt class="pt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
              Acompanhante
            </dt>
            <dd class="text-ink">{{ props.specimen.contributor }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[7.25rem_1fr] min-[360px]:gap-2">
            <dt class="pt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
              Data
            </dt>
            <dd class="font-mono text-xs text-ink sm:text-sm">{{ props.specimen.date }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[7.25rem_1fr] min-[360px]:gap-2">
            <dt class="pt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
              Observações
            </dt>
            <dd class="leading-snug text-ink">{{ props.specimen.notes }}</dd>
          </div>
        </dl>

        <!-- Rodapé Institucional -->
        <p class="mt-3 border-t border-ink/10 pt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Universidade Federal do Maranhão
        </p>
      </div>
    </div>
  </article>
</template>