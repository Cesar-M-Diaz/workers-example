const fastify = require('fastify')({ logger: true })
const { Worker } = require('worker_threads')

const THREAD_COUNT = 3
function createWorker () {
  return new Promise(function (resolve, reject) {
    const worker = new Worker('./worker.js', {
      workerData: { thread_count: THREAD_COUNT }
    })
    worker.on('message', (data) => {
      resolve(data)
    })
    worker.on('error', (msg) => {
      reject(new Error(`An error ocurred: ${msg}`))
    })
  })
}

fastify.get('/', async (req, res) => {
  const workerPromises = []
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker())
  }
  const threadResults = await Promise.all(workerPromises)
  const total = threadResults[0] + threadResults[1] + threadResults[2]
  res.status(200).send(`result is ${total}`)
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()