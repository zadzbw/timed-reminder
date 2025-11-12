import { createRoot } from 'react-dom/client'
import { Provider } from 'jotai'
import { App } from '@/App'
import { store } from '@/store.ts'
import '@/style/index.css'

const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
)
