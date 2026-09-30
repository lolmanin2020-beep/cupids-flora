(function () {
  let peer = null;
  let conn = null;

  const PEER_OPTIONS = {
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.relay.metered.ca:80' }
      ]
    }
  };

  function attachConnHandlers(c, cb) {
    conn = c;
    conn.on('open', () => cb.onConnected && cb.onConnected());
    conn.on('data', (data) => cb.onData && cb.onData(data));
    conn.on('close', () => cb.onDisconnected && cb.onDisconnected());
    conn.on('error', (err) => cb.onError && cb.onError(err));
  }

  window.PeerLink = {
    createGame(cb) {
      peer = new Peer(PEER_OPTIONS);
      peer.on('open', (id) => cb.onOpenId && cb.onOpenId(id));
      peer.on('connection', (c) => attachConnHandlers(c, cb));
      peer.on('error', (err) => cb.onError && cb.onError(err));
    },
    joinGame(hostId, cb) {
      peer = new Peer(PEER_OPTIONS);
      peer.on('open', () => {
        const c = peer.connect(hostId, { reliable: true });
        attachConnHandlers(c, cb);
      });
      peer.on('error', (err) => cb.onError && cb.onError(err));
    },
    send(data) {
      if (conn && conn.open) conn.send(data);
    }
  };
})();
