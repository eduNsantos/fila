import { useEffect, useState } from 'react'
import '../assets/css/ClientWindow.css'
import { socketClient } from '../utils/socket-client'
import api from '../utils/api';

interface Call {
  password?: string,
  window?: string,
  generateAt: string,
  date: string
}

function ClientWindow() {
  const [call, setCall] = useState<Call|undefined>();
  const [queue, setQueue] = useState<Call[]>([]);
  const [history, setHistory] = useState<Call[]>([]);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [avgCallingTime, setAvgCallingTime] = useState<number>(0);

  useEffect(() => {
    if (history.length === 0) return;

    let totalDiff = 0;
    let validCalls = 0;

    history.forEach((call) => {
      const generateTime = new Date(call.generateAt).getTime();
      const callTime = new Date(call.date).getTime();

      if (!isNaN(generateTime) && !isNaN(callTime) && callTime > generateTime) {
        totalDiff += callTime - generateTime;
        validCalls++;
      }
    });

    if (validCalls > 0) {
      const averageTime = (totalDiff / validCalls) / 1000 / 60; // Convertendo para minutos
      setAvgCallingTime(averageTime);
    }

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


    setQueue((previous) => {
      const newQueue = [...previous];

      newQueue.shift();

      return newQueue;
    })


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

    socketClient.on('queue', (info) => {

      if (info.type === 'new') {
        setQueue((previous) => [...previous, info.queue]);
      }
    })

    return () => {
      socketClient.off('queue');
      socketClient.off('call');

    }
  }, []);
''

  useEffect(() => {
    async function fetchDataList() {

      const [responseQueue, responseHistory] = await Promise.all([
        api.get('/queue'),
        api.get('/queue/history')
      ])

      setCall(responseHistory.data[0]);

      responseHistory.data.shift();

      setHistory(responseHistory.data);
      setQueue(responseQueue.data);

      return;
    }

    fetchDataList();

    return () => {
      setHistory([]);
      setQueue([]);
      setCall(undefined);
    }

  }, []);


  // if (history.length == 0) return;

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
            <h5>INFORMAÇÕES IMPORTANTES</h5>

            <div className="d-flex justify-content-between col-10 mx-auto">
              <span className='border-end px-3'>
                <b className={`additional-info-description`}><b>TEMPO MÉDIO CHAMADA</b><br/>{(avgCallingTime).toFixed(2)}min</b>
              </span>

              <span className='border-end px-3'>
                <b className={`additional-info-description`}><b>ÚLTIMA CHAMADA</b><br/>{history?.[0]?.date ? new Date(history?.[0]?.date)?.toLocaleTimeString('pt-BR') : '-'}</b>
              </span>

              <span>
                <b className={`additional-info-description`}><b>SENHAS PENDENTES</b><br/>{queue.length}</b>
              </span>
            </div>

          </div>

        </div>

        <div className="history-wrapper">
          <h4>Histórico</h4>
          <ul className="history-list list-group list-group-flush bg-transparent">
            {history.map(item => {
              return <li key={item.password} className="list-group-item bg-transparent text-white py-5">Senha: {item.password} - Guichê {item.window}<br/>{item?.date ? new Date(item?.date)?.toLocaleTimeString('pt-BR') : '-'}</li>
            })}

          </ul>
        </div>

      </div>
    </>
  )
}

export default ClientWindow
