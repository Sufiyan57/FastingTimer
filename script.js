window.onload = async function () {
    try {
        const position = await getCurrentPosition();
        await setAttributesValue(position);
        document.querySelector(".loader-div").style.display = "none";
        document.getElementById("page-container").classList.remove("blur");
    } catch (error) {
        alert(error);
    }
}

async function setAttributesValue(position) {
    let { latitude, longitude } = position;
    const promises = [
        setLocationCityName(position.locationName),
        getSunriseSunset(latitude, longitude, getCurrentDateAsString()),
        setIslamicDate()
    ];
    await Promise.all(promises);
}

async function getCurrentPosition() {

    var getIPUrl = 'https://api.ipify.org/?format=json';
    var IPResult = await fetchDataFromAPI(getIPUrl);
    var getLocationUrl = `https://ipinfo.io/${IPResult.ip}/json`
    var getLocationResult = await fetchDataFromAPI(getLocationUrl);
    let { city, region, country } = getLocationResult;
    let [latitude, longitude] = getLocationResult.loc.split(',');
    return {
        latitude,
        longitude,
        locationName: {city, region, country}
    }
}

async function setLocationCityName(locationName) {
    let { city, region, country } = locationName
    document.getElementById('location').innerText = city + ', ' + region + ', ' + country;
}

function setIslamicDate() {
    let myDate = new Date();
    let islamicDateOptions = { year: 'numeric', month: 'numeric', day: 'numeric', calendar: 'islamic-umalqura' };
    let islamicDate = new Intl.DateTimeFormat('en-US', islamicDateOptions).format(myDate);
    document.getElementById('islamicDate').innerText = getIslamicDate(islamicDate);
}

function getIslamicDate(date) {
    let [month, day, yearAndEra] = date.split('/');
    let [year, era] = yearAndEra.split(' ');
    const monthsIslamic = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
        'Rajab', 'Shaʻban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    const formattedDate = `${monthsIslamic[parseInt(month) - 1]} ${day}, ${year} AH`;
    return formattedDate;
}

function getCurrentDateAsString() {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}

function setIftariSehriTimes(times) {
    document.getElementById('iftari').innerText = addMinutesInTime(times.sunset, 2);
    document.getElementById('sehri').innerText = addMinutesInTime(times.first_light, -10);
}

async function getSunriseSunset(latitude, longitude, date) {

    var url = 'https://api.sunrisesunset.io/json?lat=' + latitude + '&lng=' + longitude + '&date=' + date;
    var data = await fetchDataFromAPI(url);
    setIftariSehriTimes(data.results);
}

function addMinutesInTime(timeStr, minutes) {
    let absMinutes = timeToMinutes(timeStr) + minutes;
    let resultStr = minutesToFormat(absMinutes);
    return resultStr;
}

function minutesToFormat(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60) % 24;
    let minutes = totalMinutes % 60;
    let newAmPm = hours < 12 ? 'AM' : 'PM';

    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }
    let resultStr = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + newAmPm;
    return resultStr;
}

function timeToMinutes(timeStr) {
    let timeParts = timeStr.split(/:| /);
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let ampm = timeParts[3];

    if (ampm === 'PM' && hours < 12) {
        hours += 12;
    }
    return totalMinutes = hours * 60 + minutes;
}

async function fetchDataFromAPI(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw new Error("Failed to fetch API data. ❌");
    }
}