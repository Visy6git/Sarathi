  let currentLanguage = 'en';
  let isListening = false;

  document.querySelectorAll('.language-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.language-btn').forEach(b => {
        b.classList.remove('active');
      });
      
      btn.classList.add('active');
      
      currentLanguage = btn.dataset.lang;
      
      if (window.recognition) {
        window.recognition.lang = getLanguageCode(currentLanguage);
      }
      
      const welcomeMsg = {
        'en': 'Welcome ,How may I assist you today?',
        'hi': 'स्वागत है ,मैं आपकी कैसे सहायता कर सकता हूं?',
        'bn': 'স্বাগতম , আমি আপনাকে কীভাবে সহায়তা করতে পারি?',
        'gu': 'સ્વાગત છે ,હું આપની કેવી રીતે મદદ કરી શકું?',
        'mr': 'स्वागत आहे ,मी आपली कशी मदत करू शकतो?',
        'ta': 'வரவேற்கிறோம் ,நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        'te': 'స్వాగతం , నేను మీకు ఎలా సహాయపడగలను?',
        'kn': 'ಸ್ವಾಗತ , ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        'ml': 'സ്വാഗതം, എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
        'as': 'স্বাগতম, মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
        'pa': 'ਜੀ ਆਇਆਂ ਨੂੰ,ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
        'or': 'ସ୍ୱାଗତ, ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
        'brx': 'स्वागतम, आं मोगाखौ माबोरै मदत होफिननो हागौ?',
        'mni': 'তরামনা, ঐনা নঙবু করম্না মতেং পাঙবা ঙম্গনি?'
      };
      
      addMessage(welcomeMsg[currentLanguage] || welcomeMsg['en'], 'bot');
    });
  });

  const micButton = document.getElementById('micButton');
  let mediaRecorder;
  let audioChunks = [];

  micButton.addEventListener('click', async () => {
      if (!isListening) {
          startRecording();
      } else {
          stopRecording();
      }
  });

  async function startRecording() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          
          const formData = new FormData();
          formData.append('audio', audioBlob, `audio_${new Date().toISOString()}.wav`);
          formData.append('targetLang', getLanguageCode(currentLanguage)); 
          try {
              const response = await fetch('/main/upload-audio', {
                  method: 'POST',
                  body: formData // Send form data directly
              });
              if (response.ok) {
                const { englishText, langText } = await response.json();
                  audioChunks = [];
                  addMessage(langText, 'user');
                  processQuery(englishText);
              } else {
                  console.error('Failed to upload audio');
              }
          } catch (error) {
              console.error('Error uploading audio:', error);
          }
      };
      
      mediaRecorder.start();
      isListening = true;
      micButton.classList.add('active');
  }

  function stopRecording() {
      mediaRecorder.stop();
      isListening = false;
      micButton.classList.remove('active');
  }

  const textInput = document.getElementById('textInput');
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && textInput.value.trim()) {
      const query = textInput.value.trim();
      addMessage(query, 'user');
      processQuery(query);
      textInput.value = '';
    }
  });

  function addMessage(text, type) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${type}-message`);
    messageDiv.textContent = text;

    if (type === 'bot') {
      const audioButton = document.createElement('button');
      audioButton.classList.add('audio-button');
      audioButton.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      `;
      messageDiv.appendChild(audioButton);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function processQuery(query) {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading-animation');
    loadingDiv.innerHTML = `
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    fetch('/main/chat-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            input: query,
            languageCode: getLanguageCode(currentLanguage)
        })
    })
    .then(response => response.json())
    .then(data => {
        loadingDiv.remove();
        addMessage(data.message, 'bot');
    })
    .catch(error => {
        loadingDiv.remove();
        console.error('Error:', error);
        addMessage('Sorry, there was an error processing your request.', 'bot');
    });
  }


  function getLanguageCode(lang) {
    const codes = {
      'en': 'en',
      'hi': 'hi',
      'bn': 'bn',
      'gu': 'gu',
      'mr': 'mr',
      'ta': 'ta',
      'te': 'te',
      'kn': 'kn',
      'ml': 'ml',
      'as': 'as',  
      'pa': 'pa',  
      'or': 'or',  
      'brx': 'brx', 
      'mni': 'mni'  
    };
    return codes[lang] || 'en-IN';
  }

  const deleteHistoryBtn = document.getElementById('deleteHistoryBtn');
  const loadingAnimation = document.getElementById('loadingAnimation');
  const chatMessages = document.getElementById('chatMessages');

  async function makeSafeRequest(url, options) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  function handleConnectionError() {
    addMessage('Unable to connect to the server. Please check your internet connection and try again.', 'bot');
  }

  deleteHistoryBtn.addEventListener('click', () => {
  chatMessages.innerHTML = ''; // Clear the chat display
  
  fetch('/main/delete-request', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      addMessage('Welcome, I am Sarathi ready to help you with any queries related to government schemes.', 'bot');
  })
  .catch(error => console.error('Error:', error));
});

document.addEventListener("DOMContentLoaded", () => {
  const schemesContainer = document.getElementById("schemesContainer");
  const tagButtons = document.querySelectorAll(".tag");
  let selectedTags = new Set();
  let allSchemes = [];

  // Function to load CSV and parse it
  const loadSchemesFromCSV = async () => {
    const response = await fetch("/static/govt_schemes.csv"); // Ensure the CSV is in the correct directory
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        allSchemes = result.data.map((scheme) => ({
          title: scheme["Scheme Name"],
          description: scheme["Scheme Details"],
          benefits: scheme["Benefits"],
          eligibility: scheme["Eligibility"],
          documents: scheme["Documents Required"],
          fullText: Object.values(scheme).join(" ").toLowerCase(), // Combine all fields for search
          officialWebsite: scheme["Official Website"],
        }));

        renderSchemeCards(allSchemes);
      },
    });
  };

  // Function to generate scheme cards dynamically
  const renderSchemeCards = (schemes) => {
    schemesContainer.innerHTML = ""; // Clear previous content

    schemes.forEach((scheme) => {
      const card = document.createElement("a");
      card.href = scheme.officialWebsite || "#"; // Fallback to prevent broken links
      card.target = "_blank"; // Open in new tab
      card.classList.add("scheme-card");

      card.innerHTML = ` 
        <h3 class="scheme-title">${scheme.title}</h3>
        <p class="scheme-description">${scheme.description}</p>
      `;

      card.addEventListener("mouseover", () => showSchemeInfo(scheme, card));
      card.addEventListener("mouseout", hideSchemeInfo);

      schemesContainer.appendChild(card);
    });
  };

  // Function to filter schemes based on selected tags using a text search
  const filterSchemes = () => {
    if (selectedTags.size === 0) {
      renderSchemeCards(allSchemes);
      return;
    }

    let filteredSchemes = allSchemes.filter((scheme) => {
      return [...selectedTags].some((tag) => scheme.fullText.includes(tag.toLowerCase()));
    });

    renderSchemeCards(filteredSchemes);
  };

  // Event listener for tag selection
  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.dataset.tag.toLowerCase();
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        button.classList.remove("selected");
      } else {
        selectedTags.add(tag);
        button.classList.add("selected");
      }
      filterSchemes();
    });
  });

  // Tooltip function for displaying scheme details
  const showSchemeInfo = (scheme, card) => {
    const infoWindow = document.getElementById("schemeInfoWindow");
    const rect = card.getBoundingClientRect();

    const windowWidth = window.innerWidth;
    const infoWidth = 1000; // Increased width to 1000px
    let leftPos = rect.right + 20;

    // If the info window would extend beyond the right edge of the viewport, display it to the left of the card
    if (rect.right + infoWidth + 20 > windowWidth) {
      leftPos = rect.left - infoWidth - 20;
    }

    // Clamp leftPos so the info window remains within the viewport
    leftPos = Math.max(10, Math.min(windowWidth - infoWidth - 10, leftPos));

    infoWindow.style.left = leftPos + "px";
    infoWindow.style.top = rect.top + "px";

    infoWindow.querySelector(".info-title").textContent = scheme.title;

    const documentsList = infoWindow.querySelector(".info-documents ul");
    documentsList.innerHTML = scheme.documents
      .split(";")
      .map((doc) => `<li>${doc}</li>`)
      .join("");

    const eligibilityList = infoWindow.querySelector(".info-eligibility ul");
    eligibilityList.innerHTML = scheme.eligibility
      .split(";")
      .map((criteria) => `<li>${criteria}</li>`)
      .join("");

    infoWindow.classList.add("visible");
  };

  // Function to hide tooltip
  const hideSchemeInfo = () => {
    document.getElementById("schemeInfoWindow").classList.remove("visible");
  };

  loadSchemesFromCSV(); // Call function to load CSV on page load
});



  const voiceToggle = document.getElementById('voiceToggle');
  const voiceTypeLabel = document.getElementById('voiceType');
  let useFemaleTTS = false;

  let currentAudio = null; // Track the current audio object

// Toggle between male and female TTS
voiceToggle.addEventListener('change', (e) => {
  useFemaleTTS = e.target.checked;
  voiceTypeLabel.textContent = useFemaleTTS ? 'female' : 'male';
});

// Handle the click event to play or stop audio
document.addEventListener('click', async (e) => {
  if (e.target.closest('.audio-button')) {
      const button = e.target.closest('.audio-button');
      const messageText = button.closest('.message').textContent;
      const gender = useFemaleTTS ? 'female' : 'male';

      if (currentAudio && !currentAudio.paused) {
          // Stop the current audio if it's playing
          currentAudio.pause();
          currentAudio.currentTime = 0; // Reset to the start
          button.classList.remove('playing');
      } else {
          try {
              // Request the .wav file directly from the backend and play it
              await fetchAndPlayAudio(messageText, getLanguageCode(currentLanguage), gender, button);
          } catch (error) {
              console.error("Error fetching or playing audio:", error);
          }
      }
  }
});

// Function to fetch audio from backend and play it
async function fetchAndPlayAudio(query, targetLang, gender, button) {
  try {
      const response = await fetch('/main/tts-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, targetLang, gender })
      });
      if (!response.ok) {
          throw new Error('Failed to fetch audio');
      }
      const audioBlob = await response.blob();

      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      currentAudio.play();
      button.classList.add('playing');
      currentAudio.onended = () => {
          button.classList.remove('playing');
      };
  } catch (error) {
      console.error("Error fetching or playing audio:", error);
  }
}