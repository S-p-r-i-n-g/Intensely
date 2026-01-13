import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Text } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, colors } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text variant="h1" style={styles.title}>
        Intensely
      </Text>
      <Text variant="bodyLarge" color="secondary" style={styles.subtitle}>
        High-Intensity Circuit Training
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          fullWidth
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Log In
        </Button>

        <Button
          variant="secondary"
          fullWidth
          onPress={() => navigation.navigate('SignUp')}
        >
          Sign Up
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  title: {
    color: colors.primary[500],
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[16],
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: spacing[3],
  },
});

export default WelcomeScreen;
