const express = require('express');
const Facebook = require('facebook-dl');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();
const api = new Facebook();

app.set('json spaces', 2);
app.use(express.static('public'));

app.get('/fbdown', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ err: 'Please provide a Facebook link' });
    }

    try {
        const videoInfo = await api.fbdl(url);
        res.json(videoInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video details.', details: error.message });
    }
});

app.get('/download', async (req, res) => {
    const { url, quality, filename } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'Please provide a video URL' });
    }
    
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        
        const videoFilename = filename || 'facebook_video';
        const uniqueId = Date.now();
        res.setHeader('Content-Disposition', `attachment; filename="${videoFilename}_${uniqueId}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        
        response.data.pipe(res);
    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: 'Failed to download video', details: error.message });
    }
});

// Export as a serverless function for Vercel
module.exports = serverless(app);
