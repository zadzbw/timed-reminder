import jsESLint from '@eslint/js'
import globals from 'globals'
import eslintReact from '@eslint-react/eslint-plugin'
import eslintReactHooks from 'eslint-plugin-react-hooks'
import eslintReactRefresh from 'eslint-plugin-react-refresh'
import tsESLint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tsESLint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      jsESLint.configs.recommended,
      tsESLint.configs.recommended,
      eslintReact.configs['recommended-typescript'],
      eslintReactHooks.configs['recommended-latest'],
      eslintReactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      eqeqeq: 2,
      semi: [2, 'never'],
      quotes: [2, 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'jotai/utils',
              importNames: ['atomWithStorage', 'atomWithStorageSync'],
              message: 'Please use atomWithStorage & atomWithStorageSync from `@/utils/jotai`',
            },
          ],
        },
      ],
    },
  },
])
