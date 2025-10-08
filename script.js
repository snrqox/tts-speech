const synth = window.speechSynthesis;
const textInput = document.getElementById('text-input');
const voiceSelect = document.getElementById('voice-select');
const rateSlider = document.getElementById('rate-slider');
const pitchSlider = document.getElementById('pitch-slider');
const rateValueSpan = document.getElementById('rate-value');
const pitchValueSpan = document.getElementById('pitch-value');
const speakButton = document.getElementById('speak-button');
const stopButton = document.getElementById('stop-button');

let voices = [];
let defaultRate = 1.0;
let defaultPitch = 1.0;

// --- 1. Voice Loading and Population ---

function populateVoiceList() {
    // Get all available voices from the user's system
    voices = synth.getVoices();
    voiceSelect.innerHTML = ''; // Clear existing options
    
    let defaultVoiceFound = false;

    for (let i = 0; i < voices.length; i++) {
        const voice = voices[i];
        const option = document.createElement('option');
        
        // Display name and language code (e.g., "Google Hindi (hi-IN)")
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        
        // Prioritize a voice that supports Indian languages (en-IN or hi-IN)
        if (voice.lang.toLowerCase().includes('in') && !defaultVoiceFound) {
            option.selected = true;
            defaultVoiceFound = true;
        } 
        // Fallback: If no Indian voice is found, select a default English one
        else if (voice.default && !defaultVoiceFound) {
            option.selected = true;
            defaultVoiceFound = true;
        }

        voiceSelect.appendChild(option);
    }
    
    // If the list is empty, let the user know
    if (voices.length === 0) {
         voiceSelect.innerHTML = '<option value="">No voices available on this browser/system.</option>';
         speakButton.disabled = true;
    } else {
         speakButton.disabled = false;
    }
}

// Voices must be loaded after the document is ready, and sometimes after an event
// The 'onvoiceschanged' event is the most reliable trigger.
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceList;
} else {
    // Fallback for browsers that don't fire the event
    populateVoiceList();
}


// --- 2. Speech Synthesis Logic ---

function speak() {
    // Stop any speech currently in progress
    if (synth.speaking) {
        stopSpeaking();
    }
    
    // Check for text input
    if (textInput.value.trim() === '') {
        alert("Please paste the text you want to convert.");
        return;
    }

    // Create the utterance object
    const utterThis = new SpeechSynthesisUtterance(textInput.value);
    
    // Find and set the selected voice object
    const selectedVoiceName = voiceSelect.value;
    const selectedVoice = voices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) {
         utterThis.voice = selectedVoice;
    }

    // Set rate (speed) and pitch from sliders
    utterThis.rate = parseFloat(rateSlider.value) || defaultRate;
    utterThis.pitch = parseFloat(pitchSlider.value) || defaultPitch;
    
    // Set up event listeners for state management
    utterThis.onstart = () => {
         speakButton.textContent = 'Speaking...';
         speakButton.disabled = true;
         stopButton.disabled = false;
    };
    
    utterThis.onend = () => {
         speakButton.textContent = 'Convert & Speak';
         speakButton.disabled = false;
         stopButton.disabled = true;
    };
    
    utterThis.onerror = (event) => {
         console.error('SpeechSynthesis Error:', event.error);
         speakButton.textContent = 'Convert & Speak (Error)';
         speakButton.disabled = false;
         stopButton.disabled = true;
         alert(`An error occurred: ${event.error}`);
    };

    // Start speaking!
    synth.speak(utterThis);
}

function stopSpeaking() {
    if (synth.speaking) {
        synth.cancel();
    }
    speakButton.textContent = 'Convert & Speak';
    speakButton.disabled = false;
    stopButton.disabled = true;
}


// --- 3. Event Listeners ---

speakButton.addEventListener('click', speak);
stopButton.addEventListener('click', stopSpeaking);

// Update slider value displays and ensure buttons are enabled on interaction
rateSlider.addEventListener('input', () => {
    rateValueSpan.textContent = rateSlider.value;
});

pitchSlider.addEventListener('input', () => {
    pitchValueSpan.textContent = pitchSlider.value;
});

// Initial display of slider values
rateValueSpan.textContent = rateSlider.value;
pitchValueSpan.textContent = pitchSlider.value;
