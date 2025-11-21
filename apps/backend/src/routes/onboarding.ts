import express from 'express'

const router = express.Router()

// Onboarding routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Onboarding route - coming soon' })
})

export default router

