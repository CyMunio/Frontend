document.addEventListener('DOMContentLoaded', function() {
    const slideLeftElements = document.querySelectorAll('.slide-left');
    const slideRightElements = document.querySelectorAll('.slide-right');
    const slideInElements = document.querySelectorAll('.slide-in');

    function checkSlide() {
        slideLeftElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            } else {
                element.classList.remove('visible');
            }
        });

        slideRightElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            } else {
                element.classList.remove('visible');
            }
        });

        slideInElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            } else {
                element.classList.remove('visible');
            }
        });
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    window.addEventListener('scroll', checkSlide);
    checkSlide(); // Run the function initially to check the visible elements
});

document.addEventListener("scroll", function() {
    const feat = document.querySelector(".feat");
    const rect = feat.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top <= windowHeight && rect.bottom >= 0) {
        feat.classList.add("visible");
    } else {
        feat.classList.remove("visible");
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const choseElement = document.querySelector('.chose');

    function handleScroll() {
        const rect = choseElement.getBoundingClientRect();
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);

        if (rect.top <= windowHeight - 100 && rect.bottom >= 100) { // Adjust this value to control when the animation triggers
            choseElement.classList.add('visible');
        } else {
            choseElement.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check the scroll position initially in case the element is already in view
});
let index = 0;
const cards = document.querySelector('.cards');
const totalCards = document.querySelectorAll('.card').length;

function slideCards() {
    index++;
    if (index >= totalCards) {
        index = 0;
    }
    cards.style.transform = `translateX(-${index * 100}%)`;
}

// Slide every 5 seconds
setInterval(slideCards, 4000);
