interface ServerToExtensionEvent {
  error: (error: Error) => void;
  message: (message: string) => void;
  login_succeeded: () => void;
}
interface OAuth2Options {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface LoginEvents {
  login: (data: {
    username: string;
    password: string;
    host?: string;
    isGoogle?: boolean;
  }) => void;
  onSetWhiteList: (email: string) => void;
  onDeleteWhiteList: (emails: string[]) => void;
  logout: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

export {
  ServerToExtensionEvent,
  LoginEvents,
  InterServerEvents,
  SocketData,
  OAuth2Options,
};
