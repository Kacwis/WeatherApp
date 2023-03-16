const WRONG_INPUT = "You need to provide city name";
const WRONG_CITY_WARNING = "There is no city with this name!";
const API_KEY = null; // ADD API KEY HERE INSTEAD OF NULL
const WEATHER_URL_BASE = "https://api.openweathermap.org/data/2.5/weather?";
const GEOCODING_URL_BASE = "http://api.openweathermap.org/geo/1.0/direct?q=";
const FLAG_API_URL_BASE = "https://flagsapi.com/";
const MOON_BACKGROUND_VIDEO_SRC = "/vid/moon.mp4";
const CLOUDS_BACKGROUND_VIDEO_SRC = "/vid/clouds.mov";
const DRIZZLE_BACKGROUND_VIDEO_SRC = "/vid/drizzle.mov";
const FOG_BACKGROUND_VIDEO_SRC = "/vid/fog.mp4";
const RAIN_BACKGROUND_VIDEO_SRC = "/vid/rain.mp4";
const SNOW_BACKGROUND_VIDEO_SRC = "/vid/snow.mp4";
const STORM_BACKGROUND_VIDEO_SRC = "/vid/storm.mp4";
const SUN_BACKGROUND_VIDEO_SRC = "/vid/sun.mp4";

// HTML elements

const cityInput = document.querySelector("#city-input");
const showWeatherButton = document.querySelector("#show-weather");
const temperature = document.querySelector("#temp");
const humidity = document.querySelector("#humidity");
const weatherType = document.querySelector("#weather-type");
const feelsLike = document.querySelector("#feels-like");
const pressure = document.querySelector("#pressure");
const speed = document.querySelector("#speed");
const direction = document.querySelector("#direction");
const cityName = document.querySelector("#city-name");
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");
const backgroundVideo = document.querySelector("video");
const findCityContainer = document.querySelector("#find-city");
const mainTitle = document.querySelector(".title");
const flag = document.querySelector("#flag");
const findNewCityButton = document.querySelector("#find-new-city");
const weatherResultContainer = document.querySelector("#weather-result");
const creditsButton = document.querySelector("#credits");
const closeCreditsButton = document.querySelector("#close-credits");
const creditsContainer = document.querySelector(".credits");
const cityNameInvalidError = document.querySelector("#error");

// Buttons event listeners

showWeatherButton.addEventListener("click", () => {
	const cityName = cityInput.value;
	if (!validateCityName(cityName)) {
		cityNameInvalidError.classList.remove("hidden");
		cityNameInvalidError.textContent = WRONG_INPUT;
		return;
	} else {
		cityNameInvalidError.classList.add("hidden");
		cityInput.value = "";
	}
	if (API_KEY === null) {
		backgroundVideo.setAttribute("src", STORM_BACKGROUND_VIDEO_SRC);
		hideFindCityContainer();
	} else {
		showWeather(cityName);
	}
});

findNewCityButton.addEventListener("click", () => {
	hideWeatherResultContainer();
});

creditsButton.addEventListener("click", () => {
	showCredits();
});

closeCreditsButton.addEventListener("click", () => {
	hideCredits();
});

// Weather api call

const showWeather = async (cityName) => {
	const weatherResult = await sendWeatherApiRequest(cityName);
	if (weatherResult === undefined) {
		return;
	}
	hideFindCityContainer();
	setAllData(weatherResult);
};

const sendWeatherApiRequest = async (cityName) => {
	const apiUrl = `${WEATHER_URL_BASE}q=${cityName}&units=metric&appid=${API_KEY}`;
	const response = await fetch(apiUrl);
	const data = await response.json();
	if (!response.ok) {
		validateLocation();
		return;
	}
	return data;
};

// Data setters

const setAllData = (weatherResult) => {
	// General
	setDataRow(temperature, weatherResult.main.temp.toFixed(1));
	setDataRow(feelsLike, weatherResult.main.feels_like.toFixed(1));
	setDataRow(pressure, `${weatherResult.main.pressure} hPa`);
	setDataRow(humidity, `${weatherResult.main.humidity}%`);
	setDataRow(weatherType, weatherResult.weather[0].description);
	// Wind
	setDataRow(speed, `${weatherResult.wind.speed} m/s`);
	setDataRow(direction, getDirection(weatherResult.wind.direction));
	//Location
	setDataRow(cityName, weatherResult.name);
	flag.setAttribute("src", getFlagSrc(weatherResult.sys.country));
	flag.setAttribute("alt", `${weatherResult.sys.country} flag`);
	const sunsetTimeStamp =
		(weatherResult.sys.sunset + weatherResult.timezone) * 1000;
	setDataRow(sunset, getTimeFromTimeStamp(sunsetTimeStamp));
	const sunriseTimeStamp =
		(weatherResult.sys.sunrise + weatherResult.timezone) * 1000;
	setDataRow(sunrise, getTimeFromTimeStamp(sunriseTimeStamp));
	backgroundVideo.classList.remove("hidden");
	setBackground(weatherResult.weather[0].id, sunriseTimeStamp, sunsetTimeStamp);
};

const setDataRow = (label, value) => {
	label.textContent = value;
};

// Layout controlling methods

const hideFindCityContainer = () => {
	findCityContainer.classList.add("hidden");
	mainTitle.classList.add("hidden");
	weatherResultContainer.classList.remove("hidden");
};

const hideWeatherResultContainer = () => {
	weatherResultContainer.classList.add("hidden");
	mainTitle.classList.remove("hidden");
	findCityContainer.classList.remove("hidden");
	backgroundVideo.setAttribute("src", MOON_BACKGROUND_VIDEO_SRC);
};

const showCredits = () => {
	creditsContainer.classList.remove("credits-open-animation");
	const delay = 900;
	setTimeout(() => {
		creditsContainer.classList.remove("credits-hidden");
		creditsContainer.classList.add("credits-full");
		creditsContainer.classList.remove("credits-open-animation");
	}, delay);
	creditsContainer.classList.add("credits-open-animation");
};

const hideCredits = () => {
	creditsContainer.classList.remove("credits-open-animation");
	creditsContainer.classList.add("credits-close-animation");
	const delay = 900;
	setTimeout(() => {
		creditsContainer.classList.remove("credits-full");
		creditsContainer.classList.add("credits-hidden");
		creditsContainer.classList.remove("credits-close-animation");
	}, delay);
};

// Util methods

const getFlagSrc = (countryCode) => {
	return `${FLAG_API_URL_BASE}${countryCode}/flat/64.png`;
};

const getTimeFromTimeStamp = (timeStamp) => {
	const date = new Date(timeStamp);
	return date.toUTCString().slice(17, 22);
};

const setBackground = (id, sunriseTimeStamp, sunsetTimeStamp) => {
	if (id >= 200 && id < 233) {
		backgroundVideo.setAttribute("src", STORM_BACKGROUND_VIDEO_SRC);
	} else if (id >= 300 && id < 322) {
		backgroundVideo.setAttribute("src", DRIZZLE_BACKGROUND_VIDEO_SRC);
	} else if (id >= 500 && id < 532) {
		backgroundVideo.setAttribute("src", RAIN_BACKGROUND_VIDEO_SRC);
	} else if ((id >= 600) & (id < 623)) {
		backgroundVideo.setAttribute("src", SNOW_BACKGROUND_VIDEO_SRC);
	} else if (id === 800) {
		const now = Date.now();
		console.log(now);
		let backgroundVideoSrc;
		if (now > sunriseTimeStamp && now < sunsetTimeStamp) {
			backgroundVideoSrc = SNOW_BACKGROUND_VIDEO_SRC;
		} else {
			backgroundVideoSrc = MOON_BACKGROUND_VIDEO_SRC;
		}
		backgroundVideo.setAttribute("src", backgroundVideoSrc);
	} else if (id > 800) {
		backgroundVideo.setAttribute("src", CLOUDS_BACKGROUND_VIDEO_SRC);
	}
};

const getDirection = (deg) => {
	switch (deg) {
		case 0:
			return "North";
		case 360:
			return "North";
		case 90:
			return "East";
		case 180:
			return "South";
		case 270:
			return "West";
	}
	if (deg < 90) {
		return "North - East";
	} else if (deg > 90 && deg < 180) {
		return "South-East";
	} else if (deg > 180 && deg < 270) {
		return "South-West";
	} else {
		return "North-West";
	}
};

const validateCityName = (cityName) => {
	if (cityName.trim() === "") {
		return false;
	}
	return true;
};

const validateLocation = () => {
	cityNameInvalidError.textContent = WRONG_CITY_WARNING;
	cityNameInvalidError.classList.remove("hidden");
};
