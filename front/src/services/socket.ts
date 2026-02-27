import io from "socket.io-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SOCKET_URL = `${apiUrl}`; // Ajusta esto a la URL de tu backend

export const socket = io(SOCKET_URL);

export const initSocket = () => {
  socket.on("connect", () => {
    console.log("Conectado al servidor de WebSocket");
  });

  socket.on("disconnect", () => {
    console.log("Desconectado del servidor de WebSocket");
  });
};
