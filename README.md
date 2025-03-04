<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Countdown Timer</title>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background: #121212;
      font-family: 'Press Start 2P', cursive;
      color: white;
      overflow: hidden;
    }

    .date-time {
      font-size: 24px;
      color: #00ffff;
      text-shadow: 0 0 15px cyan, 0 0 30px magenta;
      margin-bottom: 40px;
      font-weight: bold;
    }

    .clock-container {
      display: inline-block;
      position: relative;
      margin: 10px;
      width: 120px;
      height: 120px;
      perspective: 1000px;
      background: linear-gradient(45deg, #ff0000, #ff7300, #fffc00, #32cd32, #1e90ff, #8a2be2);
      background-size: 400% 400%;
      animation: gradientBackground 8s ease infinite;
      border-radius: 15px;
    }

    @keyframes gradientBackground {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .flip-card {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #222;
      color: white;
      font-size: 50px;
      text-align: center;
      line-height: 120px;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .flip-card .top, 
    .flip-card .bottom {
      position: absolute;
      width: 100%;
      height: 50%;
      background: #333;
      overflow: hidden;
    }

    .flip-card .top {
      top: 0;
      border-bottom: 1px solid #444;
    }

    .flip-card .bottom {
      bottom: 0;
      line-height: 0;
    }

    .flip-card .top::after, 
    .flip-card .bottom::after {
      content: attr(data-value);
      display: block;
      width: 100%;
      height: 100%;
    }

    .flip {
      animation: flipPage 0.6s ease-in-out;
    }

    @keyframes flipPage {
      0% { transform: rotateX(0deg); }
      50% { transform: rotateX(-90deg); }
      100% { transform: rotateX(-180deg); }
    }

    input[type="datetime-local"] {
      padding: 8px 12px;
      font-size: 14px;
      border: none;
      border-radius: 5px;
      margin-top: 20px;
      background-color: #222;
      color: white;
      outline: none;
      text-align: center;
      width: 160px;
    }

    button {
      padding: 10px 20px;
      font-size: 16px;
      background-color: #32cd32;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }

    button:hover {
      background-color: #228b22;
    }

    .input-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 40px;
    }

  </style>
</head>
<body>

  <div class="date-time" id="date-time">Loading...</div>

  <div class="clock-container">
    <div class="flip-card" id="hours">
      <div class="top" data-value="00"></div>
      <div class="bottom" data-value="00"></div>
    </div>
  </div>

  <div class="clock-container">
    <div class="flip-card" id="minutes">
      <div class="top" data-value="00"></div>
      <div class="bottom" data-value="00"></div>
    </div>
  </div>

  <div class="clock-container">
    <div class="flip-card" id="seconds">
      <div class="top" data-value="00"></div>
      <div class="bottom" data-value="00"></div>
    </div>
  </div>

  <!-- Input fields for user to set the target date -->
  <div class="input-container">
    <label for="target-date">Set Target Date and Time:</label>
    <input type="datetime-local" id="target-date">
    <button onclick="setTargetDate()">Set Target</button>
  </div>

  <script>
    let targetDate;

    // Function to set target date based on user input
    function setTargetDate() {
      const inputDate = document.getElementById('target-date').value;
      if (inputDate) {
        targetDate = new Date(inputDate).getTime();
        updateClock();  // Update immediately after setting the target date
      } else {
        alert("Please select a valid date and time.");
      }
    }

    // Function to update the countdown clock
    function updateClock() {
      if (!targetDate) return; // Ensure targetDate is set before updating

      let now = new Date().getTime();
      let remainingTime = targetDate - now;

      // Calculate remaining time
      let days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      let hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      // Update the date-time display
      document.getElementById("date-time").innerText = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

      // Update flip clock for hours, minutes, and seconds
      updateFlipClock("hours", hours.toString().padStart(2, '0'));
      updateFlipClock("minutes", minutes.toString().padStart(2, '0'));
      updateFlipClock("seconds", seconds.toString().padStart(2, '0'));
    }

    // Function to update flip clock display
    function updateFlipClock(id, newValue) {
      let flipCard = document.getElementById(id);
      let topHalf = flipCard.querySelector(".top");
      let bottomHalf = flipCard.querySelector(".bottom");

      let currentValue = topHalf.getAttribute("data-value");

      if (currentValue !== newValue) {
        topHalf.setAttribute("data-value", newValue);
        bottomHalf.setAttribute("data-value", newValue);
        flipCard.classList.remove("flip");
        void flipCard.offsetWidth; // Restart animation
        flipCard.classList.add("flip");
      }
    }

    setInterval(updateClock, 1000);  // Update every second
  </script>

</body>
</html>
