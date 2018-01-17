const url = require('url')
const Path = require('path-parser');

function sendFavicon(params, req, res) {
  res.writeHead(200)
  res.end()
}

class Router {
  constructor() {
    this.routes = []
  }

  add(method = 'get', path = '/', handler) {
    this.routes.push({
      handler,
      path: new Path(path),
      method: method.toLowerCase()
    })
  }

  get(req = {}) {
    const parsed = url.parse(req.url, true)

    if (typeof req.method !== 'string' || typeof parsed.pathname !== 'string') {
      return {}
    }

    if (parsed.pathname.indexOf('favicon') > -1) {
      return { handler: sendFavicon }
    }

    for (var i = this.routes.length - 1; i >= 0; i--) {
      const route = this.routes[i]

      if (route.method !== req.method.toLowerCase()) {
        continue
      }

      const params = route.path.test(parsed.pathname);

      if (params) {
        return {
          handler: route.handler,
          params: Object.assign({}, params, parsed.query)
        }
      }

    }

    return {}
  }
}

module.exports = Router
