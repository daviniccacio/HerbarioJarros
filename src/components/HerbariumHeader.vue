<script setup lang="ts">
defineProps<{
  searchQuery: string;
  selectedFamily: string;
  families: string[];
  totalCount: number;
  filteredCount: number;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedFamily', value: string): void;
}>();
</script>

<template>
  <header class="border-b border-ink/15 bg-paper-card/75 backdrop-blur-sm">
    <div class="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-10">
      <!-- Barra Institucional Superior: Logo + Faculdade -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3.5">
          <!-- Emblema / Logo do Herbário Jarros (substituível por <img> oficial) -->
          <div
            class="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-botanical/25 bg-botanical-light text-botanical shadow-xs sm:h-15 sm:w-15"
            aria-hidden="true"
          >
            <svg
              class="h-8 w-8 sm:h-9 sm:w-9"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Vaso / Jarro estilizado + ramo botânico -->
              <path
                d="M18 30V11M18 22C13.5 22 10.5 19 10.5 14.5C15 14.5 18 17.5 18 22ZM18 18C22.5 18 25.5 15 25.5 10.5C21 10.5 18 13.5 18 18Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="18" cy="7.5" r="2.2" fill="currentColor" />
              <rect
                x="3"
                y="3"
                width="30"
                height="30"
                rx="7"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-dasharray="3 2"
              />
            </svg>
          </div>

          <div>
            <p class="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-botanical">
              UFMA · Curso de Ciências Biológicas
            </p>
            <p class="text-xs leading-snug text-muted sm:text-sm">
              Universidade Federal do Maranhão · Departamento de Biologia (Campus Bacanga)
            </p>
          </div>
        </div>

        <!-- Selo da Sigla Oficial e Contador -->
        <div class="flex items-center gap-2.5 self-start sm:self-center">
          <span
            class="inline-flex items-center rounded-md border border-botanical/30 bg-botanical-light px-2.5 py-1 font-mono text-xs font-semibold tracking-widest text-botanical"
          >
            SIGLA: SDR
          </span>
          <span
            class="inline-flex items-center rounded-md border border-ink/15 bg-paper px-2.5 py-1 font-mono text-xs text-muted"
          >
            {{ filteredCount }}/{{ totalCount }} exsicatas
          </span>
        </div>
      </div>

      <!-- Título Principal + Campo de Busca -->
      <div class="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="font-display text-4xl leading-none font-bold tracking-tight text-ink sm:text-6xl md:text-7xl">
            Herbário <em class="font-semibold text-botanical">Jarros</em>
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Acervo digital de exsicatas coletadas e catalogadas. Cada espécime acompanha sua etiqueta botânica oficial — sigla
            <strong class="font-semibold text-ink">SDR</strong>.
          </p>
        </div>

        <!-- Busca Responsiva -->
        <div class="w-full lg:w-80">
          <label for="busca-acervo" class="sr-only">
            Buscar espécie, nome popular, família ou localidade
          </label>
          <div class="relative">
            <input
              id="busca-acervo"
              type="search"
              :value="searchQuery"
              placeholder="Buscar espécie, família, local…"
              class="w-full border-b-2 border-ink bg-transparent py-2 pr-8 pl-1 font-mono text-sm text-ink transition-colors placeholder:text-muted/75 focus:border-botanical focus:outline-none"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            />
            <button
              v-if="searchQuery"
              type="button"
              aria-label="Limpar busca"
              class="absolute top-1/2 right-1 -translate-y-1/2 rounded p-1 font-mono text-xs text-muted hover:text-ink"
              @click="emit('update:searchQuery', '')"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Filtro rápido por Família Botânica (rolável horizontalmente no celular) -->
      <nav
        aria-label="Filtrar por família botânica"
        class="mt-6 flex items-center gap-2 overflow-x-auto pb-1"
      >
        <button
          type="button"
          class="shrink-0 cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors"
          :class="
            selectedFamily === ''
              ? 'bg-botanical text-white font-semibold'
              : 'border border-ink/15 bg-paper text-muted hover:border-botanical/40 hover:text-ink'
          "
          @click="emit('update:selectedFamily', '')"
        >
          Todas as famílias
        </button>

        <button
          v-for="family in families"
          :key="family"
          type="button"
          class="shrink-0 cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors"
          :class="
            selectedFamily === family
              ? 'bg-botanical text-white font-semibold'
              : 'border border-ink/15 bg-paper text-muted hover:border-botanical/40 hover:text-ink'
          "
          @click="emit('update:selectedFamily', family)"
        >
          {{ family }}
        </button>
      </nav>
    </div>
  </header>
</template>