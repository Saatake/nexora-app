"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5071";

export default function ConfirmarEmailPage() {
  const [status, setStatus] = useState("Confirmando seu e-mail...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const email = params.get("email");
    const token = params.get("token");

    if (!email || !token) {
      setStatus("Link inválido.");
      return;
    }

    const confirmar = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/confirm-email?email=${encodeURIComponent(
            email
          )}&token=${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setStatus(data.message || "Erro ao confirmar e-mail.");
          return;
        }

        setStatus("E-mail confirmado com sucesso! Agora você pode fazer login.");
      } catch (err) {
        setStatus("Erro de conexão com o servidor.");
      }
    };

    confirmar();
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#60B5FF]">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Confirmação de E-mail</h1>
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
}