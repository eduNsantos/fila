import { useEffect, useState } from 'react'
import './App.css'
import { socketClient } from './utils/socket-client'

interface Call {
  password?: string,
  window?: string,
  time?: Date
}

function App() {
  const [call, setCall] = useState<Call|undefined>();
  const [history, setHistory] = useState<Call[]>([]);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!call) {
      return;
    }

    setHistory(prev => {
      const newHistory = [...prev];

      newHistory.unshift({
        ...call,
        time: new Date()
      });

      return newHistory
    });

    setIsEnlarged(true);
    setIsBlinking(true);
    setTimeout(() => {
      setIsEnlarged(false);

      setIsBlinking(false);
    }, 5000)
  }, [call])

  useEffect(() => {
    socketClient.on('call', (call: Call) => {
      setCall(call);
    })
  }, []);


  return (
    <>
      <div className="main-wrapper">
        <div className="calls-wrapper">
          <h4>ÚLTIMA SENHA</h4>

          <div className={`current-call`}>
            <div className="p-5">
              <span className="call-title">SENHA</span><br/>
              <b className={`call-description  ${isEnlarged ? 'enlarged' : ''} ${isBlinking ? 'blinking' : ''}`}>{call?.password ?? '-'}</b>
            </div>

            <div className="mt-4 p-5">
              <span className="call-title">GUICHÊ</span><br/>
              <b className={`call-description  ${isEnlarged ? 'enlarged' : ''} ${isBlinking ? 'blinking' : ''}`}>{call?.window ?? '-'}</b>
            </div>
          </div>

        </div>

        <div className="history-wrapper">
          <h4>Histórico</h4>
          <ul className="list-group list-group-flush bg-transparent">
            {history.map(item => {
              return <li className="list-group-item bg-transparent text-white py-5">Senha: {item.password} - Guichê {item.window}<br/>{item.time?.toLocaleTimeString('pt-BR')}</li>
            })}

          </ul>
        </div>

      </div>
    </>
  )
}

export default App
