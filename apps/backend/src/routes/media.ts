import express from 'express'

const router = express.Router()

// Media routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Media route - coming soon' })
})

export default router

