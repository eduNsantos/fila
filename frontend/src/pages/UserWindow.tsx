import { useEffect, useState } from 'react';
import '../assets/css/UserWindow.css';
import api from '../utils/api';
import { socketClient } from '../utils/socket-client';
import Swal from 'sweetalert2';

interface Call {
    password?: string;
    window: string;
    generateAt: string;
    date: string;
}

function UserWindow() {
    const [queue, setQueue] = useState<Call[]>([]);
    const [window, setWindow] = useState<string | undefined>(undefined);
    const [windowInput, setWindowInput] = useState('');
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        async function fetchQueue() {
            const response = await api.get('/queue');
            setQueue(response.data);
        }

        socketClient.on('call', () => {
            setQueue((previous) => {
                const newQueue = [...previous];
                newQueue.shift();
                return newQueue;
            });
        });

        socketClient.on('queue', json => {
            setQueue(previous => [...previous, json.queue])
        })

        socketClient.on('window', (info) => {
            setWindow(info.window);
        });

        socketClient.on('windowJoinError', error => {
            if (error == 'WINDOW_ALREADY_TAKEN') {
                Swal.fire({
                    title: 'Atenção!',
                    icon: 'warning',
                    text: 'Guichê já está em uso'
                });

                setWindowInput('');
            }
        })

        fetchQueue();

        return () => {
            socketClient.off('call');
            socketClient.off('queue');
            socketClient.off('window');
            socketClient.off('windowJoinError');

        };
    }, []);

    useEffect(() => {
        socketClient.emit('joinWindows', windowInput);
    }, [windowInput]);

    async function callNewPassword() {
        if (!window || window == '') {
            Swal.fire({
                title: 'Atenção',
                text: 'Acho que você esqueceu de definir o Guichê',
                icon: 'warning'
            })
            return;
        }

        setDisabled(true);
        try {
            await api.post('/queue/call-next', {
                window
            });
        } finally {
            setDisabled(false);
        }
    }

    function handleWindowChange(e: React.ChangeEvent<HTMLInputElement>) {
        setWindowInput(e.target.value);
    }

    return (
        <div className="container">
            <div className="user-window">
                <h1 className="title">📢 Chamar Próxima Senha</h1>

                <button disabled={disabled} onClick={callNewPassword} className="btn btn-primary btn-lg">
                    🔔 Chamar Próxima Senha
                </button>

                <div className="window-section">
                    <p className="current-window">
                        <strong>Guichê Atual:</strong> {window ?? '-'}
                    </p>
                    <input
                        className="form-control window-input"
                        placeholder="Digite o número do guichê"
                        onChange={handleWindowChange}
                        value={windowInput}
                    />
                </div>

                <h3 className="queue-title">📋 Próximas Senhas</h3>
                <ul className="list-group queue-list">
                    {queue.length === 0 ? (
                        <li className="list-group-item empty-queue">🚫 Nenhuma senha na fila</li>
                    ) : (
                        queue.map((row, index) => (
                            <li
                                key={`${row.generateAt}-${row.password}`}
                                className={`list-group-item queue-item ${index === 0 ? 'next-password' : ''}`}
                            >
                                <div>
                                    <span className="password-number">{row.password}</span>
                                    <small className="time">{new Date(row.generateAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                                </div>

                                {index === 0 && <span className="badge bg-success">🔜 Próxima Senha</span>}
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

export default UserWindow;
