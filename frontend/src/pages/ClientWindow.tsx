import { useEffect, useState } from 'react'
import '../assets/css/ClientWindow.css'
import { socketClient } from '../utils/socket-client'

interface Call {
  password?: string,
  window?: string,
  time?: Date
}

function ClientWindow() {
  const [call, setCall] = useState<Call|undefined>();
  const [history, setHistory] = useState<Call[]>([]);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [avgCallingTime, setAvgCallingTime] = useState<number>(0);

  useEffect(() => {
    if (!history || history.length == 0) {
      return;
    }



    // new Date()
    // setAvgCallingTime()
  }, [history]);

  useEffect(() => {
    if (!call) {
      return;
    }

    const callWithTime = { ...call  };

    setHistory(prev => {
      const newHistory = [callWithTime, ...prev];

      return newHistory;
    });

    if (history.length > 0) {
      const totalTime = history.reduce((sum, currentCall) => {
        if (currentCall.time && callWithTime.time) {
          return sum + (callWithTime.time.valueOf() - currentCall.time.valueOf());
        }
        return sum;
      }, 0);

      const averageTime = totalTime / history.length;
      setAvgCallingTime(averageTime);
    }

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

          <div className="additional-info">
            <h5>Informações Importantes</h5>

            <div className="d-flex justify-content-between col-9 mx-auto">
              <span>
                <b className={`additional-info-description`}>Tempo médio atendimento: {(avgCallingTime / 1000 / 60).toFixed(2)}min</b>
              </span>

              <span>
                <b className={`additional-info-description`}>Último atendimento: {history?.[0]?.time?.toLocaleTimeString('pt-BR') ?? '-'}</b>
              </span>
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

export default ClientWindow
