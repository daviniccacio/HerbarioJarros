<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Specimen } from '@/types/specimen';
import { useScrollReveal } from '@/composables/useScrollReveal';

const props = defineProps<{
  specimen: Specimen;
}>();

const emit = defineEmits<{
  (e: 'select', specimen: Specimen): void;
}>();

const imageFailed = ref(false);
const { observeElement, isVisible } = useScrollReveal();

const displayTitle = computed(
  () => props.specimen.scientificName || props.specimen.popularName
);
</script>

<template>
  <article
    :ref="observeElement"
    class="transition-all duration-500 ease-out"
    :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
  >
    <button
      type="button"
      class="group flex w-full cursor-pointer items-center gap-3.5 rounded-sm border border-ink/15 bg-paper-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-botanical/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-botanical focus-visible:outline-none sm:gap-5 sm:p-4"
      @click="emit('select', props.specimen)"
    >
      <!-- Miniatura 3:4 -->
      <div class="h-20 w-15 shrink-0 overflow-hidden rounded-xs border border-ink/15 bg-botanical-light/70 sm:h-24 sm:w-18">
        <img
          v-if="!imageFailed"
          :src="props.specimen.imageUrl"
          :alt="`Miniatura de ${displayTitle}`"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          @error="imageFailed = true"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center p-1 text-center font-mono text-[9px] font-semibold uppercase text-botanical"
        >
          HBSRD
        </div>
      </div>

      <!-- Informações Principais -->
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          <span class="font-mono text-xs font-semibold text-botanical">
            {{ props.specimen.collectionNumber }}
          </span>
          <span class="font-mono text-[10px] uppercase tracking-widest text-muted">
            · {{ props.specimen.family }}
          </span>
          <span class="hidden font-mono text-[11px] text-muted sm:inline">
            · {{ props.specimen.date }}
          </span>
        </div>

        <h2
          class="mt-0.5 truncate font-display text-xl font-bold text-ink sm:text-2xl"
          :class="{ italic: Boolean(props.specimen.scientificName) }"
        >
          {{ displayTitle }}
        </h2>

        <p class="truncate text-xs text-muted sm:text-sm">
          <template v-if="props.specimen.scientificName">
            “{{ props.specimen.popularName }}” — {{ props.specimen.locality }}
          </template>
          <template v-else>
            {{ props.specimen.locality }}
          </template>
        </p>

        <p class="mt-1 truncate font-mono text-[11px] text-muted/90">
          Coletor: {{ props.specimen.collector }}
          <template v-if="props.specimen.contributor">
            · Acomp.: {{ props.specimen.contributor }}
          </template>
        </p>
      </div>

      <span
        class="hidden shrink-0 rounded-sm border border-ink/15 bg-paper px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors group-hover:border-botanical group-hover:bg-botanical group-hover:text-white sm:inline-block"
      >
        Ver ficha
      </span>
    </button>
  </article>
</template>