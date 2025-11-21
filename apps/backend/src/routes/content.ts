import express from 'express'

const router = express.Router()

// Content routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Content route - coming soon' })
})

export default router

