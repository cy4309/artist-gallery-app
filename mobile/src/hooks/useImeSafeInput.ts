import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 組字／輸入期間用本地 draft 顯示，延遲同步父層，避免受控 input 被重繪重置。
 * RN 原生 TextInput 無 composition 事件，以 debounce 作為替代策略。
 */
export function useImeSafeInput(
  value: string,
  onChange: (value: string) => void,
  debounceMs = 200
) {
  const [draft, setDraft] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (value !== draftRef.current) {
      setDraft(value);
    }
  }, [value]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const commit = useCallback(
    (text: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      onChange(text);
    },
    [onChange]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      setDraft(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => commit(text), debounceMs);
    },
    [commit, debounceMs]
  );

  const handleBlur = useCallback(() => {
    commit(draftRef.current);
  }, [commit]);

  return {
    draft,
    handleChangeText,
    handleBlur,
  };
}
