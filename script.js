// ⭐️ Configuration: Make sure 'profile.png' and 'coin.png' are in the same folder as index.html.
const DEFAULT_PROFILE_IMG_URL = 'profile.png'; 

// --- Configuration and State ---
let selectedCoins = 0;
let initialBalance = 92538280;
let currentBalance = initialBalance;

// --- Sound Effects Setup ---
const clickSound = new Audio('https://www.soundjay.com/buttons/button-click-01.mp3');
const successSound = new Audio('https://www.soundjay.com/applause/applause-2.mp3');

// --- Utility Functions ---
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// --- Profile Image Logic ---
function setProfileImage(url) {
    const img = document.getElementById('profile-img');
    
    if (url) {
        img.src = url;
        img.style.display = 'block';

        img.onerror = () => {
            // Fallback visual if the local file is missing
            img.style.display = 'none';
            document.getElementById('profile-pic-container').style.backgroundColor = '#ddd';
        };
    } else {
         img.style.display = 'none';
    }
}

// --- History Logic ---
function logTransaction(receiver, amount) {
    const list = document.getElementById('transaction-list');
    const noHistoryMsg = document.getElementById('no-history-msg');
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const coinIconSrc = 'coin.png'; 

    const listItem = document.createElement('li');
    listItem.className = 'transaction-item';
    listItem.innerHTML = `
        <div class="item-details">
            <span class="item-receiver">Sent to: ${receiver}</span>
            <div class="item-time">@ ${timeString}</div>
        </div>
        <div class="item-amount">
            <span>-${formatNumber(amount)}</span>
            <img class="coin-icon-small" src="${coinIconSrc}" alt="coin">
        </div>
    `;

    list.prepend(listItem);
    noHistoryMsg.style.display = 'none';
}

// --- Coin Counter Animation ---
function animateCoinCounter(targetValue, duration = 1000) {
    const balanceElement = document.getElementById('coin-balance');
    const startValue = currentBalance;
    const startTime = performance.now();

    function updateCounter(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        const currentValue = Math.floor(startValue - ((startValue - targetValue) * easedProgress));
        balanceElement.textContent = formatNumber(currentValue);

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            currentBalance = targetValue;
        }
    }
    requestAnimationFrame(updateCounter);
}

// --- Send Logic ---
function sendCoins(){
    let receiver = document.getElementById("receiver").value.trim();
    let selectedCoinAmount = selectedCoins;
    let amountDisplay = document.querySelector(".card.selected") ?
                        document.querySelector(".card.selected").getAttribute("data-amount") : "0";

    if(receiver === "" || selectedCoinAmount === 0){
        document.getElementById("errorMsg").innerHTML = "Please enter a **receiver username** and select a **coin amount** to proceed.";
        document.getElementById("errorPopup").style.display = "flex";
        return;
    }

    if (selectedCoinAmount > currentBalance) {
         document.getElementById("errorMsg").innerHTML = `You only have ${formatNumber(currentBalance)} coins. The selected amount (${amountDisplay}) is too high.`;
         document.getElementById("errorPopup").style.display = "flex";
         return;
    }

    // Show loading
    document.getElementById("loadingPopup").style.display = "flex";

    // Fake backend simulation delay
    setTimeout(() => {
        document.getElementById("loadingPopup").style.display = "none";
        document.getElementById("successPopup").style.display = "flex";

        logTransaction(receiver, selectedCoinAmount);

        // Message including the 24-hour delivery notice
        document.getElementById("successMsg").innerHTML =
            `${amountDisplay} coins successfully sent to <b>${receiver}</b>!<br><br>
            <small style="color:#777; font-weight:normal;">The recipient should receive the coins within 24 hours.</small>`;

        const newBalance = currentBalance - selectedCoinAmount;
        animateCoinCounter(newBalance);

        successSound.currentTime = 0;
        successSound.play();

        selectedCoins = 0;
        document.getElementById("receiver").value = '';
        document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));

    }, 2500); // 2.5 seconds loading time
}

function closeSuccess(){
    document.getElementById("successPopup").style.display = "none";
}

function closeError(){
    document.getElementById("errorPopup").style.display = "none";
}

// --- Initial setup and Event Listeners ---

// Event listeners for the coin cards (Needs to be done after the DOM loads)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            clickSound.currentTime = 0;
            clickSound.play();

            document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");

            selectedCoins = parseInt(card.getAttribute("data-coins"));
        });
    });

    // Initial load: Set balance and profile image
    document.getElementById('coin-balance').textContent = formatNumber(initialBalance);
    setProfileImage(DEFAULT_PROFILE_IMG_URL);
});

// Expose functions globally for HTML onclick attributes
window.sendCoins = sendCoins;
window.closeSuccess = closeSuccess;
window.closeError = closeError;
