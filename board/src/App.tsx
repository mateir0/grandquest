import {SanityApp, type SanityConfig} from '@sanity/sdk-react'
import {Board} from './Board'
import './steampunk.css'

const config: SanityConfig[] = [
  {
    projectId: 'aitdwcxh',
    dataset: 'production',
  },
]

export default function App() {
  return (
    <div className="app-canvas">
      <SanityApp config={config} fallback={<p className="loading">Lighting the gas-lamps…</p>}>
        <Board />
      </SanityApp>
    </div>
  )
}
