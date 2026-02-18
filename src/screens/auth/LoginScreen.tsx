import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { Button, Text, Input } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, colors } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', auth: '' });

  const handleLogin = async () => {
    // Reset errors
    setErrors({ email: '', password: '', auth: '' });

    // Validation
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    try {
      await signIn(email, password);
      // Navigation handled automatically by RootNavigator
    } catch (error: any) {
      // Show secure error message that doesn't reveal too much information
      setErrors(prev => ({
        ...prev,
        auth: 'Invalid email or password. Please try again.'
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Branding Header */}
          <View style={styles.header}>
            <Text variant="h1" style={styles.brandTitle}>
              Intensely
            </Text>
            <Text variant="bodyLarge" color="secondary" style={styles.brandSubtitle}>
              High-Intensity Circuit Training
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Text variant="h2" style={styles.formTitle}>
              Welcome Back
            </Text>
            <Text variant="body" color="secondary" style={styles.formSubtitle}>
              Log in to continue your fitness journey
            </Text>

            {/* Auth Error Message */}
            {errors.auth ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.error[50], borderColor: colors.error[200] }]}>
                <Text style={{ color: colors.error[700] }}>{errors.auth}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: '', auth: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors(prev => ({ ...prev, password: '', auth: '' }));
              }}
              secureTextEntry
              error={errors.password}
              containerStyle={styles.inputContainer}
            />

            {/* Forgot Password Link */}
            <Button
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordLink}
              textStyle={[styles.linkText, { color: theme.text.secondary }]}
            >
              Forgot Password?
            </Button>

            <Button
              variant="primaryGradient"
              fullWidth
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            >
              Log In
            </Button>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text color="secondary">
                Not signed up yet?{' '}
              </Text>
              <Button
                variant="ghost"
                onPress={() => navigation.navigate('SignUp')}
                style={styles.signUpLinkButton}
                textStyle={styles.signUpLink}
              >
                Sign Up
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[5],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  brandTitle: {
    color: colors.primary[500],
    marginBottom: spacing[2],
  },
  brandSubtitle: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  formTitle: {
    marginBottom: spacing[2],
  },
  formSubtitle: {
    marginBottom: spacing[6],
  },
  errorBanner: {
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing[4],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing[4],
    paddingHorizontal: 0,
  },
  linkText: {
    fontSize: 14,
  },
  loginButton: {
    marginTop: spacing[2],
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  signUpLinkButton: {
    paddingHorizontal: 0,
    minHeight: 0,
  },
  signUpLink: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.primary[500],
  },
});

export default LoginScreen;
