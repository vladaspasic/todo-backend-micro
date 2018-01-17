const { createLogger, format, transports } = require('winston')

module.exports = createLogger({
  level: process.env.LOGGER_LEVEL || 'info',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console()
  ]
})
