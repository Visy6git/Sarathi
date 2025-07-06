document.addEventListener('DOMContentLoaded', () => {
  const micButton = document.querySelector('.mic-button');
  const outputSection = document.querySelector('.output-section');
  const backgroundAnimation = document.querySelector('.background-animation');
  let isListening = false;

  function createBubbles() {
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      bubble.style.left = `${Math.random() * 100}vw`;
      bubble.style.width = `${Math.random() * 20 + 10}px`;
      bubble.style.height = bubble.style.width;
      bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
      backgroundAnimation.appendChild(bubble);
    }
  }
  createBubbles();

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.interimResults = false;

  micButton.addEventListener('click', () => {
    if (!isListening) {
      recognition.start();
      micButton.textContent = 'Stop Listening';
      isListening = true;
    } else {
      recognition.stop();
      micButton.textContent = 'Start Speaking';
      isListening = false;
    }
  });

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Recognized Speech:", transcript);

    // Send transcription to backend
    const response = await fetch('/lang-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: transcript })
    });

    const data = await response.json();
    outputSection.innerHTML = `<p>Detected language: ${data.message}</p>`;

    // Add Proceed button
    const proceedButton = document.createElement('button');
    proceedButton.textContent = 'Proceed';
    proceedButton.classList.add('proceed-button');
    
    proceedButton.addEventListener('click', () => {
        const detectedLanguage = data.message;
          window.location.href = '/main'; // Redirects to next page
          window.location.href = `/main?lang=${encodeURIComponent(detectedLanguage)}`;
        });
    outputSection.appendChild(proceedButton);
    micButton.textContent = 'Start Speaking';
    isListening = false;
  };

  recognition.onerror = (event) => {
    outputSection.textContent = 'Error detecting speech. Try again.';
    micButton.textContent = 'Start Speaking';
    isListening = false;
  };
});
