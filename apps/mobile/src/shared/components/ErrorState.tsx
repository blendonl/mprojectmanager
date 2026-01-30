import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from './Button';
import theme from '@shared/theme';
import AppIcon, { AppIconName } from './icons/AppIcon';

type ErrorType = 'network' | 'notFound' | 'validation' | 'server' | 'unknown';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  retryLabel?: string;
}

const ERROR_CONFIG: Record<ErrorType, { icon: AppIconName; title: string; message: string }> = {
  network: {
    icon: 'cloud-offline',
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
  },
  notFound: {
    icon: 'search',
    title: 'Not Found',
    message: 'The requested resource could not be found.',
  },
  validation: {
    icon: 'alert-circle',
    title: 'Validation Error',
    message: 'The provided data is invalid. Please check your input and try again.',
  },
  server: {
    icon: 'warning',
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
  },
  unknown: {
    icon: 'help-circle',
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.',
  },
};

const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'unknown',
  title,
  message,
  error,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  const config = ERROR_CONFIG[type];
  const displayTitle = title || config.title;
  const displayMessage = message || error?.message || config.message;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AppIcon name={config.icon} size={64} color={theme.accent.error} />
      </View>

      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.message}>{displayMessage}</Text>

      {onRetry && (
        <PrimaryButton
          title={retryLabel}
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}

      {__DEV__ && error && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>{error.stack || error.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.background.primary,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    minWidth: 140,
  },
  debugContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.background.elevatedHigh,
    borderRadius: theme.radius.md,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accent.error,
    marginBottom: theme.spacing.xs,
  },
  debugText: {
    fontSize: 11,
    color: theme.text.secondary,
    fontFamily: 'monospace',
  },
});

export default ErrorState;
