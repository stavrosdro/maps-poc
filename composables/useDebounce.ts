export function useDebounce(
  callback: (...args: unknown[]) => void,
  debounceTime = 700
) {
  const timeout = ref<NodeJS.Timeout | null>();

  return function (...args: unknown[]) {
    if (timeout.value) {
      clearTimeout(timeout.value);
    }

    timeout.value = setTimeout(() => {
      callback(...args);
    }, debounceTime);
  };
}
