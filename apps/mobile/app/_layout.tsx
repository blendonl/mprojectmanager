import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Slot } from 'expo-router';
import { ErrorBoundary } from '@shared/components';
import { ProjectProvider } from '../src/core/ProjectContext';
import { initializeContainer, setInitializationProgressCallback, resetContainer } from '../src/core/di/container';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '@shared/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = 'initializing' | 'ready' | 'error';

function RootLayoutContent() {
  const [appState, setAppState] = useState<AppState>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [initStep, setInitStep] = useState<string>('Setting up storage...');

  useEffect(() => {
    setInitializationProgressCallback((step: string) => {
      setInitStep(step);
    });

    initializeApp();

    return () => {
      setInitializationProgressCallback(null);
    };
  }, []);

  const initializeApp = async () => {
    setAppState('initializing');
    setInitStep('Initializing app...');
    try {
      resetContainer();
      await initializeContainer();
      setAppState('ready');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setErrorMessage(String(error));
      setAppState('error');
    }
  };

  const handleRetry = async () => {
    setErrorMessage('');
    await initializeApp();
  };

  const handleResetStorage = async () => {
    try {
      setInitStep('Resetting storage configuration...');
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
      setErrorMessage('');
      await initializeApp();
    } catch (error) {
      console.error('Failed to reset storage:', error);
      setErrorMessage(`Failed to reset storage: ${error}`);
    }
  };

  if (appState === 'initializing') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
        <Text style={styles.loadingText}>{initStep}</Text>
      </View>
    );
  }

  if (appState === 'error') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetail}>{errorMessage}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleResetStorage}
          >
            <Text style={styles.buttonTextSecondary}>Reset Storage Config</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ProjectProvider>
      <Slot />
      <StatusBar style="light" />
    </ProjectProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    color: theme.text.secondary,
    fontSize: 14,
  },
  errorText: {
    color: theme.accent.error,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    marginTop: 8,
    color: theme.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: theme.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.accent.primary,
  },
  buttonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: theme.accent.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
