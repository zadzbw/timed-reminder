export default {
  '**/*.{js,jsx,ts,tsx}': [
    // do not pass args to the script
    () => 'npm run type:check',
    'npm run test:staged',
    'npm run lint:staged',
    // TODO: prettier-eslint-cli v8 还不支持 eslint v9
    // 'npm run format:staged',
  ],
  'src/**/*.{css,scss,json,yml,yaml}': ['prettier --write'],
}
