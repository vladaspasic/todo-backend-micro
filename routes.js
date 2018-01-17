const { Pool } = require('pg')
const Router = require('./router')
const logger = require('./logger')
const { json, createError } = require('micro')

logger.info('Connecting to Postgres Database...')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function query(query, args = []) {
  logger.debug('Executing DB query `%s` with arguments %s', query, args)

  try {
    const result = await pool.query(query, args)
    return result.rows
  } catch (e) {
    logger.error('An error ocurred while executing Database query: %s', e.stack, {
      query, args
    })

    throw createError(500, `An unexpected error ocurred, please try again`)
  }
}

async function findTodo(id) {
  const todos = await query(`SELECT * FROM todos WHERE id=$1 ORDER BY "order" ASC`, [ id ])
  
  if (todos.length === 1) {
    return todos[0]
  }

  throw createError(404, `Todo with identifier '${id}'' does not exist.`)
}

const router = new Router()

router.add('get', '/', async () => {
  const data = await query(`SELECT * FROM todos`)
  return { data }
})


router.add('get', '/:id', async (params) => {
  const data = await findTodo(params.id)
  return { data }
})

router.add('post', '/', async (params, req) => {
  const todo = await json(req)
  const data = await query(`INSERT INTO todos
    ("title", "order", "completed") VALUES ($1, $2, false)
    RETURNING *`, [todo.title, todo.order])

  return { status: 201, data }
})

router.add('patch', '/:id', async (params, req) => {
  let data = await json(req)
  const todo = await findTodo(params.id)

  if ('title' in data) {
    todo.title = data.title
  }

  if ('order' in data) {
    todo.order = data.order
  }

  if ('completed' in data) {
    todo.completed = data.completed
  }

  data = await query(`UPDATE todos set "title"=$1, "order"=$2, "completed"=$3 WHERE id=$4 RETURNING *`,
    [todo.title, todo.order, todo.completed || false, params.id])

  return {
    data
  }
})

router.add('delete', '/', async () => {
  const data = await query(`DELETE FROM todos`)
  return { status: 204 }
})

router.add('delete', '/:id', async (params) => {
  const data = await query(`DELETE FROM todos WHERE id=$1`, [params.id])
  return { status: 204 }
})

module.exports = router
