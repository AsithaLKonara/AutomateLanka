import express from 'express'

const router = express.Router()

// Social Media routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Social Media route - coming soon' })
})

export default router

