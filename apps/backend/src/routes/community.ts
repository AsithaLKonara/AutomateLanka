import express from 'express'

const router = express.Router()

// Community routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Community route - coming soon' })
})

export default router

