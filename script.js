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

// --- 1. Load Voices ---
function populateVoiceList() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = ''; // Clear previous options
    
    // Create an option for each available voice
    for (let i = 0; i < voices.length; i++) {
        const option = document.createElement('option');
        option.textContent = `${voices[i].name} (${voices[i].lang})`;
        option.setAttribute('data-name', voices[i].name);
        option.setAttribute('data-lang', voices[i].lang);
        option.value = voices[i].name;
        voiceSelect.appendChild(option);
    }
}

populateVoiceList();
// Some browsers require waiting for the voices to be loaded
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = populateVoiceList;
}

// --- 2. Conversion and Speaking Logic ---
function speak() {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }

    if (textInput.value.trim() !== '') {
        const utterThis = new SpeechSynthesisUtterance(textInput.value);

        // Find the selected voice object
        const selectedVoiceName = voiceSelect.value;
        const selectedVoice = voices.find(v => v.name === selectedVoiceName);
        if (selectedVoice) {
             utterThis.voice = selectedVoice;
        }

        // Set rate (speed) and pitch
        utterThis.rate = rateSlider.value;
        utterThis.pitch = pitchSlider.value;

        // Start speaking
        synth.speak(utterThis);

        // Update button states
        speakButton.disabled = true;
        stopButton.disabled = false;
        
        utterThis.onend = () => {
             speakButton.disabled = false;
             stopButton.disabled = true;
        };
        utterThis.onerror = (event) => {
             console.error('SpeechSynthesisUtterance.onerror', event);
             speakButton.disabled = false;
             stopButton.disabled = true;
        };
    }
}

function stopSpeaking() {
    if (synth.speaking) {
        synth.cancel();
        speakButton.disabled = false;
        stopButton.disabled = true;
    }
}

// --- 3. Event Listeners ---
speakButton.addEventListener('click', speak);
stopButton.addEventListener('click', stopSpeaking);

// Update slider value displays
rateSlider.addEventListener('input', () => {
    rateValueSpan.textContent = rateSlider.value;
});
pitchSlider.addEventListener('input', () => {
    pitchValueSpan.textContent = pitchSlider.value;
});
