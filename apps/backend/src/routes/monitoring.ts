import express from 'express'

const router = express.Router()

// Monitoring routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Monitoring route - coming soon' })
})

export default router

