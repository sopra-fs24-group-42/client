class Player {
  constructor(data = {}) {
    this.playerId = null;
    this.username = null;
    this.alive = null;
    this.isProtected = null;
    this.isKilled = null;
    this.ready = null;
    this.token = null;
    this.role = null;
    this.lobbyCode = null;
    this.lobbyId = null;
    Object.assign(this, data);
  }
}
  
export default Player;
  
