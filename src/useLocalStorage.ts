import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type LocalStorageType = string | number | boolean | null | undefined

export function useLocalStorage<S extends LocalStorageType>(
  key: string,
  initialState?: S | (() => S),
): [S, Dispatch<SetStateAction<S>>] {
  const [ val, setVal ] = useState<S>(() => {
    const parsed = localStorage.getItem(key)
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed)
      } catch { /* empty */ }
    }

    return typeof initialState === 'function' ? initialState() : initialState
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val))
  }, [ key, val ])

  return [ val, setVal ]
}
