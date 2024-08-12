document.addEventListener('DOMContentLoaded', () => {
    // Simulate fetching user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
  
    if (userData) {
      document.getElementById('username').textContent = userData.username;
      document.getElementById('profile-username').textContent = userData.username;
      document.getElementById('profile-email').textContent = userData.email;
      document.getElementById('profile-pic').src = userData.profilePic || 'default-profile.jpg';
    } else {
      // Redirect to login page if no user data is found
      window.location.href = 'login.html';
    }
  });
  // Simulate storing user data after login/signup
const user = {
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    profilePic: 'path-to-profile-pic.jpg' // Optional: Path to the user's profile picture
  };
  
  localStorage.setItem('user', JSON.stringify(user));
  document.addEventListener('DOMContentLoaded', () => {
    // Simulate fetching user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
  
    if (userData) {
      document.getElementById('username').textContent = userData.username;
      document.getElementById('profile-username').textContent = userData.username;
      document.getElementById('profile-email').textContent = userData.email;
      document.getElementById('profile-pic').src = userData.profilePic || 'default-profile.jpg';
    } else {
      // Redirect to login page if no user data is found
      window.location.href = 'login.html';
    }
  
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-btn');
  
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  });