import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'हिन्दी (Hindi)' },
  { id: 'bn', name: 'বাংলা (Bengali)' },
  { id: 'te', name: 'తెలుగు (Telugu)' },
  { id: 'mr', name: 'मराठी (Marathi)' },
  { id: 'ta', name: 'தமிழ் (Tamil)' },
  { id: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { id: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
];

export default function LanguageSelectionScreen() {
  const { completeOnboarding } = useAuthStore();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const handleContinue = () => {
    completeOnboarding(selectedLanguage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Please select your preferred language for the daily AI & Robotics news feed.</Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.langButton, isSelected && styles.langButtonActive]}
                onPress={() => setSelectedLanguage(lang.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.langText, isSelected && styles.langTextActive]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={handleContinue} activeOpacity={0.8}>
          <LinearGradient
            colors={['#0ea5e9', '#3b82f6']}
            style={styles.continueButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueText}>CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light slate background
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
    lineHeight: 24,
    fontWeight: '500',
  },
  list: {
    marginBottom: 20,
  },
  langButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  langButtonActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#f0f9ff',
  },
  langText: {
    fontSize: 17,
    color: '#475569',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#0284c7',
    fontWeight: '800',
  },
  continueButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
