const API_KEY = "YOUR API KEY HERE";

const searchLoc = document.getElementById("search-location");
const searchSpinner = document.querySelector(".location-pin-loader");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-button");

const container = document.querySelector(".container");
const notFoundBox = document.querySelector(".not-found");
const weatherBox = document.querySelector(".weather-box");
const weatherDetailsBox = document.querySelector(".weather-details-box");

const listButton = document.querySelector(".list-button");
const popupList = document.querySelector(".popup-list");

// If the browser doesn't allow geolocation services,
// disable the geolocation button
window.onload = () => {
    if (!navigator.geolocation) {
        toggleSpinner();
    }
};

var showingWeather = false;

// The user can use their current location using the geolocation
// function to find their city and country code which gets sent
// to the getWeather() function. Handles spinner functionality
searchLoc.addEventListener("click", () => {
    toggleSpinner();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
            )
                .then((response) => response.json())
                .then((json) => `${json.city}, ${json.countryCode}`)
                .then((location) => {
                    searchInput.value = location;
                    getWeather(location);
                })
                .catch((e) => {
                    console.log(e);
                    setTimeout(() => {
                        toggleSpinner();
                    }, 500);
                });
        },
        (e) => {
            console.log(e);
            setTimeout(() => {
                toggleSpinner();
            }, 500);
        }
    );
});

// The search button event listener
searchBtn.addEventListener("click", () => {
    getWeather(searchInput.value);
});

// Uses the given city name and country code to return
// current weather details and display them to the user.
// This data includes the temperature, description, humidity,
// and wind speed, as well as showing an appropriate image
function getWeather(location) {
    if (location === "") return;

    const formatStr = location.replace(/,\s+/g, ",");

    fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${formatStr}&units=metric&appid=${API_KEY}`
    )
        .then((response) => response.json())
        .then((json) => {
            if (json.cod === "404") {
                notFoundBox.classList.add("show-contents");
                weatherBox.classList.remove("show-contents");
                weatherDetailsBox.classList.remove("show-contents-flex");
                container.style.height = "411px";
                showingWeather = false;
            } else {
                notFoundBox.classList.remove("show-contents");
                weatherBox.classList.add("show-contents");
                weatherDetailsBox.classList.add("show-contents-flex");
                container.style.height = "599px";

                const temperatureImage =
                    document.querySelector(".temperature-image");
                const temperature = document.querySelector(".temperature");
                const description = document.querySelector(".description");
                const humidity = document.getElementById("humidity-info");
                const clouds = document.getElementById("clouds-info");

                switch (json.weather[0].main) {
                    case "Clear":
                        if (isNight(json.timezone)) {
                            temperatureImage.src = "images/ClearNight.png";
                        } else {
                            temperatureImage.src = "images/Clear.png";
                        }
                        break;

                    case "Clouds":
                        if (isNight(json.timezone)) {
                            temperatureImage.src = "images/CloudsNight.png";
                        } else {
                            temperatureImage.src = "images/Clouds.png";
                        }
                        break;

                    case "Drizzle":
                        temperatureImage.src = "images/Drizzle.png";
                        break;

                    case "Rain":
                        temperatureImage.src = "images/Rain.png";
                        break;

                    case "Snow":
                        temperatureImage.src = "images/Snow.png";
                        break;

                    case "Thunderstorm":
                        temperatureImage.src = "images/Thunderstorm.png";
                        break;

                    case "Atmosphere":
                        temperatureImage.src = "images/Atmosphere.png";
                        break;

                    case "Extreme":
                        temperatureImage.src = "images/Extreme.png";
                        break;

                    default:
                        if (isNight(json.timezone)) {
                            temperatureImage.src = "images/ClearNight.png";
                        } else {
                            temperatureImage.src = "images/Clear.png";
                        }
                        break;
                }

                searchInput.value = `${json.name}, ${json.sys.country}`;
                temperature.innerHTML = `${parseInt(
                    json.main.temp
                )}<span>°C</span>`;
                description.innerHTML = `${json.weather[0].description}`;
                humidity.innerHTML = `${json.main.humidity}%`;
                clouds.innerHTML = `${parseInt(json.wind.speed)}Km/h`;

                if (showingWeather) {
                    toggleSpinner();
                } else {
                    setTimeout(() => {
                        toggleSpinner();
                    }, 1100);
                }

                showingWeather = true;
            }
        })
        .catch((e) => {
            console.log(e);
            toggleSpinner();
        });
}

// Toggles whether or not the spinner is grabbing the
// users location and using it or not
function toggleSpinner() {
    searchSpinner.classList.toggle("show-contents");
    if (searchLoc.disabled) {
        searchLoc.disabled = false;
        searchLoc.style.cursor = "pointer";
    } else {
        searchLoc.disabled = true;
        searchLoc.style.cursor = "default";
    }
}

// Given a UTC offset, returns whether the local time
// is during the night or day
function isNight(offsetUTC) {
    const currentDateUTC = new Date();
    const currentTimeUTC =
        currentDateUTC.getTime() + currentDateUTC.getTimezoneOffset() * 60000;
    const localTime = new Date(currentTimeUTC + offsetUTC * 1000);

    const hours = localTime.getHours();
    const minutes = localTime.getMinutes();

    if (
        (hours >= 18 || hours <= 6) &&
        (hours !== 18 || minutes >= 20) &&
        (hours !== 6 || minutes <= 20)
    ) {
        return true;
    } else {
        return false;
    }
}

// Toggles whether the popup menu get's toggled or not
listButton.addEventListener("click", () => {
    listButton.classList.toggle("active");
    popupList.classList.toggle("active");
});

// If anywhere other than the popup menu get's clicked,
// close the popup menu
window.addEventListener("click", (event) => {
    if (
        !popupList.contains(event.target) &&
        !listButton.contains(event.target)
    ) {
        listButton.classList.remove("active");
        popupList.classList.remove("active");
    }
});
