document.addEventListener('DOMContentLoaded', function () {
  const anonymousToggle = document.getElementById("anonymousToggle");
  if (anonymousToggle) {
    anonymousToggle.addEventListener("change", async function (e) {
      try {
        const response = await fetch("/profile/toggle-anonymous", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            isAnonymous: e.target.checked
          })
        });

        if (response.ok) {
          const message = e.target.checked ? "Anonymous mode enabled" : "Anonymous mode disabled";
          showNotification(message, "success");
        } else {
          throw new Error("Failed to update setting");
        }
      } catch (error) {
        showNotification("Failed to update setting", "error");
        e.target.checked = !e.target.checked;
      }
    });
  }

  document.querySelectorAll(".drop-game-btn").forEach(button => {
    button.addEventListener("click", async function (e) {
      const gameId = this.getAttribute("data-game-id");

      if (!confirm("Are you sure you want to drop this game?")) {
        return;
      }

      try {
        const reqBody = {
          gameId: gameId,
        };
        const response = await fetch(`/games/leave`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(reqBody)
        });

        if (response.ok) {
          showNotification("Successfully dropped from game", "success");
          // Remove the game card from the DOM
          setTimeout(() => {
            const card = this.closest(".game-card");
            if (card) card.remove();
            const section = document.querySelector('.profile-section');
            if (section) {
              const countBadge = section.querySelector(".count-badge");
              if (countBadge) {
                const currentCount = parseInt(countBadge.textContent) || 0;
                countBadge.textContent = Math.max(0, currentCount - 1);
              }
            }
          }, 500);
        } else {
          throw new Error("Failed to drop game");
        }
      } catch (error) {
        showNotification("Failed to drop game", "error");
      }
    });
  });

  // Notification function
  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
});
