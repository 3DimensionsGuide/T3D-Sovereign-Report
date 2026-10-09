import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, TOUCH } from '@/theme/tokens';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  /** Plain line under the field saying why it is asked. */
  why?: string;
}

/** Labeled text input with a gold focus ring and a spoken-aloud error line. */
export function Field({ label, error, why, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="rgba(245,245,243,0.45)"
        selectionColor={colors.gold}
        keyboardAppearance="dark"
        {...inputProps}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        style={[styles.input, focused && styles.focused, !!error && styles.errored]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {'⚠  '}
          {error}
        </Text>
      ) : why ? (
        <Text style={styles.why}>{why}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 1, color: colors.parchmentMuted, textTransform: 'uppercase' },
  input: {
    minHeight: TOUCH,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.parchment,
  },
  focused: { borderColor: colors.gold },
  errored: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, fontSize: 14, color: colors.danger },
  why: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
});
