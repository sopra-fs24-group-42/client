export type User = {
  playerId: string;
  username: string;
  isAlive: string;
  isProtected: string;
  isKilled: string;
  ready: string;
  token: string;
  roleName: string;
  lobbyCode: string;
};

export type GameRoom = {
  lobbyId: string;
  hostName: string;
  lobbyCode: string;
  players: string;
  numberOfPlayers: string;
  gameSettings: string;
  gameState: string;
};

export type Role = {
  roleName: string;
};