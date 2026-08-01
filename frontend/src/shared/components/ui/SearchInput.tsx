import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { Text } from '../primitives/Text';

import { Input, type InputProps } from './Input';

export type SearchInputProps = Omit<InputProps, 'trailing' | 'value' | 'onChangeText'> & {
  /** Appele apres le delai de debounce, pas a chaque frappe. */
  onSearch: (query: string) => void;
  /** C1 §13 impose 350ms. */
  debounceMs?: number;
};

/**
 * Champ de recherche — C1 (bibliotheque d'exercices).
 *
 * C1 §9 BR-1 : la recherche part au serveur, jamais filtree cote client sur une liste
 * deja paginee. Le debounce evite une requete par frappe sur 873 exercices.
 */
export function SearchInput({ onSearch, debounceMs = 350, ...props }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(query), debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, debounceMs, onSearch]);

  return (
    <Input
      {...props}
      value={query}
      onChangeText={setQuery}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      trailing={
        query.length > 0 ? (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche"
            className="min-h-touch justify-center pl-3 active:opacity-70"
          >
            <Text variant="link" color="support">
              Effacer
            </Text>
          </Pressable>
        ) : null
      }
    />
  );
}
