import express from 'express'

const router = express.Router()

// Marketplace routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Marketplace route - coming soon' })
})

export default router

