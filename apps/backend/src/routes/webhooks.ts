import express from 'express'

const router = express.Router()

// Webhooks routes - TODO: Implement
router.post('/', async (req, res) => {
  res.json({ message: 'Webhooks route - coming soon' })
})

export default router

