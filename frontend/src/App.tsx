import { useEffect, useState } from 'react'
import './App.css'
import { socketClient } from './utils/socket-client'

interface Call {
  password?: string,
  window?: string
}
function App() {
  const [call, setCall] = useState<Call|undefined>();


  useEffect(() => {
    socketClient.on('call', (call: Call) => {
      setCall(call);
    })
  }, []);


  return (
    <>
      <div className="main-wrapper">
        <div className="history-wrapper">
          <h4>CHAMADA ATUAL</h4>

          <div className="current-call ">
            <div className="p-5">
              <h5>SENHA</h5><br/>
              <b>{call?.password ?? '-'}</b>
            </div>

            <div className="mt-4 p-5">
              <h5>GUICHÊ</h5><br/>
              <b>{call?.window ?? '-'}</b>
            </div>
          </div>

        </div>

        <div className="calls-wrapper">
          <h4>Últimos chamados</h4>
        </div>

      </div>
    </>
  )
}

export default App
