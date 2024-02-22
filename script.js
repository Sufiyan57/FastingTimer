window.onload = function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            setLocationCityName(latitude, longitude);
            getSunriseSunset(latitude, longitude, getCurrentDateAsString());
            setIslamicDate();
        }, function (error) {
            console.error('Error:', error);
            alert("Failed to retrieve your time.");
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
}
async function setLocationCityName(latitude, longitude) {
    var nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    var result = await fetchDataFromAPI(nominatimApiUrl);
    document.getElementById('location').innerText =  result.address.city + ', ' + result.address.state + ', ' + result.address.country;
}

function setIslamicDate() {
    let myFormat = 'en-u-ca-islamic-umalqura-nu-latn'; // use islamic-umalqura calendar (most modern)
    let myDate = new Date(Date.now());
    const locale = 'ar-SA';
    let islamicDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(myDate);
    document.getElementById('islamicDate').innerText = islamicDate;
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

function minutesToFormat(totalMinutes){
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

function timeToMinutes(timeStr){
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
        alert("Failed to fetch api data.");
    }
}