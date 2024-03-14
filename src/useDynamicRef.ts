import { RefCallback, useCallback, useState } from 'react';

export function useDynamicRef<S>(): [S | undefined, RefCallback<S>] {
  const [ ref, setRef ] = useState<S>()
  const setRefCallback = useCallback((inst: S) => setRef(inst), [])

  return [ ref, setRefCallback ]
}
