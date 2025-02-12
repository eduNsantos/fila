import { useEffect, useState } from 'react';
import '../assets/css/UserWindow.css';
import api from '../utils/api';
import { socketClient } from '../utils/socket-client';

interface Call {
    password?: string,
    window: string,
    generateAt: string,
    date: string
}

function UserWindow() {
    const [queue, setQueue] = useState<Call[]>([]);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        async function fetchQueue() {
            const response = await api.get('/queue');

            setQueue(response.data);
        }

        socketClient.on('call', (call: Call) => {
            setQueue(previous => {
                const newQueue = [...previous];

                newQueue.shift();

                return newQueue;
            })
        })

        fetchQueue()

        return () => {
            socketClient.off('call')
        }
    }, []);

    async function callNewPassword() {
        setDisabled(true);

        try {
            await api.get('/queue/call-next');
        } finally {
            setDisabled(false);
        }

    }

    return (
        <>
            <div className="h-100 flex-column d-flex align-items-center justify-content-center col-6 mx-auto">

                <h1 className="text-xl font-bold text-center mb-4">Chamar próxima senhas</h1>

                <button disabled={disabled} onClick={() => callNewPassword()} className="btn btn-primary">Chamar próxima senha</button>

                Próximas senhas
                <ul className="list-group mt-3 w-100">
                    {queue.length === 0 ? (
                        <li className="list-group-item text-muted">Nenhuma senha na fila</li>
                    ) : (
                        queue.map((row, index) => (
                        <li
                            key={`${row.generateAt}-${row.password}`}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                            index === 0
                                ? 'list-group-item-primary fw-bold'
                                : 'text-muted'
                            }`}
                        >
                            <div>
                            <span className="h3 mb-0 me-3">{row.password}</span>
                            <small className="text-secondary">
                                {new Date(row.generateAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                                })}
                            </small>
                            </div>

                            {index === 0 && (
                            <span className="badge bg-primary rounded-pill">
                                Próxima senha
                            </span>
                            )}
                        </li>
                        ))
                    )}
                </ul>
            </div>
        </>
    )
};


export default UserWindow