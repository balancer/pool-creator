"use client";

import { useEffect, useState } from "react";

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    const savedValue = window.localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};
