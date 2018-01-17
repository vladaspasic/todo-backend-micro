const routes = require('./routes')
const { send, createError } = require('micro')

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
}

module.exports = async (req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') {
    return send(res, 200)
  }
  
  const { params, handler } = routes.get(req)

  if (typeof handler === 'function') {
    const result = await handler(params, req, res)
    send(res, result.status || 200, result.data || {})
  } else {
    throw createError(404, `Resource for path ${req.url} could not be found`)
  }
}

