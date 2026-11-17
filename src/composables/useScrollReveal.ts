import { onMounted, onUnmounted, ref } from 'vue';

export function useScrollReveal() {
  const elementRef = ref<HTMLElement | null>(null);
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    // Se o navegador não suportar IntersectionObserver, exibe imediatamente
    if (typeof IntersectionObserver === 'undefined') {
      isVisible.value = true;
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            isVisible.value = true;
            observer?.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    if (elementRef.value) {
      observer.observe(elementRef.value);
    } else {
      isVisible.value = true;
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return {
    elementRef,
    isVisible,
  };
}