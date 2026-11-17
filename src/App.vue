<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { specimens } from '@/data/specimens';
import type { Specimen } from '@/types/specimen';
import HerbariumHeader, { type SortOption, type ViewMode } from '@/components/HerbariumHeader.vue';
import HerbariumFooter from '@/components/HerbariumFooter.vue';
import SpecimenCard from '@/components/SpecimenCard.vue';
import SpecimenRow from '@/components/SpecimenRow.vue';
import SpecimenModal from '@/components/SpecimenModal.vue';

const sortBy = ref<SortOption>('collection-asc');
const viewMode = ref<ViewMode>('grid');
const activeSpecimen = ref<Specimen | null>(null);

// Converte data "DD/MM/AAAA" em timestamp numérico para ordenação cronológica
function parseBrDate(dateStr: string): number {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

// Ordena todas as exsicatas conforme o critério selecionado pelo usuário
const sortedSpecimens = computed(() => {
  return [...specimens].sort((a, b) => {
    const nameA = a.scientificName || a.popularName;
    const nameB = b.scientificName || b.popularName;

    switch (sortBy.value) {
      case 'collection-desc':
        return b.collectionNumber.localeCompare(a.collectionNumber, 'pt-BR', { numeric: true });
      case 'scientific-asc':
        return nameA.localeCompare(nameB, 'pt-BR');
      case 'family-asc':
        return (
          a.family.localeCompare(b.family, 'pt-BR') ||
          nameA.localeCompare(nameB, 'pt-BR')
        );
      case 'date-desc':
        return parseBrDate(b.date) - parseBrDate(a.date);
      case 'collection-asc':
      default:
        return a.collectionNumber.localeCompare(b.collectionNumber, 'pt-BR', { numeric: true });
    }
  });
});

// Índice atual da exsicata aberta para navegação Anterior/Próxima no modal
const activeIndex = computed(() => {
  if (!activeSpecimen.value) return -1;
  return sortedSpecimens.value.findIndex(
    (item) => item.id === activeSpecimen.value?.id
  );
});

function selectPrevSpecimen() {
  if (activeIndex.value > 0) {
    activeSpecimen.value = sortedSpecimens.value[activeIndex.value - 1] ?? null;
  }
}

function selectNextSpecimen() {
  if (
    activeIndex.value >= 0 &&
    activeIndex.value < sortedSpecimens.value.length - 1
  ) {
    activeSpecimen.value = sortedSpecimens.value[activeIndex.value + 1] ?? null;
  }
}

// Restaura ordenação, modo de exibição e exsicata aberta a partir da URL
onMounted(() => {
  const params = new URLSearchParams(window.location.search);

  const urlSort = params.get('ordem') as SortOption | null;
  const validSorts: SortOption[] = [
    'collection-asc',
    'collection-desc',
    'scientific-asc',
    'date-desc',
    'family-asc',
  ];
  if (urlSort && validSorts.includes(urlSort)) {
    sortBy.value = urlSort;
  }

  const urlMode = params.get('modo');
  if (urlMode === 'compact' || urlMode === 'grid') {
    viewMode.value = urlMode;
  }

  const sharedId = params.get('planta');
  if (sharedId) {
    const found = specimens.find((item) => item.id === sharedId);
    if (found) activeSpecimen.value = found;
  }
});

// Mantém a URL sincronizada com a exsicata aberta, ordenação e modo de exibição
watch(
  [activeSpecimen, sortBy, viewMode],
  ([specimen, sort, mode]) => {
    const url = new URL(window.location.href);

    if (specimen) url.searchParams.set('planta', specimen.id);
    else url.searchParams.delete('planta');

    if (sort !== 'collection-asc') url.searchParams.set('ordem', sort);
    else url.searchParams.delete('ordem');

    if (mode !== 'grid') url.searchParams.set('modo', mode);
    else url.searchParams.delete('modo');

    url.searchParams.delete('familia');
    url.searchParams.delete('busca');

    window.history.replaceState({}, '', url.toString());
  }
);
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <HerbariumHeader
      v-model:sort-by="sortBy"
      v-model:view-mode="viewMode"
    />

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <!-- Modo Grade: 1 coluna (celular) -> 2 colunas (tablet) -> 3 colunas (desktop) -->
      <TransitionGroup
        v-if="viewMode === 'grid'"
        name="gallery"
        tag="section"
        aria-label="Galeria de exsicatas do Herbário do Jarros"
        class="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        <SpecimenCard
          v-for="(specimen, index) in sortedSpecimens"
          :key="specimen.id"
          :specimen="specimen"
          :index="index"
          @select="activeSpecimen = $event"
        />
      </TransitionGroup>

      <!-- Modo Catálogo Compacto -->
      <TransitionGroup
        v-else
        name="gallery"
        tag="section"
        aria-label="Lista compacta de exsicatas do Herbário do Jarros"
        class="relative flex flex-col gap-3.5"
      >
        <SpecimenRow
          v-for="specimen in sortedSpecimens"
          :key="specimen.id"
          :specimen="specimen"
          @select="activeSpecimen = $event"
        />
      </TransitionGroup>
    </main>

    <HerbariumFooter />

    <SpecimenModal
      :specimen="activeSpecimen"
      :has-prev="activeIndex > 0"
      :has-next="activeIndex >= 0 && activeIndex < sortedSpecimens.length - 1"
      :current-position="activeIndex + 1"
      :total-count="sortedSpecimens.length"
      @close="activeSpecimen = null"
      @prev="selectPrevSpecimen"
      @next="selectNextSpecimen"
    />
  </div>
</template>