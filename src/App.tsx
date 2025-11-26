import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
  <h1 className="text-4xl font-bold text-blue-600">Hello Tailwind + React!</h1>
  <button className="btn btn-error mt-5">Czerwony Button</button>
</div>
 <div className="flex flex-wrap gap-4 justify-center">
          <button className="btn btn-primary btn-lg">Niebieski</button>
          <button className="btn btn-secondary btn-lg">Fioletowy</button>
          <button className="btn btn-accent btn-lg">Różowy</button>
          <button className="btn btn-success btn-lg">Zielony</button>
          <button className="btn btn-warning btn-lg">Żółty</button>
          <button className="btn btn-error btn-lg">Czerwony</button>
          <button className="btn btn-info btn-lg">Błękitny</button>
          <button className="btn btn-ghost">Duch</button>
          <button className="btn btn-outline">Kontur</button>
        </div>
  <div className="text-[50px]"> Hello Word</div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
