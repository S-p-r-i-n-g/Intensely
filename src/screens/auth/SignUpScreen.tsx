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

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

const SignUpScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { signUp, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [authError, setAuthError] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    // Reset error states
    setAuthError('');
    setUserExists(false);

    try {
      await signUp(email, password, { firstName, lastName });
      // Navigation handled automatically by RootNavigator
    } catch (error: any) {
      console.error('Sign up error:', error);

      // Check if user already exists
      const errorMessage = error.message || '';
      if (errorMessage.includes('already') || errorMessage.includes('exists') || error.code === '23505') {
        setUserExists(true);
        setAuthError('This email is already registered.');
      } else {
        setAuthError(error.message || 'Could not create account. Please try again.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Button
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
          style={styles.backLink}
          textStyle={{ color: theme.text.secondary }}
        >
          ← Back to Login
        </Button>

        <Text variant="h1" style={styles.title}>
          Create Account
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Start your fitness journey today
        </Text>

        {/* Auth Error Message */}
        {authError ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.error[50], borderColor: colors.error[200] }]}>
            <Text style={{ color: colors.error[700] }}>{authError}</Text>
            {userExists && (
              <Button
                variant="ghost"
                onPress={() => navigation.navigate('Login')}
                style={styles.backToLoginLink}
                textStyle={[styles.linkText, { color: colors.primary[600] }]}
              >
                Back to Sign In →
              </Button>
            )}
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setErrors(prev => ({ ...prev, firstName: '' }));
            }}
            error={errors.firstName}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setErrors(prev => ({ ...prev, lastName: '' }));
            }}
            error={errors.lastName}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: '' }));
            }}
            secureTextEntry
            error={errors.password}
            helperText="Minimum 6 characters"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }}
            secureTextEntry
            error={errors.confirmPassword}
            containerStyle={styles.inputContainer}
          />

          <Button
            variant="primary"
            fullWidth
            onPress={handleSignUp}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Sign Up
          </Button>
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
  },
  errorBanner: {
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing[4],
  },
  backToLoginLink: {
    marginTop: spacing[2],
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  button: {
    marginTop: spacing[3],
  },
});

export default SignUpScreen;
