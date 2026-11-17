<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { Specimen } from '@/types/specimen';

const props = defineProps<{
  specimen: Specimen | null;
  hasPrev: boolean;
  hasNext: boolean;
  currentPosition: number;
  totalCount: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'prev'): void;
  (e: 'next'): void;
}>();

const copiedType = ref<'link' | 'citation' | null>(null);
const isZoomed = ref(false);
const isFullscreen = ref(false);
const imageFailed = ref(false);
const zoomOrigin = ref({ x: 50, y: 50 });

const touchStartX = ref(0);
const touchStartY = ref(0);

const displayTitle = computed(
  () => props.specimen?.scientificName || props.specimen?.popularName || ''
);

// Reseta zoom, tela cheia e mensagens ao trocar de planta
watch(
  () => props.specimen?.id,
  () => {
    isZoomed.value = false;
    isFullscreen.value = false;
    imageFailed.value = false;
    zoomOrigin.value = { x: 50, y: 50 };
    copiedType.value = null;
  }
);

function updateZoomPosition(clientX: number, clientY: number, target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
  zoomOrigin.value = { x, y };
}

function handleImageClick(event: MouseEvent) {
  if (imageFailed.value) return;
  const target = event.currentTarget as HTMLElement;
  isZoomed.value = !isZoomed.value;
  if (isZoomed.value) {
    updateZoomPosition(event.clientX, event.clientY, target);
  }
}

function handleImageMouseMove(event: MouseEvent) {
  if (!isZoomed.value || imageFailed.value) return;
  updateZoomPosition(event.clientX, event.clientY, event.currentTarget as HTMLElement);
}

function handleImageTouchMove(event: TouchEvent) {
  if (!isZoomed.value || event.touches.length === 0) return;
  const touch = event.touches[0];
  if (!touch) return;
  updateZoomPosition(touch.clientX, touch.clientY, event.currentTarget as HTMLElement);
}

function handleModalTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
}

function handleModalTouchEnd(event: TouchEvent) {
  if (isZoomed.value) return;
  const touch = event.changedTouches[0];
  if (!touch) return;

  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;

  // Deslizar para esquerda/direita troca de planta no celular
  if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
    if (deltaX < 0 && props.hasNext) emit('next');
    if (deltaX > 0 && props.hasPrev) emit('prev');
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.specimen) return;
  if (event.key === 'Escape') {
    if (isZoomed.value) {
      isZoomed.value = false;
    } else if (isFullscreen.value) {
      isFullscreen.value = false;
    } else {
      emit('close');
    }
  } else if (event.key === 'ArrowLeft' && props.hasPrev) {
    emit('prev');
  } else if (event.key === 'ArrowRight' && props.hasNext) {
    emit('next');
  }
}

async function copyText(text: string, type: 'link' | 'citation') {
  try {
    await navigator.clipboard.writeText(text);
    copiedType.value = type;
    setTimeout(() => {
      copiedType.value = null;
    }, 2200);
  } catch {
    // Fallback silencioso
  }
}

function copySpecimenLink() {
  if (!props.specimen) return;
  const url = new URL(window.location.href);
  url.searchParams.set('planta', props.specimen.id);
  copyText(url.toString(), 'link');
}

function copySpecimenCitation() {
  if (!props.specimen) return;
  const s = props.specimen;
  const identificationLine = s.scientificName
    ? `Espécie: ${s.scientificName} ("${s.popularName}")`
    : `Nome Popular: ${s.popularName} (Espécie em identificação)`;
  const teamLine = s.contributor
    ? `Coletor: ${s.collector} | Acompanhante: ${s.contributor} | Data: ${s.date}`
    : `Coletor: ${s.collector} | Data: ${s.date}`;

  const formatted = [
    `Universidade Federal do Maranhão — Herbário do Jarros (HBSRD)`,
    `Nº Coleta: ${s.collectionNumber} | Família: ${s.family}`,
    identificationLine,
    `Localidade: ${s.locality}`,
    teamLine,
    `Observações: ${s.notes}`,
  ].join('\n');

  copyText(formatted, 'citation');
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="props.specimen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-2 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="`Detalhes de ${displayTitle}`"
        @click.self="emit('close')"
        @touchstart.passive="handleModalTouchStart"
        @touchend="handleModalTouchEnd"
      >
        <!-- Botão Anterior (Desktop lateral) -->
        <button
          v-if="props.hasPrev"
          type="button"
          aria-label="Exsicata anterior"
          class="mr-3 hidden h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/75 font-mono text-lg text-white transition-all hover:scale-105 hover:bg-botanical lg:flex"
          @click="emit('prev')"
        >
          ←
        </button>

        <!-- Painel Principal: Flex vertical fixo no mobile / Grid 2 colunas no desktop -->
        <div
          class="modal-panel relative flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-md bg-paper-card shadow-2xl transition-all duration-300 md:grid md:max-h-[92dvh] md:overflow-y-auto"
          :class="isFullscreen ? 'md:grid-cols-1' : 'md:grid-cols-2'"
        >
          <!-- 1. BARRA SUPERIOR FIXA NO CELULAR (sempre visível ao rolar) -->
          <div
            class="flex shrink-0 items-center justify-between gap-2 border-b border-ink/15 bg-paper-card px-3 py-2.5 md:hidden"
          >
            <div class="flex min-w-0 items-center gap-1.5">
              <button
                v-if="!imageFailed"
                type="button"
                class="min-h-9 cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors"
                :class="
                  isZoomed
                    ? 'bg-botanical text-white font-semibold'
                    : 'border border-ink/20 bg-paper text-ink'
                "
                @click.stop="isZoomed = !isZoomed"
              >
                {{ isZoomed ? '🔍 2.2x' : '🔍 Lupa' }}
              </button>

              <button
                type="button"
                class="min-h-9 cursor-pointer rounded-full border border-ink/20 bg-paper px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors active:bg-botanical active:text-white"
                @click.stop="isFullscreen = !isFullscreen"
              >
                {{ isFullscreen ? 'Ver ficha' : 'Tela cheia' }}
              </button>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <span class="font-mono text-[11px] font-semibold text-botanical">
                {{ props.specimen.collectionNumber }}
              </span>

              <button
                type="button"
                aria-label="Fechar visualização"
                class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ink font-mono text-sm text-white shadow-xs transition-colors active:bg-botanical"
                @click="emit('close')"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 2. ÁREA CENTRAL ROLÁVEL NO CELULAR (md:contents devolve o layout grid no desktop) -->
          <div class="flex-1 overflow-y-auto overscroll-contain md:contents">
            <!-- Fotografia da Exsicata com Lupa Interativa -->
            <div
              class="relative flex w-full items-center justify-center overflow-hidden bg-stone-900 select-none"
              :class="[
                isFullscreen
                  ? 'h-[74dvh] md:h-[86dvh]'
                  : 'h-[32dvh] min-h-52 max-h-72 md:h-auto md:min-h-[42dvh] md:max-h-[92dvh]',
                !imageFailed ? (isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : '',
              ]"
              @click="handleImageClick"
              @mousemove="handleImageMouseMove"
              @touchmove="handleImageTouchMove"
            >
              <!-- Barra Flutuante sobre a Imagem (apenas no Desktop) -->
              <div
                class="pointer-events-none absolute top-3 right-3 left-3 z-20 hidden items-center justify-between gap-2 md:flex"
              >
                <div class="pointer-events-auto flex items-center gap-1.5">
                  <button
                    v-if="!imageFailed"
                    type="button"
                    class="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider shadow-md backdrop-blur-xs transition-colors"
                    :class="
                      isZoomed
                        ? 'bg-botanical text-white font-semibold'
                        : 'bg-ink/80 text-white hover:bg-botanical'
                    "
                    @click.stop="isZoomed = !isZoomed"
                  >
                    {{ isZoomed ? '🔍 Lupa 2.2x Ativa' : '🔍 Lupa' }}
                  </button>

                  <button
                    type="button"
                    class="cursor-pointer rounded-full bg-ink/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white shadow-md backdrop-blur-xs transition-colors hover:bg-botanical"
                    @click.stop="isFullscreen = !isFullscreen"
                  >
                    {{ isFullscreen ? 'Mostrar ficha' : 'Tela cheia' }}
                  </button>
                </div>

                <!-- Botão Fechar visível sobre a imagem quando estiver em Tela Cheia no Desktop -->
                <button
                  v-if="isFullscreen"
                  type="button"
                  aria-label="Fechar visualização"
                  class="pointer-events-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-ink/85 font-mono text-sm text-white shadow-md transition-colors hover:bg-botanical"
                  @click.stop="emit('close')"
                >
                  ✕
                </button>
              </div>

              <img
                v-if="!imageFailed"
                :src="props.specimen.imageUrl"
                :alt="`Exsicata de ${displayTitle}`"
                class="h-full w-full transition-transform duration-200 ease-out"
                :class="isFullscreen ? 'object-contain' : 'object-cover'"
                :style="{
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                }"
                @error="imageFailed = true"
              />

              <!-- Fallback ocupa 100% da altura sem deixar faixa escura -->
              <div
                v-else
                class="flex h-full w-full flex-col items-center justify-center bg-botanical-light p-6 text-center text-botanical sm:p-8"
              >
                <span class="font-mono text-[11px] uppercase tracking-widest sm:text-xs">
                  {{ props.specimen.family }}
                </span>
                <span
                  class="mt-1 font-display text-2xl sm:text-3xl"
                  :class="{ italic: Boolean(props.specimen.scientificName) }"
                >
                  {{ displayTitle }}
                </span>
                <span class="mt-1.5 break-all font-mono text-[11px] text-muted sm:text-xs">
                  {{ props.specimen.imageUrl }}
                </span>
              </div>

              <span
                v-if="!imageFailed"
                class="pointer-events-none absolute bottom-2.5 left-2.5 rounded bg-ink/75 px-2.5 py-1 font-mono text-[10px] text-white/95 backdrop-blur-xs sm:bottom-3 sm:left-3"
              >
                {{ isZoomed ? 'Arraste para inspecionar' : 'Toque na foto para lupa' }}
              </span>

              <div
                v-if="isFullscreen"
                class="pointer-events-none absolute right-2.5 bottom-2.5 rounded bg-ink/80 px-3 py-1.5 text-right text-white backdrop-blur-xs sm:right-3 sm:bottom-3"
              >
                <p
                  class="font-display text-base leading-tight sm:text-lg"
                  :class="{ italic: Boolean(props.specimen.scientificName) }"
                >
                  {{ displayTitle }}
                </p>
                <p class="font-mono text-[10px] uppercase tracking-widest text-white/80">
                  {{ props.specimen.collectionNumber }} · {{ props.specimen.family }}
                </p>
              </div>
            </div>

            <!-- Painel da Ficha Catalográfica -->
            <div v-if="!isFullscreen" class="flex flex-col justify-between p-4 sm:p-7">
              <div>
                <!-- Cabeçalho da Ficha -->
                <div class="flex items-center justify-between gap-3 border-b-2 border-ink pb-2">
                  <span class="font-mono text-[11px] uppercase tracking-widest text-ink sm:text-xs">
                    Herbário do Jarros · HBSRD
                  </span>

                  <div class="flex shrink-0 items-center gap-3">
                    <span class="font-mono text-[11px] font-semibold text-botanical sm:text-xs">
                      Nº {{ props.specimen.collectionNumber }}
                    </span>

                    <!-- Botão Fechar alinhado no Desktop -->
                    <button
                      type="button"
                      aria-label="Fechar visualização"
                      title="Fechar (ESC)"
                      class="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-paper font-mono text-xs text-ink transition-colors hover:border-botanical hover:bg-botanical hover:text-white md:flex"
                      @click="emit('close')"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <!-- Família e Nome -->
                <p class="mt-3 font-mono text-[11px] uppercase tracking-widest text-botanical sm:mt-4 sm:text-xs">
                  {{ props.specimen.family }}
                </p>

                <template v-if="props.specimen.scientificName">
                  <h2 class="mt-0.5 font-display text-2xl leading-tight font-bold italic text-ink sm:mt-1 sm:text-3xl">
                    {{ props.specimen.scientificName }}
                  </h2>
                  <p class="text-sm text-muted sm:text-base">“{{ props.specimen.popularName }}”</p>
                </template>

                <template v-else>
                  <h2 class="mt-0.5 font-display text-2xl leading-tight font-bold text-ink sm:mt-1 sm:text-3xl">
                    {{ props.specimen.popularName }}
                  </h2>
                  <p class="font-mono text-[11px] italic text-muted sm:text-xs">
                    Espécie em identificação
                  </p>
                </template>

                <!-- Lista de Metadados -->
                <dl class="mt-3.5 divide-y divide-dashed divide-border-dashed border-y border-dashed border-border-dashed text-xs sm:mt-5 sm:text-sm">
                  <div class="py-1.5 sm:py-2">
                    <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Localidade</dt>
                    <dd class="mt-0.5 leading-snug text-ink">{{ props.specimen.locality }}</dd>
                  </div>

                  <div
                    class="grid gap-2.5 py-1.5 sm:gap-3 sm:py-2"
                    :class="props.specimen.contributor ? 'grid-cols-1 min-[360px]:grid-cols-2' : 'grid-cols-1'"
                  >
                    <div>
                      <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Coletor</dt>
                      <dd class="mt-0.5 text-ink">{{ props.specimen.collector }}</dd>
                    </div>
                    <div v-if="props.specimen.contributor">
                      <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Acompanhante</dt>
                      <dd class="mt-0.5 text-ink">{{ props.specimen.contributor }}</dd>
                    </div>
                  </div>

                  <div class="py-1.5 sm:py-2">
                    <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Data de Coleta</dt>
                    <dd class="mt-0.5 font-mono text-ink">{{ props.specimen.date }}</dd>
                  </div>

                  <div class="py-1.5 sm:py-2">
                    <dt class="font-mono text-[10px] uppercase tracking-wider text-muted">Observações</dt>
                    <dd class="mt-0.5 leading-snug text-ink">{{ props.specimen.notes }}</dd>
                  </div>
                </dl>

                <!-- Botões de Compartilhamento -->
                <div class="mt-4 grid grid-cols-2 gap-2 sm:mt-5">
                  <button
                    type="button"
                    class="min-h-10 cursor-pointer rounded-sm border border-botanical bg-botanical px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                    @click="copySpecimenLink"
                  >
                    {{ copiedType === 'link' ? '✓ Copiado!' : 'Copiar link' }}
                  </button>
                  <button
                    type="button"
                    class="min-h-10 cursor-pointer rounded-sm border border-ink/20 bg-paper px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors hover:border-botanical hover:text-botanical"
                    @click="copySpecimenCitation"
                  >
                    {{ copiedType === 'citation' ? '✓ Copiada!' : 'Copiar ficha' }}
                  </button>
                </div>

                <!-- Navegação Anterior / Próxima (visível no Desktop dentro do painel) -->
                <div class="mt-4 hidden items-center justify-between border-t border-ink/10 pt-3 md:flex">
                  <button
                    type="button"
                    :disabled="!props.hasPrev"
                    class="cursor-pointer rounded-sm border border-ink/20 bg-paper px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-botanical hover:text-botanical disabled:cursor-not-allowed disabled:opacity-35"
                    @click="emit('prev')"
                  >
                    ← Anterior
                  </button>

                  <span class="font-mono text-[11px] text-muted">
                    {{ props.currentPosition }} de {{ props.totalCount }}
                  </span>

                  <button
                    type="button"
                    :disabled="!props.hasNext"
                    class="cursor-pointer rounded-sm border border-ink/20 bg-paper px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-botanical hover:text-botanical disabled:cursor-not-allowed disabled:opacity-35"
                    @click="emit('next')"
                  >
                    Próxima →
                  </button>
                </div>
              </div>

              <p class="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted sm:mt-5">
                Universidade Federal do Maranhão · Departamento de Biologia
              </p>
            </div>
          </div>

          <!-- 3. BARRA INFERIOR FIXA NO CELULAR (sempre visível para navegar entre plantas) -->
          <div
            class="flex shrink-0 items-center justify-between border-t border-ink/15 bg-paper-card px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden"
          >
            <button
              type="button"
              :disabled="!props.hasPrev"
              class="min-h-10 cursor-pointer rounded-sm border border-ink/20 bg-paper px-3.5 py-1.5 font-mono text-xs text-ink transition-colors active:border-botanical active:text-botanical disabled:cursor-not-allowed disabled:opacity-35"
              @click="emit('prev')"
            >
              ← Anterior
            </button>

            <span class="font-mono text-xs font-medium text-muted">
              {{ props.currentPosition }} de {{ props.totalCount }}
            </span>

            <button
              type="button"
              :disabled="!props.hasNext"
              class="min-h-10 cursor-pointer rounded-sm border border-ink/20 bg-paper px-3.5 py-1.5 font-mono text-xs text-ink transition-colors active:border-botanical active:text-botanical disabled:cursor-not-allowed disabled:opacity-35"
              @click="emit('next')"
            >
              Próxima →
            </button>
          </div>
        </div>

        <!-- Botão Próxima (Desktop lateral) -->
        <button
          v-if="props.hasNext"
          type="button"
          aria-label="Próxima exsicata"
          class="ml-3 hidden h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-ink/75 font-mono text-lg text-white transition-all hover:scale-105 hover:bg-botanical lg:flex"
          @click="emit('next')"
        >
          →
        </button>
      </div>
    </Transition>
  </Teleport>
</template>