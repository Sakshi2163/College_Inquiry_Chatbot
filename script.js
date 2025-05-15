function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    console.log("🔍 Sending message:", message);
    console.log("User message sent:", message);

    if (!message) return;
  
    addMessage("You", message);
  
    fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(data => {
      addMessage("Bot", data.reply);

      setTimeout(() => {
        addMessage("Bot", "Any other query?");
      }, 500); // a little delay for natural flow

      input.value = '';
    });
  }
  
  //mic 

  const micBtn = document.getElementById('mic-btn');
  const chatlog = document.getElementById('chatlog');
  
  // Voice Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  
  // Mic button click event
  micBtn.addEventListener('click', () => {
    recognition.start();
    micBtn.innerText = "....";
  });
  
  // When speech is recognized
  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    userInput.value = transcript;  // Fill existing input bar
    micBtn.innerText = "🎤";        // Reset mic button
  };
  
  // If there is an error
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    alert('Sorry, could not recognize your voice. Please try again.');
    micBtn.innerText = "🎤";
  };
  

  // Add message to chatlog
  function addMessage(sender, message) {
    const chatlog = document.getElementById('chatlog');
    const messageDiv = document.createElement('div');
    const formattedMessage = message.replace(/\n/g, "<br>");
    messageDiv.innerHTML = `<p><strong>${sender}:</strong><br>${formattedMessage}</p>`;
    chatlog.appendChild(messageDiv);
    chatlog.scrollTop = chatlog.scrollHeight;
  }
  
  // Dummy bot response (replace this with your backend/API later)
  // function getBotResponse(userMessage) {
  //   let response = '';
  
  //   if (userMessage.toLowerCase().includes('dinner')) {
  //     response = '🍽️ **Dinner Time**: 7:00 PM to 8:30 PM';
  //   } else if (userMessage.toLowerCase().includes('cs faculty')) {
  //     response = 'Computer Science: Dr. XYZ Sharma';
  //   } else {
  //     response = 'No relevant information found. Please try with another keyword.';
  //   }
  
  //   setTimeout(() => {
  //     addMessage('Bot', response);
  //     setTimeout(() => {
  //       addMessage('Bot', 'Any other query?');
  //     }, 500);
  //   }, 1000);
  // }
  

  window.addEventListener('DOMContentLoaded', () => {
    addMessage("Bot", "Hey! How can I help you?");
  });
  