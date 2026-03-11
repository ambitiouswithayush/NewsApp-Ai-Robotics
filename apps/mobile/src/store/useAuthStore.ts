import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isFirstLaunch: boolean | null;
  language: string | null;
  checkFirstLaunch: () => Promise<void>;
  completeOnboarding: (selectedLang: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isFirstLaunch: null,
  language: null,

  checkFirstLaunch: async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunchedBefore');
      const savedLang = await AsyncStorage.getItem('userLanguage');
      
      if (hasLaunched === null) {
        set({ isFirstLaunch: true });
      } else {
        set({ isFirstLaunch: false, language: savedLang });
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      set({ isFirstLaunch: false });
    }
  },

  completeOnboarding: async (selectedLang: string) => {
    try {
      await AsyncStorage.setItem('hasLaunchedBefore', 'true');
      await AsyncStorage.setItem('userLanguage', selectedLang);
      set({ isFirstLaunch: false, language: selectedLang });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  },
}));
