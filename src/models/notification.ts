import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorageSync } from '@/utils/jotai'

const notificationIntervalAtom = atomWithStorageSync<number>(
  'jotai-ls:notification-interval',
  30, // minutes
)

export const useNotificationInterval = () => {
  return useAtomValue(notificationIntervalAtom)
}

export const useSetNotificationInterval = () => {
  return useSetAtom(notificationIntervalAtom)
}
