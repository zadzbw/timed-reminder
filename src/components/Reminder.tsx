import { useState, useCallback, useRef, useEffect } from 'react'
import { useInterval, useMount } from 'ahooks'
import { useNotificationInterval, useSetNotificationInterval } from '@/models/notification'
import { NumberKeyboard } from '@/components/NumberKeyboard.tsx'
import { getPageQuery } from '@/utils/qs.ts'
import { playSound } from '@/utils/audio.ts'
import { showNotification } from '@/utils/notification.ts'

const TestButton = ({ onClose }: { onClose: () => void }) => {
  const query = getPageQuery()

  if (query.test === '1') {
    return (
      <button
        type="button"
        onClick={async () => {
          const pauseSound = await playSound()
          showNotification(Math.round(Math.random() * 10), () => {
            pauseSound()
            onClose()
          })
        }}
        className="btn btn-error flex-1"
      >
        Test
      </button>
    )
  }

  return null
}

export const Reminder = () => {
  const notificationInterval = useNotificationInterval()
  const setNotificationInterval = useSetNotificationInterval()

  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(Math.round(notificationInterval * 60)) // 转换为秒，四舍五入
  const [inputInterval, setInputInterval] = useState(notificationInterval.toString())

  // 使用时间戳来准确计算剩余时间，避免页面后台时 setInterval 被节流
  const startTimeRef = useRef<number | null>(null)
  const targetTimeRef = useRef<number | null>(null)
  const pauseSoundRef = useRef<() => void>(() => {})

  // 请求通知权限
  useMount(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  })

  const handleKeyboardChange = useCallback(
    (v: string) => {
      const value = Number(v)
      if (!isNaN(value) && value >= 0) {
        setNotificationInterval(value)
        setTimeRemaining(Math.round(value * 60))
      } else {
        setNotificationInterval(0)
        setTimeRemaining(Math.round(0))
      }
      setInputInterval(v)
    },
    [setNotificationInterval],
  )

  // 开始定时
  const handleStart = useCallback(() => {
    const now = Date.now()
    const targetSeconds = Math.round(notificationInterval * 60)
    startTimeRef.current = now
    targetTimeRef.current = now + targetSeconds * 1000
    setIsRunning(true)
    setTimeRemaining(targetSeconds)
  }, [notificationInterval])

  // 结束定时
  const handleStop = useCallback(() => {
    setIsRunning(false)
    startTimeRef.current = null
    targetTimeRef.current = null
    pauseSoundRef.current()
    setTimeRemaining(Math.round(notificationInterval * 60)) // 四舍五入为整数秒
  }, [notificationInterval])

  // 定时器逻辑 - 基于时间戳计算，避免页面后台时被节流
  useInterval(
    async () => {
      if (!targetTimeRef.current) return

      const now = Date.now()
      const remaining = Math.max(0, Math.round((targetTimeRef.current - now) / 1000))

      if (remaining <= 0) {
        // 时间到了，显示通知并重置计时器
        pauseSoundRef.current = await playSound()
        showNotification(notificationInterval, handleStop)
        // 播放提示音
        // 重新开始下一个周期
        const targetSeconds = Math.round(notificationInterval * 60)
        targetTimeRef.current = now + targetSeconds * 1000
        setTimeRemaining(targetSeconds)
      } else {
        setTimeRemaining(remaining)
      }
    },
    isRunning ? 1000 : undefined,
  )

  // 监听页面可见性变化，页面重新激活时重新计算时间
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && targetTimeRef.current) {
        // 页面重新激活，立即更新剩余时间
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((targetTimeRef.current - now) / 1000))
        setTimeRemaining(remaining)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning])

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">定时提醒</h1>

      <div className="flex w-full max-w-md flex-col gap-4">
        {/* 间隔设置 */}
        <NumberKeyboard
          value={inputInterval}
          onChange={handleKeyboardChange}
          integerLimit={4}
          decimalLimit={1}
          disabled={isRunning}
        />

        {/* 倒计时显示 */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body items-center">
            <h2 className="card-title">剩余时间</h2>
            <div className="my-4 font-mono text-6xl font-bold">{formatTime(timeRemaining)}</div>
            <div className="text-base-content/60 text-sm">{isRunning ? '运行中...' : '已停止'}</div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning || notificationInterval <= 0}
            className="btn btn-primary flex-1"
          >
            开始
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={!isRunning}
            className="btn btn-error flex-1"
          >
            结束
          </button>
          <TestButton onClose={handleStop} />
        </div>
      </div>
    </div>
  )
}
