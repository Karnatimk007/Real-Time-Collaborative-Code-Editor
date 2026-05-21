import { io } from "socket.io-client";

const URL = "https://real-time-code-editor-as44.onrender.com";

export const socket = io(URL, {
  autoConnect: false,
});