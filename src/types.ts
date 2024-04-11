export type Player = {
  playerId: string;
  username: string;
  alive: string;
  isProtected: string;
  isKilled: string;
  ready: string;
  token: string;
  role: string;
  lobbyCode: string;
};

export type Lobby = {
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