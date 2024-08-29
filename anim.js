document.addEventListener("DOMContentLoaded", () => {
    // Typewriter effect
    const typewriter = document.getElementById("typewriter");

    if (typewriter) {
        const isInViewport = (element) => {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };

        const onScroll = () => {
            if (isInViewport(typewriter)) {
                typewriter.classList.add("animate");
                window.removeEventListener("scroll", onScroll);
            }
        };

        window.addEventListener("scroll", onScroll);
        onScroll(); // Initial check in case the element is already in view
    }

    // Modal functionality
    const modalTriggers = document.querySelectorAll(".modal-trigger");
    const modals = document.querySelectorAll(".modal");
    const closes = document.querySelectorAll(".close");

    if (modalTriggers.length > 0) {
        // Display the first modal by default if there are modal triggers
        const firstModalId = modalTriggers[0].getAttribute("data-modal");
        const firstModal = document.getElementById(firstModalId);
        if (firstModal) {
            firstModal.style.display = "block";
        }
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener("click", function (e) {
            e.preventDefault();
            const modalId = this.getAttribute("data-modal");

            // Hide all modals first
            modals.forEach(modal => {
                modal.style.display = "none";
            });

            // Display the clicked modal
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = "block";
            }
        });
    });

    closes.forEach(close => {
        close.addEventListener("click", function () {
            modals.forEach(modal => {
                modal.style.display = "none";
            });
        });
    });

    window.addEventListener("click", function (event) {
        if (event.target.classList.contains("modal")) {
            modals.forEach(modal => {
                modal.style.display = "none";
            });
        }
    });
});
