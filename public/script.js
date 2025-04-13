// script.js
function showLoginForm() {
  document.getElementById('login-btn').style.display = 'inline';
  document.getElementById('signup-btn').style.display = 'inline';
  document.getElementById('submit-signup-btn').style.display = 'none';
  document.getElementById('back-to-login').style.display = 'none';
  document.getElementById('name').style.display = 'none';
  document.getElementById('birthdate').style.display = 'none';
  document.getElementById('signup-questions').style.display = 'none';
  document.getElementById('profile_pic').style.display = 'none';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('name').value = '';
  document.getElementById('birthdate').value = '';
  document.getElementById('profile_pic').value = '';
  document.querySelectorAll('.question').forEach(input => input.value = '');
  document.querySelectorAll('.answer').forEach(input => input.value = '');
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('logout-btn').style.display = 'inline';
      document.getElementById('main-content').style.display = 'flex';
      const userDisplay = document.getElementById('user-display');
      userDisplay.innerHTML = `
        <img src="${data.user.picture || '/Uploads/default.png'}" alt="${data.user.username}" style="width: 30px; height: 30px; border-radius: 50%;">
        <span>Logged in as: ${data.user.username}</span>
      `;
      loadProfiles();
      loadUnlockForm();
    } else {
      const error = await res.json();
      alert(`Login failed: ${error.message}`);
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Error during login');
  }
}

async function signup() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value.trim();
  const birthdate = document.getElementById('birthdate').value;
  const profilePicInput = document.getElementById('profile_pic');
  const profilePic = profilePicInput.files[0];
  const questions = Array.from(document.querySelectorAll('.question')).map(input => input.value.trim());
  const answers = Array.from(document.querySelectorAll('.answer')).map(input => input.value.trim());

  if (!username) {
    console.error('Validation failed: Username is empty');
    alert('Please fill in the username');
    return;
  }
  if (!password) {
    console.error('Validation failed: Password is empty');
    alert('Please fill in the password');
    return;
  }
  if (!name) {
    console.error('Validation failed: Name is empty');
    alert('Please fill in the profile name');
    return;
  }
  if (!birthdate) {
    console.error('Validation failed: Birthdate is empty');
    alert('Please select a birthdate');
    return;
  }
  if (questions.length !== 5) {
    console.error(`Validation failed: Found ${questions.length} questions, expected 5`);
    alert('Please provide exactly 5 questions');
    return;
  }
  if (answers.length !== 5) {
    console.error(`Validation failed: Found ${answers.length} answers, expected 5`);
    alert('Please provide exactly 5 answers');
    return;
  }
  if (questions.some(q => !q)) {
    console.error('Validation failed: One or more questions are empty', questions);
    alert('All questions must be non-empty');
    return;
  }
  if (answers.some(a => !a)) {
    console.error('Validation failed: One or more answers are empty', answers);
    alert('All answers must be non-empty');
    return;
  }
  if (new Set(questions).size !== questions.length) {
    console.error('Validation failed: Questions are not unique', questions);
    alert('Questions must be unique');
    return;
  }

  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('name', name);
  formData.append('birthdate', birthdate);
  if (profilePic) {
    formData.append('profile_pic', profilePic);
  }
  formData.append('questions', JSON.stringify(questions.map((q, i) => ({
    question: q,
    answer: answers[i]
  }))));

  try {
    const res = await fetch('/signup', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('logout-btn').style.display = 'inline';
      document.getElementById('main-content').style.display = 'flex';
      const userDisplay = document.getElementById('user-display');
      userDisplay.innerHTML = `
        <img src="${data.user.picture || '/Uploads/default.png'}" alt="${data.user.username}" style="width: 30px; height: 30px; border-radius: 50%;">
        <span>Logged in as: ${data.user.username}</span>
      `;
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      document.getElementById('name').value = '';
      document.getElementById('birthdate').value = '';
      document.getElementById('profile_pic').value = '';
      document.querySelectorAll('.question').forEach(input => input.value = '');
      document.querySelectorAll('.answer').forEach(input => input.value = '');
      loadProfiles();
      loadUnlockForm();
    } else {
      const error = await res.json();
      console.error('Signup failed:', error);
      alert(`Signup failed: ${error.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Signup error:', err);
    alert('Error during signup');
  }
}

async function logout() {
  try {
    const res = await fetch('/logout', { credentials: 'include' });
    if (res.ok) {
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('logout-btn').style.display = 'none';
      document.getElementById('main-content').style.display = 'none';
      document.getElementById('profile-details').style.display = 'none';
      document.getElementById('user-display').innerHTML = '';
      showLoginForm();
    } else {
      alert('Error during logout');
    }
  } catch (err) {
    console.error('Logout error:', err);
    alert('Error during logout');
  }
}

async function loadProfiles() {
  try {
    const res = await fetch('/api/profiles', { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const profiles = await res.json();
    const userRes = await fetch('/me', { credentials: 'include' });
    const currentUser = userRes.ok ? (await userRes.json()).user : null;
    const profileList = document.getElementById('profile-list');
    profileList.innerHTML = profiles
      .filter(profile => profile.userId !== (currentUser && currentUser._id))
      .map(profile => {
        const picture = profile.picture || '/Uploads/default.png';
        return `
          <div class="profile" onclick="showProfile('${profile._id}')">
            <img src="${picture}" alt="${profile.name}">
            <h3>${profile.name}</h3>
            <p>${new Date(profile.birthDate).toLocaleDateString()}</p>
          </div>
        `;
      }).join('');
  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('profile-list').innerHTML = '<p>Error loading profiles</p>';
  }
}

async function checkAuth() {
  try {
    const res = await fetch('/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('logout-btn').style.display = 'inline';
      document.getElementById('main-content').style.display = 'flex';
      const userDisplay = document.getElementById('user-display');
      userDisplay.innerHTML = `
        <img src="${data.user.picture || '/Uploads/default.png'}" alt="${data.user.username}" style="width: 30px; height: 30px; border-radius: 50%;">
        <span>Logged in as: ${data.user.username}</span>
      `;
      loadProfiles();
      loadUnlockForm();
    } else {
      showLoginForm();
    }
  } catch (err) {
    console.error('Auth check error:', err);
    showLoginForm();
  }
}

async function showProfile(id) {
  try {
    const res = await fetch(`/api/profiles/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const profile = await res.json();
    console.log('Profile data:', profile);
    document.getElementById('profile-details').style.display = 'block';
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-birthdate').textContent = `Born: ${new Date(profile.birthDate).toLocaleDateString()}`;
    window.currentProfileId = id;
    const picture = profile.picture || '/Uploads/default.png';
    document.getElementById('profile-pic').src = picture;
    document.getElementById('profile-bio').textContent = profile.bio || 'No bio';
    document.getElementById('profile-points').textContent = profile.points;
    document.getElementById('card-collection').innerHTML = profile.cardCollection.map(card => `
      <div class="card">
        <img src="${card.image}" alt="${card.title}" onerror="this.src='/Uploads/default.png'">
        <h4>${card.title}</h4>
        <p>Value: $${card.value}</p>
      </div>
    `).join('');
    document.getElementById('question-list').innerHTML = profile.questions.map((q, index) => `
      <div class="question" onclick="showAnswerForm(${index}, '${q.question.replace(/'/g, "\\'")}')">
        ${q.question}
      </div>
    `).join('');
    document.getElementById('answer-form').innerHTML = `
      <input type="text" id="answer-input" placeholder="Your answer" style="display:none;">
      <button id="submit-answer" style="display:none;">Submit Answer</button>
    `;
    const newButton = document.getElementById('submit-answer');
    const buttonClone = newButton.cloneNode(true);
    newButton.parentNode.replaceChild(buttonClone, newButton);
    buttonClone.addEventListener('click', () => submitAnswer(id));
    loadGiftForm(id);
  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('profile-details').innerHTML = '<p>Error loading profile</p>';
  }
}

function showAnswerForm(index, questionText) {
  window.currentQuestionIndex = index;
  document.getElementById('answer-input').style.display = 'inline';
  document.getElementById('submit-answer').style.display = 'inline';
  document.getElementById('answer-input').focus();
}

async function submitAnswer(profileId) {
  const answer = document.getElementById('answer-input').value.trim();
  if (!answer) {
    alert('Please enter an answer');
    return;
  }
  try {
    const res = await fetch(`/api/profiles/${profileId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIndex: window.currentQuestionIndex, answer }),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      alert(data.correct ? `Correct! You earned ${data.pointsEarned} points!` : 'Incorrect answer.');
      document.getElementById('answer-input').value = '';
      document.getElementById('answer-input').style.display = 'none';
      document.getElementById('submit-answer').style.display = 'none';
      showProfile(profileId);
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  } catch (err) {
    console.error('Answer submission error:', err);
    alert('Error submitting answer');
  }
}

async function loadUnlockForm() {
  try {
    const availableCards = document.getElementById('available-cards');
    availableCards.innerHTML = cards.map(card => `
      <div class="card" onclick="unlockCard('${card._id}')">
        <img src="${card.image}" alt="${card.title}">
        <h4>${card.title}</h4>
        <p>Price: ${card.price} points</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('available-cards').innerHTML = '<p>Error loading cards</p>';
  }
}

async function unlockCard(cardId) {
  try {
    // Fetch current user
    const userRes = await fetch('/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }) // ensure username/password are defined in scope
    });

    if (!userRes.ok) {
      const error = await userRes.json().catch(() => ({}));
      throw new Error(`User not authenticated: ${error.message || userRes.status}`);
    }

    const currentUser = await userRes.json();
    const userId = currentUser?.user?._id || currentUser?._id;

    if (!userId) {
      throw new Error('User ID not found');
    }

    // Fetch profile by userId
    const profileRes = await fetch(`/api/profiles/byUser/${userId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });

    if (!profileRes.ok) {
      const error = await profileRes.json().catch(() => ({}));
      throw new Error(`Profile not found: ${error.message || profileRes.status}`);
    }

    const profile = await profileRes.json();

    // Unlock card
    const unlockRes = await fetch(`/api/profiles/${profile._id}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cardId })
    });

    if (!unlockRes.ok) {
      const errorText = await unlockRes.text();
      try {
        const error = JSON.parse(errorText);
        alert(`Error unlocking card: ${error.error || unlockRes.status}`);
      } catch {
        alert(`Error unlocking card: Server returned non-JSON response (${unlockRes.status})`);
      }
    } else {
      alert('Card unlocked!');
      if (window.currentProfileId === profile._id) {
        showProfile(profile._id);
      }
    }

  } catch (err) {
    console.error('Unlock card error:', err);
    alert(`Error unlocking card: ${err.message}`);
  }
}


async function loadGiftForm(profileId) {
  try {
    const profileRes = await fetch(`/api/profiles/${profileId}`, { credentials: 'include' });
    const profile = await profileRes.json();
    const profilesRes = await fetch('/api/profiles', { credentials: 'include' });
    const profiles = await profilesRes.json();
    const userRes = await fetch('/me', { credentials: 'include' });
    const currentUser = userRes.ok ? (await userRes.json()).user : null;
    const giftCard = document.getElementById('gift-card');
    const recipient = document.getElementById('recipient');
    giftCard.innerHTML = profile.cardCollection.map(card => `
      <option value="${card._id}">${card.title}</option>
    `).join('');
    recipient.innerHTML = profiles
      .filter(p => p.userId !== (currentUser && currentUser._id))
      .map(p => `<option value="${p._id}">${p.name}</option>`).join('');
    document.getElementById('gift-form').style.display = 'block';
  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('gift-form').innerHTML = '<p>Error loading gift form</p>';
  }
}

async function sendGift() {
  const profileId = window.currentProfileId;
  const cardId = document.getElementById('gift-card').value;
  const recipientId = document.getElementById('recipient').value;

  console.log('Sending gift with:', { profileId, cardId, recipientId });

  try {
    const res = await fetch(`/api/profiles/${profileId}/gift`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, recipientId }),
      credentials: 'include'
    });
    if (res.ok) {
      alert('Card gifted!');
      showProfile(profileId);
    } else {
      const errorText = await res.text();
      console.error('Failed to gift card:', res.status, errorText);
      try {
        const error = JSON.parse(errorText);
        alert(`Error gifting card: ${error.error || res.status}`);
      } catch (e) {
        alert(`Error gifting card: Server returned non-JSON response (${res.status})`);
      }
    }
  } catch (err) {
    console.error('Fetch error:', err);
    alert(`Error sending gift: ${err.message}`);
  }
}

const cards = Array.from({ length: 50 }, (_, i) => ({
  _id: `card-${i + 1}-id`,
  title: `Card ${i + 1}`,
  image: ['star.png', 'heart.png', 'gold.png'][i % 3],
  price: (i + 1) * 10,
  value: (i + 1) * 5
}));

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  const signupBtn = document.getElementById('signup-btn');
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      document.getElementById('signup-btn').style.display = 'none';
      document.getElementById('submit-signup-btn').style.display = 'inline';
      document.getElementById('back-to-login').style.display = 'inline';
      document.getElementById('name').style.display = 'block';
      document.getElementById('birthdate').style.display = 'block';
      document.getElementById('signup-questions').style.display = 'block';
      document.getElementById('profile_pic').style.display = 'block';
    });
  } else {
    console.error('Element #signup-btn not found');
  }

  const backToLogin = document.getElementById('back-to-login');
  if (backToLogin) {
    backToLogin.addEventListener('click', showLoginForm);
  } else {
    console.error('Element #back-to-login not found');
  }
});