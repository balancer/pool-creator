"use client";

import { useEffect, useState } from "react";

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(defaultValue);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const savedValue = window.localStorage.getItem(key);
      if (savedValue) {
        setState(JSON.parse(savedValue));
      }
    }
  }, [hasMounted, key]);

  useEffect(() => {
    if (hasMounted) {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state, hasMounted]);

  return [state, setState] as const;
};
