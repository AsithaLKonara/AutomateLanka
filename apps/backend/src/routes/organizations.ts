import express from 'express'

const router = express.Router()

// Organization routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Organizations route - coming soon' })
})

export default router

