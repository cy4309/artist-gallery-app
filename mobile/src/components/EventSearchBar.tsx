import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import EventDateRangeFilter from '@/components/EventDateRangeFilter';
import { useImeSafeInput } from '@/hooks/useImeSafeInput';
import { colors, radius, space, type } from '@/theme/tokens';

type EventSearchTriggerProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function EventSearchTrigger({
  expanded,
  onToggle,
}: EventSearchTriggerProps) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={expanded ? '關閉搜尋' : '搜尋活動關鍵字'}
    >
      <Text style={styles.triggerIcon}>{expanded ? '✕' : '⌕'}</Text>
    </Pressable>
  );
}

type EventSearchInlineProps = {
  expanded: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function EventSearchInline({
  expanded,
  value,
  onChange,
  placeholder = '搜尋活動關鍵字…',
}: EventSearchInlineProps) {
  const inputRef = useRef<TextInput>(null);
  const {
    draft,
    handleChangeText,
    handleBlur,
  } = useImeSafeInput(value, onChange);

  useEffect(() => {
    if (!expanded) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, [expanded]);

  return (
    <View
      style={[styles.inlineWrap, !expanded && styles.inlineCollapsed]}
      pointerEvents={expanded ? 'auto' : 'none'}
    >
      <TextInput
        ref={inputRef}
        value={draft}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        style={styles.inlineInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="default"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

type EventAdvancedSearchTriggerProps = {
  expanded: boolean;
  onToggle: () => void;
  active?: boolean;
};

export function EventAdvancedSearchTrigger({
  expanded,
  onToggle,
  active = false,
}: EventAdvancedSearchTriggerProps) {
  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <Text
        style={[
          styles.advancedTrigger,
          (expanded || active) && styles.advancedTriggerActive,
        ]}
      >
        進階篩選
      </Text>
    </Pressable>
  );
}

type EventAdvancedSearchPanelProps = {
  expanded: boolean;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onConfirmDates?: () => void;
  confirmDatesDisabled?: boolean;
  onClearDates?: () => void;
  dateHint?: string;
};

export function EventAdvancedSearchPanel({
  expanded,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onConfirmDates,
  confirmDatesDisabled,
  onClearDates,
  dateHint,
}: EventAdvancedSearchPanelProps) {
  if (!expanded) return null;

  return (
    <View style={styles.advancedPanel}>
      <EventDateRangeFilter
        from={dateFrom}
        to={dateTo}
        onFromChange={onDateFromChange}
        onToChange={onDateToChange}
        onConfirm={onConfirmDates}
        confirmDisabled={confirmDatesDisabled}
        onClear={onClearDates}
      />
      {dateHint ? <Text style={styles.dateHint}>{dateHint}</Text> : null}
    </View>
  );
}

/** @deprecated 使用 EventSearchInline */
export function EventSearchPanel({
  expanded,
  value,
  onChange,
}: {
  expanded: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={[styles.legacyPanel, !expanded && styles.legacyPanelHidden]}>
      <EventSearchInline expanded={expanded} value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  triggerIcon: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
  },
  inlineWrap: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  inlineCollapsed: {
    flex: 0,
    width: 0,
    opacity: 0,
  },
  inlineInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    fontSize: type.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  legacyPanel: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
  },
  legacyPanelHidden: {
    height: 0,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  advancedTrigger: {
    fontSize: type.caption,
    fontWeight: '600',
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  advancedTriggerActive: {
    color: colors.accentSoft,
  },
  advancedPanel: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    gap: space.sm,
  },
  dateHint: {
    fontSize: type.caption,
    color: colors.textDim,
    textAlign: 'right',
  },
});
