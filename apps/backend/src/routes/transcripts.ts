import express from 'express'

const router = express.Router()

// Transcripts routes - TODO: Implement
router.get('/', async (req, res) => {
  res.json({ message: 'Transcripts route - coming soon' })
})

export default router

