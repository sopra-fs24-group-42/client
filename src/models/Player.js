class Player {
    constructor(data = {}) {
      this.playerId = null;
      this.username = null;
      this.alive = null;
      this.isProtected = null;
      this.killed = null;
      this.ready = null;
      this.token = null;
      this.role = null;
      Object.assign(this, data);
    }
  }
  
  export default Player;
  