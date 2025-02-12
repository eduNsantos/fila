import { useEffect, useState } from "react";
import { socketClient } from "../utils/socket-client";
import api from "../utils/api";
import Swal from "sweetalert2";

export default function GetPassword() {
  const [disabled, setDisabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);

  useEffect(() => {
    socketClient.on('queue', info => {
      if (info.type === 'new') {
        setCurrentPassword(info.queue.password);
        Swal.fire({
          heightAuto: false,
          title: 'Senha Gerada!',
          html: `Sua senha é <strong><span style="font-size: 1.5rem;">${info.queue.password}</span></strong>`,
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Adicione classes CSS personalizadas
            title: 'swal-title',
            htmlContainer: 'swal-html',

          }
        });
      }
    });

    return () => {
      socketClient.off('queue');
    };
  }, []);

  async function generatePassword(type: string) {
    setDisabled(true);
    await api.post('/queue/generate-password', { type });
    setDisabled(false);
  }

  return (
    <>
      <div className="d-flex flex-column justify-content-center aling-items-center min-h-screen bg-gray-100 p-4 mx-auto col-8 my-auto h-100">
        <h1 className="text-xl font-bold text-center mb-4">Gerador de Senhas</h1>
        <div className="flex gap-4 mb-4">
          <button
            className={`btn w-100 btn-primary px-4 py-2 rounded ${disabled ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
            disabled={disabled}
            onClick={() => generatePassword('normal')}
          >
            Normal
          </button>
          <br/>
          <button
            className={`btn mt-4 w-100 btn-primary px-4 py-2 rounded ${disabled ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-700 text-white'}`}
            disabled={disabled}
            onClick={() => generatePassword('preferential')}
          >
            Preferencial
          </button>
        </div>
        {currentPassword && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <p className="text-center text-gray-800">Senha Atual: <strong>{currentPassword}</strong></p>
          </div>
        )}
      </div>
    </>
  );
}