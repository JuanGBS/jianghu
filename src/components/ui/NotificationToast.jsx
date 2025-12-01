import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

function NotificationToast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Ref para guardar a função de fechar mais recente sem reiniciar o efeito
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // 1. Inicia animação de entrada
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // 2. Agenda a saída (3 segundos)
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      
      // 3. Aguarda animação de saída terminar (300ms) e chama onClose
      setTimeout(() => {
        if (onCloseRef.current) onCloseRef.current();
      }, 300);
    }, 3000); 

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
    // IMPORTANTE: Removemos 'onClose' da lista de dependências.
    // O timer só reinicia se a MENSAGEM ou o TIPO mudarem.
  }, [message, type]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center p-4 rounded-lg shadow-xl text-white transition-all duration-300 pointer-events-none ${bgColor} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
      }`}
    >
      <Icon className="h-6 w-6 mr-3" />
      <span className="font-semibold">{message}</span>
    </div>
  );
}

export default NotificationToast;