/**
 * Lobby model
 */
 class Lobby {
    constructor(data = {}) {
      this.id = null;
      this.token = null;
      this.status = null;
      Object.assign(this, data);
    }
  }
  
  export default Lobby;
  