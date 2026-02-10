import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { api, type User } from '$lib/api';

const STORAGE_KEY = 'sheetvault_user';

function createUserStore() {
  const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const initial: User | null = stored ? JSON.parse(stored) : null;

  const { subscribe, set, update } = writable<User | null>(initial);

  return {
    subscribe,
    async login(username: string): Promise<User> {
      const user = await api.createOrGetUser(username);
      set(user);
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }
      return user;
    },
    logout() {
      set(null);
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    restore() {
      if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          set(JSON.parse(stored));
        }
      }
    }
  };
}

export const user = createUserStore();
export const isLoggedIn = derived(user, ($user) => $user !== null);
