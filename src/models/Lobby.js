class Lobby {
  constructor(data = {}) {
    this.lobbyId = null;
    this.hostName = null;
    this.lobbyCode = null;
    this.players = null;
    this.numberOfPlayers = null;
    this.gameSettings = null; 
    this.gameState = null; // maybe
    Object.assign(this, data);
  }
}
  
export default Lobby;
  