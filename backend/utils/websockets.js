var WebSocket = require('ws')

var wss

exports.createWebSocketServer = function(server) {
  wss = new WebSocket.Server({ server })

  wss.on('connection', ws => {
    ws.on('error', () => {
      console.error('ws error')
    })
  })

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
