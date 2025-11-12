import { mergeConfig, UserConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineVitestConfig(() => {
  const config = mergeConfig(
    viteConfig,
    defineVitestConfig({
      test: {
        setupFiles: './src/test/setup.ts',
        reporters: 'verbose',
        // globals: true,
        css: true,
        browser: {
          enabled: true,
          // headless: true,
          provider: 'playwright',
          instances: [{ browser: 'chromium' }],
          screenshotFailures: false,
        },
      },
    }),
  )
  return config as UserConfig
})
