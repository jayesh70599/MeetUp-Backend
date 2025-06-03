// controllers/meetingController.js
import { v4 as uuidv4 } from 'uuid';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js'; // We might need this later, good to import

// @route   POST api/meetings/create
// @desc    Create a new meeting
// @access  Private
export const createMeeting = async (req, res) => {
  try {
    // 1. Generate a unique meeting ID
    const meetingId = uuidv4();

    // 2. Get the creator's ID from the auth middleware (req.user.id)
    const createdBy = req.user.id;

    // 3. Create a new Meeting instance
    const newMeeting = new Meeting({
      meetingId,
      createdBy,
      participants: [createdBy], // The creator is the first participant
    });

    // 4. Save the meeting to the database
    const meeting = await newMeeting.save();

    console.log(`Meeting created: ${meetingId} by User: ${createdBy}`);

    // 5. Return the new meeting ID
    res.json({ meetingId: meeting.meetingId });

  } catch (err) {
    console.error('Error creating meeting:', err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/meetings/join/:meetingId  (Changed to GET for simplicity, could be POST)
// @desc    Validate/Join an existing meeting
// @access  Private
export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;

    // 1. Find the meeting by its ID
    const meeting = await Meeting.findOne({ meetingId });

    // 2. Check if the meeting exists
    if (!meeting) {
      console.log(`Join attempt failed: Meeting not found ${meetingId}`);
      return res.status(404).json({ msg: 'Meeting not found' });
    }

    // 3. (Optional) Add the user to participants if not already there
    //    We can handle actual 'joining' more via Sockets, but this can track history
    if (!meeting.participants.includes(userId)) {
      meeting.participants.push(userId);
      await meeting.save();
      console.log(`User ${userId} added to participants for meeting ${meetingId}`);
    } else {
       console.log(`User ${userId} re-joining/already in meeting ${meetingId}`);
    }


    // 4. Return success and the meeting details
    res.json({ meetingId: meeting.meetingId, participants: meeting.participants });

  } catch (err) {
    console.error('Error joining meeting:', err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/meetings/:meetingId
// @desc    Get meeting details (Maybe useful later)
// @access  Private
export const getMeetingDetails = async (req, res) => {
  try {
      const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
      if (!meeting) {
          return res.status(404).json({ msg: 'Meeting not found' });
      }
      res.json(meeting);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
};