const express = require('express');
const businessManager = require('../utils/businessManager.js');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

// Get all schedules
router.get('/', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const schedules = await businessManager.getSchedules();
        return res.status(200).json({ success: true, schedules });
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

// Add new schedule
router.post('/', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { name, number, date, campaign } = req.body;
    if (!number || !name || !date || !campaign) {
        return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    try {
        // Ensure that date is in Date format
        const parsedDate = new Date(date);  // Convert to Date if it's a string

        if (isNaN(parsedDate)) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        const success = await businessManager.addSchedule(name, number, parsedDate, campaign);
        if (success) {
            return res.status(201).json({ success: true, message: 'Schedule added successfully', schedule: { name, number, date: parsedDate, campaign } });
        } else {
            return res.status(400).json({ success: false, message: 'Failed to add schedule' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

// Delete schedule
router.delete('/:id', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const success = await businessManager.deleteSchedule(req.params.id);
        if (success) {
            return res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Schedule not found or deletion failed' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: `Internal server error: ${err.message}` });
    }
});

router.post('/next-available-time', async (req, res) => {
    const { valid, decoded } = verifyToken(req.cookies.token);
    
    if (!valid) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { requestedTime } = req.body;

    if (!requestedTime) {
        return res.status(400).json({ success: false, message: 'Requested time is required' });
    }

    try {
        // Convert `requestedTime` to Date object
        const parsedTime = new Date(requestedTime);
        if (isNaN(parsedTime)) {
            return res.status(400).json({ success: false, message: 'Invalid time format' });
        }

        // Use business logic to find the next available time
        const nextAvailableTime = await businessManager.getNextAvailableTime(parsedTime);

        if (nextAvailableTime) {
            return res.status(200).json({
                success: true,
                message: 'Next available time found',
                nextAvailableTime,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'No available time slots found',
            });
        }
    } catch (error) {
        // Handle server errors
        console.error('Error finding next available time:', error);
        return res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
});

module.exports = router;


