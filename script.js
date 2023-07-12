document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch(
    "https://dumb-lil-cors-thing.vercel.app/api?url=https%3A%2F%2Fwahooo.dex99.repl.co%2Fspeedrun-data"
  );
  let leaderboardData = await response.json();

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const currDate = `${year}-${month}-${day}`;

  const leaderboardElement = document.getElementById("leaderboard");
  const submitRunButton = document.getElementById("submitRunButton");
  const popupFormContainer = document.getElementById("popupFormContainer");
  const submitFormButton = document.getElementById("submitFormButton");
  const gameTitleSVG = document.getElementById("gameTitle");
  const categorySelect = document.getElementById("categorySelect");
  const videoModalContainer = document.getElementById("videoModalContainer");

  submitRunButton.addEventListener("click", openPopupForm);
  submitFormButton.addEventListener("click", submitRun);
  categorySelect.addEventListener("change", filterLeaderboard);

  async function createLeaderboard(selectedCategory) {
    leaderboardElement.innerHTML = "";

    const table = document.createElement("table");

    // Create table header
    const tableHeader = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const rankHeader = document.createElement("th");
    rankHeader.innerText = "Rank";
    const playerHeader = document.createElement("th");
    playerHeader.innerText = "Player";
    const timeHeader = document.createElement("th");
    timeHeader.innerText = "Time";
    const dateHeader = document.createElement("th");
    dateHeader.innerText = "Date";
    const categoryHeader = document.createElement("th");
    categoryHeader.innerText = "Category";

    headerRow.appendChild(rankHeader);
    headerRow.appendChild(playerHeader);
    headerRow.appendChild(timeHeader);
    headerRow.appendChild(dateHeader);
    headerRow.appendChild(categoryHeader);
    tableHeader.appendChild(headerRow);

    // Create table body
    const tableBody = document.createElement("tbody");

    let filteredData = leaderboardData.filter(
      (data) =>
        selectedCategory === "all" || data.category === selectedCategory
    );

    // Sort the filtered data based on time (lowest to highest)
    filteredData.sort((a, b) => {
      const timeA = a.time.split(":").map(Number);
      const timeB = b.time.split(":").map(Number);

      for (let i = 0; i < 3; i++) {
        if (timeA[i] !== timeB[i]) {
          return timeA[i] - timeB[i];
        }
      }

      return 0;
    });

    if (selectedCategory === "any%") {
      filteredData = filteredData.slice(0, 2);
    }

    for (const [index, data] of filteredData.entries()) {
      const row = document.createElement("tr");
      const rankCell = document.createElement("td");
      if (!(index < 3)) {
        rankCell.innerText = index + 1; // Set the rank based on the index
      }
      const playerCell = document.createElement("td");
      const playerLink = document.createElement("a");
      playerLink.href = data.video;
      playerLink.target = "_blank";
      playerLink.classList.add("video-link");
      playerLink.innerText = data.player;
      playerCell.appendChild(playerLink);
      const timeCell = document.createElement("td");
      timeCell.innerText = srcTime(data.time);
      const dateCell = document.createElement("td");
      dateCell.innerText = getResponsiveDate(data.date);
      const categoryCell = document.createElement("td");
      categoryCell.innerText = data.category;

      dateCell.addEventListener("mouseenter", function () {
        const popup = createPopup(data.date);
        dateCell.appendChild(popup);
      });

      dateCell.addEventListener("mouseleave", function () {
        const popup = dateCell.querySelector(".date-popup");
        if (popup) {
          dateCell.removeChild(popup);
        }
      });

      if (index < 3) {
        const rankImageElement = document.createElement("img");
        rankImageElement.src = getRankImage(index + 1);
        rankImageElement.classList.add("rank-image");
        rankCell.appendChild(rankImageElement);
      } else {
        rankCell.innerText = index + 1; // Set the rank number for other ranks
      }
      rankCell.style.textAlign = "center";

      row.appendChild(rankCell);
      row.appendChild(playerCell);
      row.appendChild(timeCell);
      row.appendChild(dateCell);
      row.appendChild(categoryCell);

      tableBody.appendChild(row);
    }

    table.appendChild(tableHeader);
    table.appendChild(tableBody);
    leaderboardElement.appendChild(table);

    updateURLHash(selectedCategory);
  }

  function openPopupForm() {
    popupFormContainer.style.display = "flex";
    let dateElem = document.getElementById("dateInput");
    dateElem.value = currDate;
    dateElem.placeholder = currDate;
  }

  function submitRun(event) {
    event.preventDefault();

    const player = document.getElementById("playerInput").value;
    const time = document.getElementById("timeInput").value;
    const date = document.getElementById("dateInput").value;
    const category = document.getElementById("categoryInput").value;
    const videoLink = document.getElementById("videoLinkInput").value;

    const newRun = {
      player,
      time,
      date,
      category,
      video: videoLink,
    };

    leaderboardData.push(newRun);
    createLeaderboard(category);

    closePopupForm();
  }

  function closePopupForm() {
    popupFormContainer.style.display = "none";
  }

  function filterLeaderboard() {
    const selectedCategory = categorySelect.value;
    createLeaderboard(selectedCategory);
  }

  function populateCategoryDropdown() {
    const categories = [...new Set(leaderboardData.map((data) => data.category))];
    categories.unshift("all");

    categorySelect.innerHTML = "";
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    }
  }

  function getCategoryFromPath() {
    const hash = window.location.hash;
    const category = hash ? hash.substring(1) : "all"; // Remove the leading '#' character

    return category;
  }

  function updateURLHash(category) {
    window.location.hash = category !== "all" ? category : "";
  }

  populateCategoryDropdown();
  const initialCategory = getCategoryFromPath();
  categorySelect.value = initialCategory;
  createLeaderboard(initialCategory);

  fetch("https://neal.fun/password-game/title.svg")
    .then((response) => response.text())
    .then((svgData) => {
      gameTitleSVG.innerHTML = svgData;
      const svgPath = gameTitleSVG.querySelector("path");
      if (svgPath) {
        svgPath.setAttribute("fill", "#fff"); // Change the fill color to white
      }
    })
    .catch((error) => {
      console.error("Error loading SVG:", error);
    });

  let isSubmitting = false; // Variable to track submission state
  const submitDelay = 300000; // Delay 5 mins before enabling submit button again

  async function submitRun(event) {
    event.preventDefault();

    if (isSubmitting) {
      displayWarning("Please wait before submitting another run.");
      return;
    }

    const player = document.getElementById("playerInput").value;
    const time = document.getElementById("timeInput").value;
    let date = document.getElementById("dateInput").value;
    const category = document.getElementById("categoryInput").value;
    const videoLink = document.getElementById("videoLinkInput").value;

    if (!player || !time || !date || !category) {
      displayWarning("Please fill in all the required fields.");
      return;
    }

    // Disable the submit button and set the submission state
    submitFormButton.disabled = true;
    isSubmitting = true;

    const newRun = {
      player,
      time,
      date,
      category,
      video: videoLink,
    };

    try {
      await sendWebhook(newRun);
      leaderboardData.push(newRun);
      createLeaderboard(category);
      closePopupForm();

      // Enable the submit button and reset the submission state after the delay
      setTimeout(() => {
        submitFormButton.disabled = false;
        isSubmitting = false;
      }, submitDelay);
    } catch (error) {
      displayWarning(
        "An error occurred while submitting the run. Please try again later."
      );
      console.error("Webhook submission error:", error);
      // Enable the submit button and reset the submission state immediately
      submitFormButton.disabled = false;
      isSubmitting = false;
    }
  }

  async function sendWebhook(data) {
    //ip to track down abusers, hopefully won't need to be used
    const ip = await (await fetch("https://api.ipify.org?format=text")).text();
    //please don't spam this webhook
    const webhookUrl =
      "https://discord.com/api/webhooks/1127730250118344795/Y9h1xFMEUVq--qZqA7R3rNR-1_jIfqO-3N85W_8YuN2poM7XQRqy2NHFBV6fJUySVFkk";
    const payload = {
      content: "<@616981104011771904>" + "\n" + ip,
      embeds: [
        {
          color: 0xa439d1,
          fields: [
            {
              name: "Player",
              value: data.player,
            },
            {
              name: "Time",
              value: data.time,
            },
            {
              name: "Date",
              value: currDate,
            },
            {
              name: "Category",
              value: data.category,
            },
            {
              name: "Video",
              value: data.video,
            },
          ],
        },
      ],
      attachments: [],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Webhook request failed");
    }
  }
});
