<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
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

// Controle de gesto swipe no celular
const touchStartX = ref(0);
const touchStartY = ref(0);

// Reseta zoom, tela cheia e estado da imagem ao trocar de planta
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
  // Não troca de planta se o usuário estiver inspecionando com a lupa ativa
  if (isZoomed.value) return;
  const touch = event.changedTouches[0];
  if (!touch) return;

  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;

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
  const formatted = [
    `Herbário Jarros (SDR) — UFMA`,
    `Nº Coleta: ${s.collectionNumber} | Família: ${s.family}`,
    `Espécie: ${s.scientificName} ("${s.popularName}")`,
    `Localidade: ${s.locality}`,
    `Coletor: ${s.collector} | Contribuidor: ${s.contributor} | Data: ${s.date}`,
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-2.5 backdrop-blur-xs sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="`Detalhes de ${props.specimen.scientificName}`"
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

        <!-- Painel Principal do Modal -->
        <div
          class="modal-panel relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-sm bg-paper-card shadow-2xl transition-all duration-300"
          :class="isFullscreen ? 'md:grid-cols-1' : 'md:grid md:grid-cols-2'"
        >
          <!-- Barra Flutuante de Controles no Topo da Imagem -->
          <div class="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <div class="flex items-center gap-1.5 pointer-events-auto">
              <!-- Botão Lupa Botânica -->
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

              <!-- Botão Modo Tela Cheia Pura -->
              <button
                type="button"
                class="cursor-pointer rounded-full bg-ink/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white shadow-md backdrop-blur-xs transition-colors hover:bg-botanical"
                @click.stop="isFullscreen = !isFullscreen"
              >
                {{ isFullscreen ? 'Mostrar ficha' : 'Tela cheia' }}
              </button>
            </div>

            <!-- Botão Fechar -->
            <button
              type="button"
              aria-label="Fechar visualização"
              class="pointer-events-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-ink/85 font-mono text-sm text-white shadow-md transition-colors hover:bg-botanical"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Área da Fotografia com Lupa Interativa -->
          <div
            class="relative flex items-center justify-center overflow-hidden bg-stone-900 select-none"
            :class="[
              isFullscreen ? 'h-[86dvh]' : 'min-h-[42dvh] max-h-[56dvh] md:max-h-[92dvh]',
              !imageFailed ? (isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : '',
            ]"
            @click="handleImageClick"
            @mousemove="handleImageMouseMove"
            @touchmove="handleImageTouchMove"
          >
            <img
              v-if="!imageFailed"
              :src="props.specimen.imageUrl"
              :alt="`Exsicata de ${props.specimen.scientificName}`"
              class="h-full w-full transition-transform duration-200 ease-out"
              :class="isFullscreen ? 'object-contain' : 'object-cover'"
              :style="{
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
              }"
              @error="imageFailed = true"
            />

            <!-- Fallback caso a imagem ainda não exista -->
            <div
              v-else
              class="flex h-full min-h-72 w-full flex-col items-center justify-center bg-botanical-light p-8 text-center text-botanical"
            >
              <span class="font-mono text-xs uppercase tracking-widest">Fotografia da Exsicata</span>
              <span class="mt-1 font-display text-3xl italic">{{ props.specimen.scientificName }}</span>
              <span class="mt-2 font-mono text-xs text-muted">{{ props.specimen.imageUrl }}</span>
            </div>

            <!-- Dica discreta na base da foto -->
            <span
              v-if="!imageFailed"
              class="pointer-events-none absolute bottom-3 left-3 rounded bg-ink/70 px-2.5 py-1 font-mono text-[10px] text-white/90 backdrop-blur-xs"
            >
              {{ isZoomed ? 'Mova para inspecionar · Clique para sair' : 'Clique na foto para ativar a lupa' }}
            </span>

            <!-- Legenda discreta no Modo Tela Cheia Pura -->
            <div
              v-if="isFullscreen"
              class="pointer-events-none absolute bottom-3 right-3 rounded bg-ink/80 px-3 py-1.5 text-right text-white backdrop-blur-xs"
            >
              <p class="font-display text-lg italic leading-tight">{{ props.specimen.scientificName }}</p>
              <p class="font-mono text-[10px] uppercase tracking-widest text-white/80">
                {{ props.specimen.collectionNumber }} · {{ props.specimen.family }}
              </p>
            </div>
          </div>

          <!-- Painel Direito: Ficha Catalográfica (oculto no Modo Tela Cheia Pura) -->
          <div v-if="!isFullscreen" class="flex flex-col justify-between p-5 sm:p-7">
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

              <!-- Ações rápidas de compartilhamento -->
              <div class="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="flex-1 cursor-pointer rounded-sm border border-botanical bg-botanical px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                  @click="copySpecimenLink"
                >
                  {{ copiedType === 'link' ? '✓ Link copiado!' : 'Copiar link' }}
                </button>
                <button
                  type="button"
                  class="flex-1 cursor-pointer rounded-sm border border-ink/20 bg-paper px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors hover:border-botanical hover:text-botanical"
                  @click="copySpecimenCitation"
                >
                  {{ copiedType === 'citation' ? '✓ Ficha copiada!' : 'Copiar ficha' }}
                </button>
              </div>

              <!-- Barra de Navegação Anterior / Próxima (Mobile e Tablet) -->
              <div class="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
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

            <p class="mt-5 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
              Universidade Federal do Maranhão · Departamento de Biologia
            </p>
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