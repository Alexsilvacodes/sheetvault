import { writable } from 'svelte/store';

export type Theme = 'default' | 'blades';

function createThemeStore() {
  const { subscribe, set } = writable<Theme>('default');

  return {
    subscribe,
    set,
    setFromTemplate: (templateSlug: string | undefined) => {
      if (templateSlug === 'blades-in-the-dark' || templateSlug === 'blades-crew') {
        set('blades');
      } else {
        set('default');
      }
    },
    reset: () => set('default')
  };
}

export const theme = createThemeStore();
