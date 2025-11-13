// 播放提示音
export const playSound = async () => {
  const AudioContextClass = window.AudioContext
  if (!AudioContextClass) {
    return () => {}
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
    oscillator.frequency.value = 800 // 800Hz，比较悦耳的提示音
    oscillator.type = 'sine' // 正弦波，声音更柔和

    // 设置音量包络（淡入淡出，避免突然的声音）
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(0.5, currentTime + 0.01) // 快速淡入
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5) // 淡出

    // 播放声音
    oscillator.start(currentTime)
    oscillator.stop(currentTime + 0.3) // 播放 0.3 秒
  }

  // 播放 5 次，间隔 3s
  Array.from(new Array(5).fill(0), (_, o) => 3 * o).forEach((x) => {
    playBeep(x)
    playBeep(x + 0.15)
    playBeep(x + 0.3)

    playBeep(x + 0.6)
    playBeep(x + 0.75)
    playBeep(x + 0.9)
  })

  return () => {
    audioContext.close()
  }
}
