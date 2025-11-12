import { useState, useCallback } from 'react'
import { useInterval, useMount } from 'ahooks'
import { useNotificationInterval, useSetNotificationInterval } from '@/models/notification'
import { NumberKeyboard } from '@/components/NumberKeyboard.tsx'
import reminderIcon from '@/assets/reminder.svg'

// 播放提示音
const playNotificationSound = async () => {
  try {
    const AudioContextClass = window.AudioContext
    if (!AudioContextClass) {
      return
    }

    const audioContext = new AudioContextClass()

    // 如果 AudioContext 被暂停，尝试恢复（某些浏览器需要用户交互）
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const playBeep = (delay: number) => {
      const currentTime = audioContext.currentTime + delay
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // 设置音调（频率）
      oscillator.frequency.value = 600 // 600Hz，比较悦耳的提示音
      oscillator.type = 'sine' // 正弦波，声音更柔和

      // 设置音量包络（淡入淡出，避免突然的声音）
      gainNode.gain.setValueAtTime(0, currentTime)
      gainNode.gain.linearRampToValueAtTime(0.5, currentTime + 0.01) // 快速淡入
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5) // 淡出

      // 播放声音
      oscillator.start(currentTime)
      oscillator.stop(currentTime + 0.3) // 播放 0.3 秒
    }

    // 播放 3 次，形成"叮叮"的效果
    playBeep(0)
    playBeep(0.15)
    playBeep(0.3)
  } catch (error) {
    // 如果 AudioContext 不可用，静默失败
    console.warn('无法播放提示音:', error)
  }
}

// 显示通知
const showNotification = (minutes: number, onNotificationClick?: () => void) => {
  // 播放提示音
  playNotificationSound()

  // 格式化分钟数，如果是整数则显示整数，否则保留1位小数
  const formattedMinutes = Number.isInteger(minutes) ? minutes : minutes.toFixed(1)
  const options: NotificationOptions = {
    body: `时间到了！！！已经过去了 ${formattedMinutes} 分钟。`,
    icon: reminderIcon,
    tag: Math.random().toString(36),
  }

  const createNotification = () => {
    const notification = new Notification('定时提醒', options)
    // 点击通知时的处理
    notification.onclick = () => {
      // 聚焦到窗口
      window.focus()
      // 关闭通知
      notification.close()
      // 执行回调函数（停止计时）
      if (onNotificationClick) {
        onNotificationClick()
      }
    }
  }

  if (Notification.permission === 'granted') {
    createNotification()
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        createNotification()
      }
    })
  }
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
        </div>
      </div>
    </div>
  )
}
