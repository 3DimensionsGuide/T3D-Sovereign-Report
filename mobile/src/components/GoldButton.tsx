import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, TOUCH } from '@/theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** "ghost" is the quiet outlined version for secondary actions. */
  variant?: 'gold' | 'ghost';
}

export function GoldButton({ label, onPress, loading = false, disabled = false, variant = 'gold' }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const inactive = disabled || loading;
  const ghost = variant === 'ghost';

  const animateTo = (value: number) =>
    Animated.timing(scale, { toValue: value, duration: 120, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        style={[
          styles.base,
          ghost ? styles.ghost : styles.gold,
          inactive && styles.inactive,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={ghost ? colors.parchment : colors.obsidian} />
        ) : (
          <Text style={[styles.label, ghost && styles.ghostLabel]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gold: { backgroundColor: colors.gold },
  ghost: { borderWidth: 1, borderColor: colors.hairline, backgroundColor: 'transparent' },
  inactive: { opacity: 0.55 },
  label: { fontFamily: fonts.bodyBold, fontSize: 16, letterSpacing: 0.6, color: colors.obsidian },
  ghostLabel: { color: colors.parchment },
});
