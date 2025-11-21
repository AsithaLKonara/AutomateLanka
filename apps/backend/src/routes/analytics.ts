import express from 'express'

const router = express.Router()

// Analytics routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Analytics route - coming soon' })
})

export default router

