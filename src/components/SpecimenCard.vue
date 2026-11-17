<script setup lang="ts">
import { ref } from 'vue';
import type { Specimen } from '@/types/specimen';

const props = defineProps<{
  specimen: Specimen;
}>();

const emit = defineEmits<{
  (e: 'select', specimen: Specimen): void;
}>();

const imageFailed = ref(false);
</script>

<template>
  <article class="group flex flex-col">
    <!-- Fotografia da Exsicata (3:4) -->
    <button
      type="button"
      class="relative block w-full cursor-pointer overflow-hidden rounded-t-sm border border-ink/15 bg-stone-200 text-left focus-visible:ring-2 focus-visible:ring-botanical focus-visible:outline-none"
      :aria-label="`Ampliar exsicata de ${props.specimen.scientificName}`"
      @click="emit('select', props.specimen)"
    >
      <img
        v-if="!imageFailed"
        :src="props.specimen.imageUrl"
        :alt="`Exsicata de ${props.specimen.scientificName} (${props.specimen.popularName})`"
        loading="lazy"
        decoding="async"
        class="aspect-3/4 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        @error="imageFailed = true"
      />

      <!-- Fallback elegante caso a imagem ainda não tenha sido adicionada na pasta public/images -->
      <div
        v-else
        class="flex aspect-3/4 w-full flex-col items-center justify-center bg-botanical-light/70 p-6 text-center text-botanical"
      >
        <span class="font-mono text-xs uppercase tracking-widest">Fotografia da Exsicata</span>
        <span class="mt-1 font-display text-2xl italic">{{ props.specimen.scientificName }}</span>
        <span class="mt-2 font-mono text-[11px] text-muted">{{ props.specimen.imageUrl }}</span>
      </div>

      <!-- Indicador discreto de ampliação -->
      <span
        class="absolute top-3 right-3 rounded bg-ink/75 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white opacity-90 backdrop-blur-xs transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
      >
        Ampliar
      </span>
    </button>

    <!-- Etiqueta Botânica Sobreposta (fiel à prévia) -->
    <div class="relative z-10 -mt-14 px-2.5 pb-2 sm:-mt-22 sm:ml-auto sm:w-[90%] sm:px-4">
      <div class="label-tag rounded-xs p-4 sm:p-5">
        <!-- Cabeçalho da Etiqueta: Herbário + Número de Coleta -->
        <div class="mb-2 flex flex-wrap items-center justify-between gap-1 border-b-2 border-ink pb-1.5">
          <span class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink sm:text-[11px]">
            Herbário Jarros · SDR
          </span>
          <span class="font-mono text-xs font-semibold text-botanical">
            Nº {{ props.specimen.collectionNumber }}
          </span>
        </div>

        <!-- Família, Nome Científico e Nome Popular -->
        <p class="font-mono text-[11px] font-medium uppercase tracking-widest text-botanical">
          {{ props.specimen.family }}
        </p>
        <h2 class="mt-0.5 font-display text-2xl leading-tight font-bold italic text-ink sm:text-[26px]">
          {{ props.specimen.scientificName }}
        </h2>
        <p class="mb-3 text-sm text-muted">
          “{{ props.specimen.popularName }}”
        </p>

        <!-- Metadados de Coleta (adaptável para telas de 320px+) -->
        <dl class="divide-y divide-dashed divide-border-dashed border-t border-dashed border-border-dashed text-sm">
          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[6.75rem_1fr] min-[360px]:gap-2">
            <dt class="font-mono text-[10px] uppercase tracking-wider text-muted pt-0.5 sm:text-[11px]">
              Localidade
            </dt>
            <dd class="text-ink leading-snug">{{ props.specimen.locality }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[6.75rem_1fr] min-[360px]:gap-2">
            <dt class="font-mono text-[10px] uppercase tracking-wider text-muted pt-0.5 sm:text-[11px]">
              Coletor
            </dt>
            <dd class="text-ink">{{ props.specimen.collector }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[6.75rem_1fr] min-[360px]:gap-2">
            <dt class="font-mono text-[10px] uppercase tracking-wider text-muted pt-0.5 sm:text-[11px]">
              Contribuidor
            </dt>
            <dd class="text-ink">{{ props.specimen.contributor }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[6.75rem_1fr] min-[360px]:gap-2">
            <dt class="font-mono text-[10px] uppercase tracking-wider text-muted pt-0.5 sm:text-[11px]">
              Data
            </dt>
            <dd class="font-mono text-xs text-ink sm:text-sm">{{ props.specimen.date }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-0.5 py-1.5 min-[360px]:grid-cols-[6.75rem_1fr] min-[360px]:gap-2">
            <dt class="font-mono text-[10px] uppercase tracking-wider text-muted pt-0.5 sm:text-[11px]">
              Observações
            </dt>
            <dd class="text-ink leading-snug">{{ props.specimen.notes }}</dd>
          </div>
        </dl>

        <!-- Rodapé Institucional da Etiqueta -->
        <p class="mt-3 border-t border-ink/10 pt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Universidade Federal do Maranhão
        </p>
      </div>
    </div>
  </article>
</template>