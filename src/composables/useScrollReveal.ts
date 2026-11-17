import { onUnmounted, ref, type ComponentPublicInstance } from 'vue';

export function useScrollReveal() {
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  function observeElement(el: Element | ComponentPublicInstance | null) {
    if (!el || isVisible.value) return;

    const target =
      el instanceof HTMLElement
        ? el
        : '$el' in el && el.$el instanceof HTMLElement
          ? el.$el
          : null;

    if (!target || typeof IntersectionObserver === 'undefined') {
      isVisible.value = true;
      return;
    }

    observer?.disconnect();
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

    observer.observe(target);
  }

  onUnmounted(() => {
    observer?.disconnect();
  });

  return {
    observeElement,
    isVisible,
  };
}