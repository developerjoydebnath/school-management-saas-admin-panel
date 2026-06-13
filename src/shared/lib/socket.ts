import { appConfig } from "@/shared/configs/app.config";
import { io } from "socket.io-client";

const socket = io(appConfig.API_WS_URL, {
  reconnection: true,
  timeout: 10000,
  transports: ["websocket"],
  autoConnect: false,
});

socket.connect();

export { socket };

