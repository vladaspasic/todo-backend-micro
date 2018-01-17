const routes = require('./routes')
const logger = require('./logger')
const { send, createError } = require('micro')

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
}

const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req, res)
  } catch (error) {
    const json = {
      status: error.statusCode || 500,
      message: error.message || 'Internal server error, please try again'
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.warn('An error ocurred while handling route `%s`. %s', req.url, error.stack)
    }

    send(res, json.status, json)
  }
}

module.exports = handleErrors(async (req, res) => {
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
})

