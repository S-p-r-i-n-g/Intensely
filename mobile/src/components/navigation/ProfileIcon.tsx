import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { colors } from '../../tokens';

type NavigationProp = DrawerNavigationProp<DrawerParamList>;

export const ProfileIcon = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuthStore();

  const initial = profile?.firstName?.charAt(0)?.toUpperCase() || 'U';

  const handlePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.initial}>{initial}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18, // Circular
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
