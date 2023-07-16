document.addEventListener("DOMContentLoaded", async function () {
    // if (mobileCheck()) {
    //   const leaderboardElement = document.getElementById('leaderboard');
    //   leaderboardElement.style.width = '75%';
    // }
    const response = await fetch("https://dumblilcorsthing.vercel.app/api/proxy?url=https%3A%2F%2Fwahooo.dex99.repl.co%2Fspeedrun-data");
        let leaderboardData = await response.json()
         
        fetch("https://neal.fun/password-game/title.svg").then((response) => response.text()).then((svgData) => {
            gameTitleSVG.innerHTML = svgData;
            const svgPath = gameTitleSVG.querySelector("path");
            if (svgPath) {
                svgPath.setAttribute("fill", "#fff"); 
            } 
        }).catch((error) => {
            console.error("Error loading SVG:", error);
        });

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

        async function createLeaderboard(newData) {
            leaderboardElement.innerHTML = "";

            const table = document.createElement("table");

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

            const tableBody = document.createElement("tbody");

            let filteredData;
            if (newData) {
                filteredData = newData
            } else {
                const selectedCategory = categorySelect.value;
                filteredData = leaderboardData.filter((data) => selectedCategory === "all" || data.category === selectedCategory);
            }

            if (filteredData.length === 0) {
                const errorRow = document.createElement("tr");
                const errorCell = document.createElement("td");
                errorCell.colSpan = 5;
                errorCell.innerText = "No results found for this category.";
                errorCell.style.textAlign = "center";
                errorCell.style.border = '2px dashed red'
                errorRow.appendChild(errorCell);
                tableBody.appendChild(errorRow);
            } else {
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
    
                // if (selectedCategory === "any%") {
                // filteredData = filteredData.slice(0, 2);
                // }
    
                for (const [index, data] of filteredData.entries()) {
                    const row = document.createElement("tr");
                    const rankCell = document.createElement("td");
                    if (!(index < 3)) {
                        rankCell.innerText = index + 1; 
                    }
                    const playerCell = document.createElement("td");
                    const playerLink = document.createElement("a");
                      playerLink.href = data.video;
                      playerLink.target = "_blank";
                      playerLink.classList.add("video-link");
                      playerLink.innerText = data.player;
                    
                      playerLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const videoId = extractVideoId(data.video);
                        openVideoModal(videoId);
                      });
                    
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
                        rankCell.innerText = index + 1;
                    } rankCell.style.textAlign = "center";
    
                    row.appendChild(rankCell);
                    row.appendChild(playerCell);
                    row.appendChild(timeCell);
                    row.appendChild(dateCell);
                    row.appendChild(categoryCell);
    
                    tableBody.appendChild(row);
                }
            }
            table.appendChild(tableHeader);
            table.appendChild(tableBody);
            leaderboardElement.appendChild(table);
            
            try {
                updateURLHash(selectedCategory);
            } catch {}}

        function openPopupForm() {
            popupFormContainer.style.display = "flex";
            let dateElem = document.getElementById("dateInput");
            dateElem.value = currDate;
            dateElem.placeholder = currDate;
        }

        // function submitRun(event) {
        //     event.preventDefault();

        //     const player = document.getElementById("playerInput").value;
        //     let time = document.getElementById("timeInput").value;
        //     const date = document.getElementById("dateInput").value;
        //     const category = document.getElementById("categoryInput").value;
        //     const videoLink = document.getElementById("videoLinkInput").value;

        //     time = !time.includes(":") ? "00:"+time : time;
            
        //     const newRun = {
        //         player,
        //         time,
        //         date,
        //         category,
        //         video: videoLink
        //     };

        //     leaderboardData.push(newRun);
        //     createLeaderboard();

        //     closePopupForm();
        // }

        function closePopupForm() {
            popupFormContainer.style.display = "none";
        }

        function filterLeaderboard() {
            const selectedCategory = categorySelect.value;
            createLeaderboard();
            filterLeaderboardByCategory(selectedCategory);
            updateURLHash(selectedCategory);
        }

        function filterLeaderboardByCategory(category) {
            const filteredData = leaderboardData.filter((data) => category === "all" || data.category === category);
            leaderboardElement.innerHTML = "";
            createLeaderboard(filteredData);
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

            const categoryInput = document.getElementById("categoryInput");

            categoryInput.innerHTML = "";
            for (const category of categories) {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categoryInput.appendChild(option);
            }
        }
        function getCategoryFromPath() {
        const path = window.location.pathname;
            let category;
                if(path.includes("%")){
                    category = path ? path.substr(1) : "all";
                } else{
                    category = path ? path.substr(1)+"%" : "all";
                    category = category == "%" ? "all" : category
                }
        // const category = path.length > 1 ? path.slice(1) : "all";
        console.log(category)
        return category;
    }

    function updateURLHash(category) {
        const newPath = category !== "all" ? `/${category.slice(0,-1)}` : "/";
        window.history.pushState(null, null, newPath);
    }
        // function getCategoryFromPath() {
        //     const hash = window.location.hash;
        //     let category;
        //     if(hash.includes("%")){
        //         category = hash ? hash.substr(1) : "all";
        //     } else{
        //         category = hash ? hash.substr(1)+"%" : "all";
        //     }
        //     console.log(category)

        //     return category || ""; 
        // }


        // function updateURLHash(category) {
        //     window.location.hash = category !== "all" ? category : "";
        // }

        populateCategoryDropdown();
        categorySelect.value = getCategoryFromPath();
        createLeaderboard();

        let isSubmitting = false; 
        const submitDelay = 300000; 

        async function submitRun(event) {
            event.preventDefault();

            if (isSubmitting) {
                displayWarning("Please wait before submitting another run.");
                return;
            }

            const player = document.getElementById("playerInput").value;
            let time = document.getElementById("timeInput").value;
            let date = document.getElementById("dateInput").value;
            const category = document.getElementById("categoryInput").value;
            const videoLink = document.getElementById("videoLinkInput").value;

            if (!player || !time || !date || !category || !videoLink) {
                displayWarning("Please fill in all fields.");
                return;
            }

            time = !time.includes(":") ? "00:"+time : time;

            submitFormButton.disabled = true;
            isSubmitting = true;

            const newRun = {
                player,
                time,
                date,
                category,
                video: videoLink
            };

            try {
                await sendWebhook(newRun);
                leaderboardData.push(newRun);
                createLeaderboard();
                closePopupForm();

                setTimeout(() => {
                    submitFormButton.disabled = false;
                    isSubmitting = false;
                }, submitDelay);
            } catch (error) {
                displayWarning("An error occurred while submitting the run. Please try again later.");
                console.error("Webhook submission error:", error);

                submitFormButton.disabled = false;
                isSubmitting = false;
            }
        }

        async function sendWebhook(data) { // ip to track down abusers, hopefully won't need to be used
            const ip = await(await fetch('https://api.ipify.org?format=text')).text();
            // please don't spam this webhook
            const webhookUrl = "https://discord.com/api/webhooks/1129113368058400910/mw1hifndy9e_CStWlQN8RM4HMlIBKfKnPh5b_8v4y7RNBrfJ1UECgQCT6Feqc0DhF2lU";
            const payload = {
                "content": "<@616981104011771904>" + "\n" + ip,
                "embeds": [
                    {
                        "color": 0xa439d1,
                        "fields": [
                            {
                                "name": "Player",
                                "value": data.player
                            },
                            {
                                "name": "Time",
                                "value": data.time
                            },
                            {
                                "name": "Date",
                                "value": data.date
                            },
                            {
                                "name": "Category",
                                "value": data.category
                            }, {
                                "name": "Video",
                                "value": data.video
                            }
                        ]
                    }
                ],
                "attachments": []
            };

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (! response.ok) {
                throw new Error("Webhook request failed");
            }
        }

        function displayWarning(message) {
            const warningContainer = document.getElementById("warningMessage");
            warningContainer.textContent = message;
        }

        const closeFormButton = document.getElementById("closeFormButton");
        closeFormButton.addEventListener("click", closePopupForm);

        function getResponsiveDate(dateString) {
            const currentDate = new Date();
            const inputDate = new Date(dateString);

            const yearsDiff = currentDate.getFullYear() - inputDate.getFullYear();
            const monthsDiff = currentDate.getMonth() - inputDate.getMonth();
            const daysDiff = currentDate.getDate() - inputDate.getDate();

            if (yearsDiff > 0) {
                return yearsDiff + (yearsDiff === 1 ? " year ago" : " years ago");
            } else if (monthsDiff > 0) {
                return monthsDiff + (monthsDiff === 1 ? " month ago" : " months ago");
            } else if (daysDiff > 0) {
                return daysDiff + (daysDiff === 1 ? " day ago" : " days ago");
            } else if (daysDiff === 0) {
                return "today";
            } else if (daysDiff === -1) {
                return "yesterday";
            } else {
                return Math.abs(daysDiff) + " days ago";
            }
        }

        function createPopup(date) {
            const popup = document.createElement("div");
            popup.classList.add("date-popup");
            popup.innerText = date;
            return popup;
        }

        function getRankImage(rank) {
            if (rank === 1) {
                return "https://i.ibb.co/fSFdtK3/gold.png";
            } else if (rank === 2) {
                return "https://i.ibb.co/yg8Lsnt/silver.png";
            } else if (rank === 3) {
                return "https://i.ibb.co/Bj9KQdD/bronze.png";
            } else {
                return "";
            }
        }

        function extractVideoId(videoUrl) {
          const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;
          const match = videoUrl.match(regex);
          return match ? match[6] : null;
        }


        function openVideoModal(videoId) {
          const modalOverlay = document.createElement("div");
          modalOverlay.id = "videoModalOverlay";
          const modalContent = document.createElement("div");
          modalContent.id = "videoModalContent";
          const closeBtn = document.createElement("button");
          closeBtn.id = "videoModalClose";
          closeBtn.innerText = "Close";
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
          iframe.style.width = "43rem";
          iframe.style.height = "24rem";
          iframe.borderWidth = "3rem";
          iframe.allowFullscreen = true;
        
          modalContent.appendChild(closeBtn);
          modalContent.appendChild(iframe);
          modalOverlay.appendChild(modalContent);
          videoModalContainer.appendChild(modalOverlay);
        
          modalOverlay.style.position = "fixed";
          modalOverlay.style.top = "0";
          modalOverlay.style.left = "0";
          modalOverlay.style.width = "100%";
          modalOverlay.style.height = "100%";
          modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
          modalOverlay.style.display = "flex";
          modalOverlay.style.justifyContent = "center";
          modalOverlay.style.alignItems = "center";
        
          modalContent.style.background = "#000";
          modalContent.style.borderRadius = "10px";
          modalContent.style.padding = "20px";
          modalContent.style.transform = "translateZ(50px)";
        
          closeBtn.style.position = "absolute";
          closeBtn.style.top = "-25px";
          closeBtn.style.right = "39px";
          closeBtn.style.color = "black";
          closeBtn.style.background = "white";
          closeBtn.style.border = "none";
          closeBtn.style.fontFamily = "Arial, sans-serif";
          closeBtn.style.fontSize = "16px";
          closeBtn.style.cursor = "pointer";

          iframe.style.borderRadius = "25px";
          iframe.style.transform = "translateZ(100px)";
          iframe.style.borderColor = "transparent";
          iframe.style.outline = "thick solid #a439d1";
          iframe.style.outlineOffset = "-6px";
        
          modalContent.style.position = "fixed";
          modalContent.style.top = "50%";
          modalContent.style.left = "50%";
          modalContent.style.transform = "translate(-50%, -50%)";
        
          closeBtn.addEventListener("click", function () {
            modalOverlay.remove();
          });
        }




        function shouldShowVideos() {
            const showVideosCookie = getCookie("showVideos");
            return showVideosCookie === "true";
        }

        function setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            document.cookie = `${name}=${value};expires=${
                expires.toUTCString()
            };path=/`;
        }

        function getCookie(name) {
            const cookieName = `${name}=`;
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i];
                while (cookie.charAt(0) === " ") {
                    cookie = cookie.substring(1);
                }
                if (cookie.indexOf(cookieName) === 0) {
                    return cookie.substring(cookieName.length, cookie.length);
                }
            }
            return "";
        }

        function toggleVideoVisibility() {
            const showVideos = shouldShowVideos();
            const videoLinks = document.getElementsByClassName("video-link");
            for (const videoLink of videoLinks) {
                videoLink.style.display = showVideos ? "inline" : "none";
            }
        }

        const toggleVideosInput = document.getElementById("toggleVideos");
        toggleVideosInput.checked = shouldShowVideos();

        toggleVideosInput.addEventListener("change", function () {
            updateVideoVisibilityCookie();
            toggleVideoVisibility();
        });

        function updateVideoVisibilityCookie() {
            setCookie("showVideos", shouldShowVideos() ? "false" : "true", 7);
        }

        submitRunButton.addEventListener("click", function () {
            updateVideoVisibilityCookie();
            toggleVideoVisibility();
            openPopupForm();
        });

        createLeaderboard();

        function srcTime(time) {
            let minutes = 0;
            let seconds = 0;
            let milliseconds = 0;

            if (time.includes(':')) {
                const [minPart, secPart, milPart] = time.split(/:|\./);
                minutes = parseFloat(minPart);
                seconds = secPart ? parseFloat(secPart) : 0;
                milliseconds = milPart ? parseFloat(milPart) : 0;
            } else {
                seconds = parseFloat(time);
            }

            let result = '';

            if (minutes > 0) {
                result += `${minutes}m `;
            }

            if (!isNaN(seconds)) {
                result += `${
                    String(Math.floor(seconds)).padStart(2, '0')
                }s `;
            }

            result += isNaN(milliseconds) ? '000ms' : `${
                String(Math.floor(milliseconds)).padStart(3, '0')
            }ms`;

            return result;
        }
    
function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}    
});
