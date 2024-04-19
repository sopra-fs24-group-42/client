import React, { useState } from 'react';

const Base64ToMp3Decoder = () => {
    const [base64, setBase64] = useState('');
    const [audioUrl, setAudioUrl] = useState(null); // Initialize to null for clarity

    const DecodeAndPlay = () => {
        // Assuming the base64 string is in the proper format with the data URL prefix
        const base64Content = base64.split(',')[1]; // This will ignore the data URL prefix if present
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });

        // Create a URL for the Blob and set it for audio playback
        const newAudioUrl = URL.createObjectURL(blob);
        setAudioUrl(newAudioUrl);
    };

    return (
        <div>
            <textarea
                value={base64}
                onChange={(e) => setBase64(e.target.value)}
                placeholder="Paste your base64 encoded MP3 here..."
                rows="4"
                style={{ width: '100%' }}
            ></textarea>
            <button onClick={DecodeAndPlay}>Decode and Play</button>
            {audioUrl && <audio controls src={audioUrl} autoPlay />}
        </div>
    );
};

export default Base64ToMp3Decoder;