<script setup lang="ts">
import { computed, ref } from 'vue';
import { specimens } from '@/data/specimens';
import type { Specimen } from '@/types/specimen';
import HerbariumHeader from '@/components/HerbariumHeader.vue';
import SpecimenCard from '@/components/SpecimenCard.vue';
import SpecimenModal from '@/components/SpecimenModal.vue';

const searchQuery = ref('');
const selectedFamily = ref('');
const activeSpecimen = ref<Specimen | null>(null);

// Remove acentos para facilitar buscas no celular
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const families = computed(() => {
  return Array.from(new Set(specimens.map((item) => item.family))).sort();
});

const filteredSpecimens = computed(() => {
  const query = normalizeText(searchQuery.value.trim());

  return specimens.filter((item) => {
    const matchesFamily =
      selectedFamily.value === '' || item.family === selectedFamily.value;

    if (!matchesFamily) return false;
    if (!query) return true;

    const searchableContent = normalizeText(
      [
        item.collectionNumber,
        item.scientificName,
        item.popularName,
        item.family,
        item.locality,
        item.collector,
        item.contributor,
        item.notes,
      ].join(' ')
    );

    return searchableContent.includes(query);
  });
});
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <HerbariumHeader
      v-model:search-query="searchQuery"
      v-model:selected-family="selectedFamily"
      :families="families"
      :total-count="specimens.length"
      :filtered-count="filteredSpecimens.length"
    />

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <!-- Grade de Exsicatas -->
      <section
        v-if="filteredSpecimens.length > 0"
        aria-label="Galeria de exsicatas do Herbário Jarros"
        class="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12"
      >
        <SpecimenCard
          v-for="specimen in filteredSpecimens"
          :key="specimen.id"
          :specimen="specimen"
          @select="activeSpecimen = $event"
        />
      </section>

      <!-- Estado vazio caso a busca não encontre resultados -->
      <div
        v-else
        class="rounded-sm border border-dashed border-ink/25 bg-paper-card/70 px-6 py-14 text-center"
      >
        <p class="font-display text-2xl italic text-ink">
          Nenhuma exsicata encontrada para “{{ searchQuery }}”
        </p>
        <p class="mt-2 text-sm text-muted">
          Tente buscar por outro nome científico, popular, família ou localidade.
        </p>
        <button
          type="button"
          class="mt-5 cursor-pointer rounded-sm bg-botanical px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          @click="
            searchQuery = '';
            selectedFamily = '';
          "
        >
          Limpar filtros
        </button>
      </div>
    </main>

    <footer class="border-t border-ink/15 bg-paper-card/60 py-6 text-center">
      <div class="mx-auto max-w-6xl px-4">
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
          Herbário Jarros (SDR) · Universidade Federal do Maranhão
        </p>
        <p class="mt-1 text-xs text-muted">
          Projeto de Botânica — Curso de Ciências Biológicas · São Luís, MA
        </p>
      </div>
    </footer>

    <SpecimenModal :specimen="activeSpecimen" @close="activeSpecimen = null" />
  </div>
</template>