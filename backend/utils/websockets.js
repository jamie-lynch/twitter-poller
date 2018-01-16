var WebSocket = require('ws')

var wss

exports.createWebSocketServer = function(server) {
  wss = new WebSocket.Server({ server })

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }
}

exports.broadcastChange = (type, data) => {
  wss.broadcast(JSON.stringify({ type, data }))
}
