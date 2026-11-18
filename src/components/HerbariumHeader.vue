<script setup lang="ts">
import { ref } from 'vue';

export type SortOption =
  | 'collection-asc'
  | 'collection-desc'
  | 'scientific-asc'
  | 'date-desc'
  | 'family-asc';

export type ViewMode = 'grid' | 'compact';

// Recebe as configurações atuais de ordenação e modo de exibição
defineProps<{
  sortBy: SortOption;
  viewMode: ViewMode;
}>();

const emit = defineEmits<{
  (e: 'update:sortBy', value: SortOption): void;
  (e: 'update:viewMode', value: ViewMode): void;
}>();

// Controla o fallback automático caso alguma imagem de logo ainda não exista na pasta
const herbariumLogoMissing = ref(false);
const ufmaLogoMissing = ref(false);
</script>

<template>
  <header class="border-b border-ink/15 bg-paper-card/80 backdrop-blur-sm">
    <div class="mx-auto max-w-6xl px-4 pt-5 pb-6 sm:px-6 sm:pt-10 sm:pb-9">
      <!-- 1. Barra Institucional UFMA: Texto à esquerda + Logo da UFMA à direita -->
      <div class="flex w-full items-center justify-between gap-3 border-b border-ink/10 pb-4 sm:gap-4 sm:pb-5">
        <div class="min-w-0">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-botanical sm:text-[11px] sm:tracking-[0.2em]">
            UFMA · Curso de Ciências Biológicas
          </p>
          <p class="mt-0.5 text-xs leading-snug text-muted sm:text-sm">
            Universidade Federal do Maranhão · Departamento de Biologia (Campus Bacanga)
          </p>
        </div>

        <img
          v-if="!ufmaLogoMissing"
          src="/logos/logo-ufma.png"
          alt="Logo da Universidade Federal do Maranhão (UFMA)"
          class="h-11 w-auto shrink-0 object-contain sm:h-15"
          @error="ufmaLogoMissing = true"
        />
      </div>

      <!-- 2. Bloco Principal Responsivo (CSS Grid):
           - Mobile: [Logo + Título] na 1ª linha e [Descrição + Curadoria] ocupando toda a largura na 2ª linha
           - Desktop (sm+): [Logo] à esquerda ocupando 2 linhas e [Título + Descrição] alinhados à direita -->
      <div class="mt-5 grid grid-cols-[auto_1fr] items-center gap-x-3.5 gap-y-3 sm:mt-7 sm:gap-x-6 sm:gap-y-0">
        <!-- Logo Redonda do Herbário -->
        <img
          v-if="!herbariumLogoMissing"
          src="/logos/herbariojarros.png"
          alt="Logo oficial do Herbário do Jarros (HBSRD)"
          class="h-18 w-18 shrink-0 rounded-full object-contain transition-transform duration-300 hover:scale-[1.03] sm:row-span-2 sm:h-28 sm:w-28 md:h-32 md:w-32"
          @error="herbariumLogoMissing = true"
        />

        <!-- Ícone de reserva redondo caso a imagem não seja encontrada -->
        <div
          v-else
          class="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border border-dashed border-botanical/40 bg-botanical-light text-botanical sm:row-span-2 sm:h-28 sm:w-28 md:h-32 md:w-32"
        >
          <svg
            class="h-9 w-9 sm:h-14 sm:w-14"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 30V11M18 22C13.5 22 10.5 19 10.5 14.5C15 14.5 18 17.5 18 22ZM18 18C22.5 18 25.5 15 25.5 10.5C21 10.5 18 13.5 18 18Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="18" cy="7.5" r="2.2" fill="currentColor" />
          </svg>
        </div>

        <!-- Título Principal -->
        <div class="min-w-0 sm:self-end">
          <h1 class="font-display text-[2rem] leading-[1.05] font-bold tracking-tight text-ink sm:text-6xl sm:leading-none md:text-7xl">
            Herbário do <em class="font-semibold text-botanical">Jarros</em>
          </h1>
        </div>

        <!-- Descrição e Curadoria -->
        <div class="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:mt-2.5 sm:self-start">
          <p class="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Acervo digital de exsicatas coletadas e catalogadas. Cada espécime acompanha sua etiqueta botânica oficial — sigla
            <strong class="font-semibold text-ink">HBSRD</strong>.
          </p>
          <p class="mt-1.5 font-mono text-xs text-botanical sm:mt-2">
            Projeto e curadoria: <strong class="font-semibold text-ink">Sofia Oliveira Pinheiro</strong>
          </p>
        </div>
      </div>

      <!-- 3. Barra de Controles Compacta: Ordenação + Alternador Grade / Lista na mesma linha -->
      <div class="mt-5 flex flex-col gap-2.5 border-t border-ink/10 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="font-mono text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
          Catálogo completo do acervo
        </p>

        <div class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <!-- Seletor de Ordenação -->
          <div class="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-initial">
            <label
              for="ordenar-acervo"
              class="sr-only font-mono text-[10px] uppercase tracking-wider text-muted sm:not-sr-only"
            >
              Ordenar:
            </label>
            <select
              id="ordenar-acervo"
              :value="sortBy"
              aria-label="Ordenar acervo"
              class="min-h-9 w-full min-w-0 cursor-pointer truncate rounded-sm border border-ink/20 bg-paper px-2.5 py-1.5 font-mono text-xs text-ink transition-colors focus:border-botanical focus:outline-none sm:w-auto"
              @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as SortOption)"
            >
              <option value="collection-asc">Nº Coleta (HSRD 0001 →)</option>
              <option value="collection-desc">Nº Coleta (Recentes)</option>
              <option value="scientific-asc">Espécie (A → Z)</option>
              <option value="family-asc">Família (A → Z)</option>
              <option value="date-desc">Data de Coleta</option>
            </select>
          </div>

          <!-- Alternância de Visualização -->
          <div
            role="group"
            aria-label="Modo de visualização"
            class="inline-flex shrink-0 rounded-sm border border-ink/20 bg-paper p-0.5"
          >
            <button
              type="button"
              :aria-pressed="viewMode === 'grid'"
              title="Visualização em Grade"
              class="flex min-h-8 cursor-pointer items-center gap-1.5 rounded-xs px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors"
              :class="
                viewMode === 'grid'
                  ? 'bg-botanical text-white font-semibold'
                  : 'text-muted hover:text-ink'
              "
              @click="emit('update:viewMode', 'grid')"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z" />
              </svg>
              <span>Grade</span>
            </button>

            <button
              type="button"
              :aria-pressed="viewMode === 'compact'"
              title="Visualização em Catálogo Compacto"
              class="flex min-h-8 cursor-pointer items-center gap-1.5 rounded-xs px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors"
              :class="
                viewMode === 'compact'
                  ? 'bg-botanical text-white font-semibold'
                  : 'text-muted hover:text-ink'
              "
              @click="emit('update:viewMode', 'compact')"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 2.5h14v2H1v-2zm0 4.5h14v2H1V7zm0 4.5h14v2H1v-2z" />
              </svg>
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>