import {
  // eslint-disable-next-line no-restricted-imports
  atomWithStorage as JotaiAtomWithStorage,
} from 'jotai/utils'

export const atomWithStorage = <Value>(
  key: string,
  initialValue: Value,
) => {
  return JotaiAtomWithStorage(key, initialValue, undefined, { getOnInit: false })
}

export const atomWithStorageSync = <Value>(
  key: string,
  initialValue: Value,
) => {
  return JotaiAtomWithStorage(key, initialValue, undefined, { getOnInit: true })
}
