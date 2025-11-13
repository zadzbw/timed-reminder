import reminderIcon from '@/assets/reminder.svg'

// 显示通知
export const showNotification = async (minutes: number, onNotificationClick?: () => void) => {
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
