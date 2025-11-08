document.addEventListener("DOMContentLoaded", function () {
    const openPopupBtn = document.getElementById("openPopup");
    const closePopupBtn = document.getElementById("closePopup");
    const popup = document.getElementById("popup");
    const popupContent = document.querySelector(".popup-content");

    let isDragging = false, startY = 0, offsetY = 0;

    openPopupBtn.addEventListener("click", () => popup.style.display = "block");
    closePopupBtn.addEventListener("click", () => popup.style.display = "none");

    window.addEventListener("click", (event) => {
        if (event.target === popup) popup.style.display = "none";
    });

    // Touch events for dragging
    const handleTouchStart = (e) => {
        isDragging = true;
        startY = e.touches[0].clientY - offsetY;
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        offsetY = e.touches[0].clientY - startY;
        popupContent.style.transform = `translate(-50%, ${offsetY}px)`;
    };

    const stopDragging = () => isDragging = false;

    popupContent.addEventListener("touchstart", handleTouchStart, { passive: true });
    popupContent.addEventListener("touchmove", handleTouchMove, { passive: true });
    popupContent.addEventListener("touchend", stopDragging);
    popupContent.addEventListener("touchcancel", stopDragging);
});
