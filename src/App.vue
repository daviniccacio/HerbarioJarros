<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { specimens } from '@/data/specimens';
import type { Specimen } from '@/types/specimen';
import HerbariumHeader, { type SortOption, type ViewMode } from '@/components/HerbariumHeader.vue';
import SpecimenCard from '@/components/SpecimenCard.vue';
import SpecimenRow from '@/components/SpecimenRow.vue';
import SpecimenModal from '@/components/SpecimenModal.vue';

const searchQuery = ref('');
const selectedFamily = ref('');
const sortBy = ref<SortOption>('collection-asc');
const viewMode = ref<ViewMode>('grid');
const activeSpecimen = ref<Specimen | null>(null);

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Converte data "DD/MM/AAAA" em timestamp numérico para ordenação precisa
function parseBrDate(dateStr: string): number {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

const families = computed(() => {
  return Array.from(new Set(specimens.map((item) => item.family))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
});

const filteredAndSortedSpecimens = computed(() => {
  const query = normalizeText(searchQuery.value.trim());

  const filtered = specimens.filter((item) => {
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

  return [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'collection-desc':
        return b.collectionNumber.localeCompare(a.collectionNumber, 'pt-BR', { numeric: true });
      case 'scientific-asc':
        return a.scientificName.localeCompare(b.scientificName, 'pt-BR');
      case 'family-asc':
        return (
          a.family.localeCompare(b.family, 'pt-BR') ||
          a.scientificName.localeCompare(b.scientificName, 'pt-BR')
        );
      case 'date-desc':
        return parseBrDate(b.date) - parseBrDate(a.date);
      case 'collection-asc':
      default:
        return a.collectionNumber.localeCompare(b.collectionNumber, 'pt-BR', { numeric: true });
    }
  });
});

// Índice atual dentro da lista filtrada para navegação Anterior/Próxima no modal
const activeIndex = computed(() => {
  if (!activeSpecimen.value) return -1;
  return filteredAndSortedSpecimens.value.findIndex(
    (item) => item.id === activeSpecimen.value?.id
  );
});

function selectPrevSpecimen() {
  if (activeIndex.value > 0) {
    activeSpecimen.value = filteredAndSortedSpecimens.value[activeIndex.value - 1] ?? null;
  }
}

function selectNextSpecimen() {
  if (
    activeIndex.value >= 0 &&
    activeIndex.value < filteredAndSortedSpecimens.value.length - 1
  ) {
    activeSpecimen.value = filteredAndSortedSpecimens.value[activeIndex.value + 1] ?? null;
  }
}

// Restaura filtros, ordenação, modo de exibição e exsicata aberta a partir da URL
onMounted(() => {
  const params = new URLSearchParams(window.location.search);

  const urlFamily = params.get('familia');
  if (urlFamily && families.value.includes(urlFamily)) {
    selectedFamily.value = urlFamily;
  }

  const urlQuery = params.get('busca');
  if (urlQuery) {
    searchQuery.value = urlQuery;
  }

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

// Sincronização completa na URL sempre que qualquer estado mudar
watch(
  [activeSpecimen, selectedFamily, searchQuery, sortBy, viewMode],
  ([specimen, family, query, sort, mode]) => {
    const url = new URL(window.location.href);

    if (specimen) url.searchParams.set('planta', specimen.id);
    else url.searchParams.delete('planta');

    if (family) url.searchParams.set('familia', family);
    else url.searchParams.delete('familia');

    const trimmedQuery = query.trim();
    if (trimmedQuery) url.searchParams.set('busca', trimmedQuery);
    else url.searchParams.delete('busca');

    if (sort !== 'collection-asc') url.searchParams.set('ordem', sort);
    else url.searchParams.delete('ordem');

    if (mode !== 'grid') url.searchParams.set('modo', mode);
    else url.searchParams.delete('modo');

    window.history.replaceState({}, '', url.toString());
  }
);
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <HerbariumHeader
      v-model:search-query="searchQuery"
      v-model:selected-family="selectedFamily"
      v-model:sort-by="sortBy"
      v-model:view-mode="viewMode"
      :families="families"
      :total-count="specimens.length"
      :filtered-count="filteredAndSortedSpecimens.length"
    />

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div v-if="filteredAndSortedSpecimens.length > 0">
        <!-- Modo Grade Visual com Transição Animada FLIP -->
        <TransitionGroup
          v-if="viewMode === 'grid'"
          name="gallery"
          tag="section"
          aria-label="Galeria de exsicatas do Herbário Jarros"
          class="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12"
        >
          <SpecimenCard
            v-for="(specimen, index) in filteredAndSortedSpecimens"
            :key="specimen.id"
            :specimen="specimen"
            :index="index"
            @select="activeSpecimen = $event"
          />
        </TransitionGroup>

        <!-- Modo Catálogo Compacto com Transição Animada -->
        <TransitionGroup
          v-else
          name="gallery"
          tag="section"
          aria-label="Lista compacta de exsicatas do Herbário Jarros"
          class="relative flex flex-col gap-3.5"
        >
          <SpecimenRow
            v-for="specimen in filteredAndSortedSpecimens"
            :key="specimen.id"
            :specimen="specimen"
            @select="activeSpecimen = $event"
          />
        </TransitionGroup>
      </div>

      <!-- Estado vazio -->
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

    <SpecimenModal
      :specimen="activeSpecimen"
      :has-prev="activeIndex > 0"
      :has-next="activeIndex >= 0 && activeIndex < filteredAndSortedSpecimens.length - 1"
      :current-position="activeIndex + 1"
      :total-count="filteredAndSortedSpecimens.length"
      @close="activeSpecimen = null"
      @prev="selectPrevSpecimen"
      @next="selectNextSpecimen"
    />
  </div>
</template>