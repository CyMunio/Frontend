document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.querySelector('h2.username');

    // Function to get URL parameters
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            username: params.get('username')
        };
    }

    // Update the username in the profile page
    const { username } = getQueryParams();
    if (username && usernameElement) {
        usernameElement.textContent = username;
    } else {
        console.error('Username not found in query parameters or element not available.');
    }
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const button = document.getElementById('theme-toggle');
    if (document.body.classList.contains('dark-theme')) {
        button.textContent = 'Light Theme';
    } else {
        button.textContent = 'Dark Theme';
    }
});
