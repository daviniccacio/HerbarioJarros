<script setup lang="ts">
// Define propriedades opcionais com valores padrão idênticos aos que estavam no App.vue.
// Isso permite usar <HerbariumFooter /> diretamente ou personalizar os textos no futuro.
withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
  }>(),
  {
    title: 'Herbário do Jarros (HBSRD) · Universidade Federal do Maranhão',
    subtitle: 'Projeto de Botânica — Curso de Ciências Biológicas · São Luís, MA',
  }
);
</script>

<template>
  <footer class="border-t border-ink/15 bg-paper-card/60 py-6 text-center">
    <div class="mx-auto max-w-7xl px-4">
      <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
        {{ title }}
      </p>
      <p class="mt-1 text-xs text-muted">
        {{ subtitle }}
      </p>
    </div>
  </footer>
</template>