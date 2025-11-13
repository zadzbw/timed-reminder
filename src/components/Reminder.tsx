import { useState, useCallback } from 'react'
import { useInterval, useMount } from 'ahooks'
import { useNotificationInterval, useSetNotificationInterval } from '@/models/notification'
import { NumberKeyboard } from '@/components/NumberKeyboard.tsx'
import { getPageQuery } from '@/utils/qs.ts'
import { showNotification } from '@/utils/notification.ts'

const TestButton = ({ onClose }: { onClose: () => void }) => {
  const query = getPageQuery()

  if (query.test === '1') {
    return (
      <button
        type="button"
        onClick={() => {
          showNotification(Math.round(Math.random() * 10), onClose)
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
    setIsRunning(true)
  }, [])

  // 结束定时
  const handleStop = useCallback(() => {
    setIsRunning(false)
    setTimeRemaining(Math.round(notificationInterval * 60)) // 四舍五入为整数秒
  }, [notificationInterval])

  // 定时器逻辑
  useInterval(
    () => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // 时间到了，显示通知并重置计时器
          // 传递停止计时的回调函数
          showNotification(notificationInterval, handleStop)
          return Math.round(notificationInterval * 60) // 四舍五入为整数秒
        }
        return prev - 1
      })
    },
    isRunning ? 1000 : undefined,
  )

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
