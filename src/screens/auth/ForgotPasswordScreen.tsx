import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { supabase } from '../../config/supabase';
import { Button, Text, Input } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, colors } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);

    // Validation
    if (!email) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'intensely://reset-password', // Deep link for password reset
      });

      if (resetError) {
        // Don't reveal if email exists or not for security
        console.error('Password reset error:', resetError);
      }

      // Always show success message (even if email doesn't exist)
      // This prevents email enumeration attacks
      setSuccess(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.inner}>
          <View style={styles.successContainer}>
            <Text variant="h2" style={styles.successTitle}>
              Check Your Email
            </Text>
            <Text variant="body" color="secondary" style={styles.successMessage}>
              If an account exists with {email}, we've sent password reset instructions to that email address.
            </Text>
            <Text variant="body" color="secondary" style={styles.successHint}>
              Please check your inbox and spam folder.
            </Text>

            <Button
              variant="primary"
              fullWidth
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            >
              Back to Login
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Button
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.backLink}
          textStyle={{ color: theme.text.secondary }}
        >
          ← Back to Login
        </Button>

        <Text variant="h2" style={styles.title}>
          Forgot Password?
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.error[50], borderColor: colors.error[200] }]}>
            <Text style={{ color: colors.error[700] }}>{error}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
          error={error}
          containerStyle={styles.inputContainer}
        />

        <Button
          variant="primaryGradient"
          fullWidth
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={isLoading}
          style={styles.resetButton}
        >
          Send Reset Instructions
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[5],
  },
  backLink: {
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[8],
    lineHeight: 22,
  },
  errorBanner: {
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing[4],
  },
  inputContainer: {
    marginBottom: spacing[6],
  },
  resetButton: {
    marginTop: spacing[2],
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  successMessage: {
    marginBottom: spacing[3],
    textAlign: 'center',
    lineHeight: 22,
  },
  successHint: {
    marginBottom: spacing[8],
    textAlign: 'center',
    fontSize: 14,
  },
  backButton: {
    marginTop: spacing[4],
  },
});

export default ForgotPasswordScreen;
