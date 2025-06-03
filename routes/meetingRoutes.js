// routes/meetings.js
import express from 'express';
import { createMeeting, joinMeeting, getMeetingDetails } from '../controllers/meetingController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/meetings/create
// @desc    Create a new meeting
// @access  Private
router.post('/create', auth, createMeeting);

// @route   GET api/meetings/join/:meetingId
// @desc    Validate/Join an existing meeting
// @access  Private
router.get('/join/:meetingId', auth, joinMeeting); // Changed to GET

// @route   GET api/meetings/:meetingId
// @desc    Get meeting details
// @access  Private
router.get('/:meetingId', auth, getMeetingDetails); // Added this route


export default router;