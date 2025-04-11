async function loadProfiles() {
    try {
      const res = await fetch('/api/profiles');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const profiles = await res.json();
      const profileList = document.getElementById('profile-list');
      profileList.innerHTML = profiles.map(profile => `
        <div class="profile" onclick="showProfile('${profile._id}')">
          <img src="${profile.picture}" alt="${profile.name}">
          <h3>${profile.name}</h3>
          h4>${profile.bio || 'No bio'}</h4>
          <p>Points: ${profile.points}</p>
          <h2>birthDate: ${new Date(profile.birthDate).toLocaleDateString()}</h2>
        </div>
      `).join('');
    } catch (err) {
      console.error('Fetch error:', err);
      document.getElementById('profile-list').innerHTML = '<p>Error loading profiles</p>';
    }
  }
  
  async function showProfile(id) {
    const res = await fetch(`/api/profiles/${id}`);
    const profile = await res.json();
    document.getElementById('profile-details').style.display = 'block';
    document.getElementById('profile-name').textContent = profile.name;
    window.currentProfileId = id; // Store ID
    document.getElementById('profile-pic').src = profile.picture;
    document.getElementById('profile-bio').textContent = profile.bio || 'No bio';
    document.getElementById('profile-points').textContent = profile.points;
    document.getElementById('card-collection').innerHTML = profile.cardCollection.map(card => `
      <div class="card">
        <img src="${card.image}" alt="${card.title}">
        <h4>${card.title}</h4>
        <p>Value: $${card.value}</p>
      </div>
    `).join('');
    loadQuestions(id);
    loadUnlockForm(id);
    loadGiftForm(id);
  }
  
  async function loadQuestions(profileId) {
    const res = await fetch(`/api/profiles/${profileId}/questions`);
    const questions = await res.json();
    const questionList = document.getElementById('question-list');
    questionList.innerHTML = questions.map(q => `
      <div class="question" onclick="showAnswerForm('${q._id}', '${q.questionText}')">
        ${q.questionText} (Points: ${q.pointsAwarded})
      </div>
    `).join('');
  }
  
  function showAnswerForm(questionId, questionText) {
    document.getElementById('answer-form').style.display = 'block';
    document.getElementById('current-question').textContent = questionText;
    window.currentQuestionId = questionId;
  }
  
  async function submitAnswer() {
    const answer = document.getElementById('answer-input').value;
    const profileId = window.currentProfileId;
    const res = await fetch(`/api/profiles/${profileId}/answer`, { // Fixed URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: window.currentQuestionId, answer }),
    });
    const result = await res.json();
    alert(result.correct ? `Correct! +${result.points} points` : 'Incorrect.');
    document.getElementById('answer-form').style.display = 'none';
    document.getElementById('answer-input').value = '';
    showProfile(profileId);
  }
  
  async function loadUnlockForm(profileId) {
    const cardRes = await fetch('/api/profiles');
    const profiles = await cardRes.json();
    const cards = profiles.flatMap(p => p.cardCollection); // Simplified
    const availableCards = document.getElementById('available-cards');
    availableCards.innerHTML = cards.map(card => `
      <div class="card" onclick="unlockCard('${profileId}', '${card._id}')">
        <img src="${card.image}" alt="${card.title}">
        <h4>${card.title}</h4>
        <p>Price: ${card.price} points</p>
      </div>
    `).join('');
    document.getElementById('unlock-form').style.display = 'block'; // Fixed ID
  }
  
  async function unlockCard(profileId, cardId) {
    const res = await fetch(`/api/profiles/${profileId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    });
    if (res.ok) {
      alert('Card unlocked!');
      showProfile(profileId);
    } else {
      const error = await res.json();
      alert(error.error);
    }
  }
  
  async function loadGiftForm(profileId) {
    const profileRes = await fetch(`/api/profiles/${profileId}`);
    const profile = await profileRes.json();
    const profilesRes = await fetch('/api/profiles');
    const profiles = await profilesRes.json();
    const giftCard = document.getElementById('gift-card');
    const recipient = document.getElementById('recipient');
    giftCard.innerHTML = profile.cardCollection.map(card => `
      <option value="${card._id}">${card.title}</option>
    `).join('');
    recipient.innerHTML = profiles.map(p => `
      <option value="${p._id}">${p.name}</option>
    `).join('');
    document.getElementById('gift-form').style.display = 'block';
  }
  
  async function sendGift() {
    const profileId = window.currentProfileId;
    const cardId = document.getElementById('gift-card').value;
    const recipientId = document.getElementById('recipient').value;
    const res = await fetch(`/api/profiles/${profileId}/gift`, { // Fixed URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, recipientId }),
    });
    if (res.ok) {
      alert('Card gifted!');
      showProfile(profileId);
    } else {
      alert('Error gifting card.');
    }
  }
  
  loadProfiles();