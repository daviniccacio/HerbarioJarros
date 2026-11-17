<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { Specimen } from '@/types/specimen';

const props = defineProps<{
  specimen: Specimen | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close');
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.specimen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      :aria-label="`Detalhes de ${props.specimen.scientificName}`"
      @click.self="emit('close')"
    >
      <div
        class="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-sm bg-paper-card shadow-2xl md:grid md:grid-cols-2"
      >
        <button
          type="button"
          aria-label="Fechar visualização"
          class="absolute top-3 right-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-ink/80 font-mono text-sm text-white transition-colors hover:bg-botanical"
          @click="emit('close')"
        >
          ✕
        </button>

        <div class="bg-stone-200">
          <img
            :src="props.specimen.imageUrl"
            :alt="`Exsicata de ${props.specimen.scientificName}`"
            class="h-full max-h-[55dvh] w-full object-cover md:max-h-[92dvh]"
          />
        </div>

        <div class="flex flex-col justify-between p-5 sm:p-7">
          <div>
            <div class="flex items-center justify-between border-b-2 border-ink pb-2">
              <span class="font-mono text-xs uppercase tracking-widest">Herbário Jarros · SDR</span>
              <span class="font-mono text-xs font-semibold text-botanical">
                Nº {{ props.specimen.collectionNumber }}
              </span>
            </div>

            <p class="mt-4 font-mono text-xs uppercase tracking-widest text-botanical">
              {{ props.specimen.family }}
            </p>
            <h2 class="mt-1 font-display text-3xl font-bold italic text-ink">
              {{ props.specimen.scientificName }}
            </h2>
            <p class="text-base text-muted">“{{ props.specimen.popularName }}”</p>

            <dl class="mt-5 divide-y divide-dashed divide-border-dashed border-y border-dashed border-border-dashed text-sm">
              <div class="py-2">
                <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Localidade</dt>
                <dd class="mt-0.5 text-ink">{{ props.specimen.locality }}</dd>
              </div>
              <div class="grid grid-cols-2 gap-3 py-2">
                <div>
                  <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Coletor</dt>
                  <dd class="mt-0.5 text-ink">{{ props.specimen.collector }}</dd>
                </div>
                <div>
                  <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Contribuidor</dt>
                  <dd class="mt-0.5 text-ink">{{ props.specimen.contributor }}</dd>
                </div>
              </div>
              <div class="py-2">
                <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Data de Coleta</dt>
                <dd class="mt-0.5 font-mono text-ink">{{ props.specimen.date }}</dd>
              </div>
              <div class="py-2">
                <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Observações</dt>
                <dd class="mt-0.5 text-ink">{{ props.specimen.notes }}</dd>
              </div>
            </dl>
          </div>

          <p class="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
            Universidade Federal do Maranhão · Departamento de Biologia
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>