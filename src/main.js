let daysData = [];
let currentCity
let currentAddress
let isFirstLoad = true

async function loadWeather(city) {
    const apiKey = '63F9CQHTVSCUJ7HK5SDNNZF99'
    const resp = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json`)
    const reportButton = document.querySelector('.report-button');
    if (!resp.ok) {
        alert('City not found')
        if (reportButton) reportButton.disabled = true;
        return
    }
    const data = await resp.json()
    daysData = data.days.slice(0, 10)

    currentCity = data.address
    currentAddress = data.resolvedAddress
    
    isFirstLoad = true
    updateDetailedInfo(0)
    renderCarousel()
    console.log(data)
    if (reportButton) reportButton.disabled = false;
}

function updateDetailedInfo(index) {
    const detailedCity = document.querySelector('.location-header .header')
    const detailedCountry = document.querySelector('.location-header .sub-header')
    const detailedTemp = document.querySelector('.temperature-header .header')
    const detailedDesc = document.querySelector('.temperature-header .sub-header')
    const windElem = document.querySelector('.wind-detail')
    const humidityElem = document.querySelector('.humidity-detail')
    const detailedIcon = document.querySelector('.main-picture picture')
    
    const day = daysData[index]
    detailedCity.textContent = currentCity
    detailedCountry.textContent = currentAddress
    detailedTemp.textContent = Math.round(day.tempmax) + '°C'
    detailedDesc.textContent = day.conditions
    windElem.textContent = 'Wind: ' + Math.round(day.windspeed) + ' km/h'
    humidityElem.textContent = 'Humidity: ' + day.humidity + '%'
    createDetailedIconByConditions(day.icon, detailedIcon)
    setUpPopupListener(index)
}

function renderCarousel() {
    const carousel = document.querySelector('.carousel')
    carousel.innerHTML = ''
    daysData.forEach((day, index) => {
        const li = document.createElement('li')
        li.className = 'carousel-item'
        
        const weatherBrief = document.createElement('div')
        weatherBrief.className = 'weather-brief'
        
        const daySpan = document.createElement('span')
        daySpan.className = 'day'
        daySpan.textContent = `${index === 0 ? 'Today' : new Date(day.datetime).toLocaleDateString('en-EN', { weekday: 'short' })}`

        const dateSpan = document.createElement('span')
        dateSpan.className = 'date'
        const date = new Date(day.datetime)
        const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short'})
        dateSpan.textContent = formatted

        let currentPicture = ''
        if (day.icon.includes('rain')) currentPicture = 'rain'
        if (day.icon.includes('cloud')) currentPicture = 'cloud'
        if (day.icon.includes('clear')) currentPicture = 'sun'

        const img = document.createElement('img')
        img.setAttribute('src', `./assets/${currentPicture}.png`)
        img.setAttribute('width', '50')
        img.setAttribute('alt', 'Weather image')
         
        const highTemp = document.createElement('span')
        highTemp.className = 'high-temperature'
        highTemp.textContent = Math.round(day.tempmax) + '°C'

        const lowTemp = document.createElement('span')
        lowTemp.className = 'low-temperature'
        lowTemp.textContent = Math.round(day.tempmin) + '°C'

        weatherBrief.append(daySpan, dateSpan, img, highTemp, lowTemp)
        li.appendChild(weatherBrief)

        li.addEventListener('click', () => {
            updateDetailedInfo(index)
            document.querySelectorAll('.carousel-item').forEach(item => { item.classList.remove('current')})
            li.classList.add('current')
        })

        carousel.appendChild(li)
    })

    if (isFirstLoad) {
        const firstItem = carousel.querySelector('.carousel-item')
        if (firstItem) {
            firstItem.classList.add('current')
        }
        isFirstLoad = false
    }
}

function createDetailedIconByConditions(icon, detailedIcon) {
    let currentPicture = ''
    if (icon.includes('rain')) currentPicture = 'rain'
    if (icon.includes('cloud')) currentPicture = 'cloud'
    if (icon.includes('clear')) currentPicture = 'sun'

    detailedIcon.innerHTML = ''
    
    const img = document.createElement('img')
    img.setAttribute('src', `./assets/${currentPicture}.png`)
    img.setAttribute('alt', 'Image representing today\'s weather')
    img.setAttribute('width', '200')

    detailedIcon.appendChild(img)
}

const searchInput = document.querySelector('.search-input')
const searchButton = document.querySelector('.search-button')
searchButton.addEventListener('click', () => {
    const value = searchInput.value.trim();
    if (value !== '') {
        loadWeather(value)
        searchInput.value = '';
    } else {
        searchInput.focus();
    }
})
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchButton.click();
    }
})

function setUpPopupListener(index) {
    const detailedTemp = document.querySelector('.temperature-header .header')
    const popup = document.querySelector(".popup")
    const closePopupButton = document.querySelector(".popup-close")
    const popupContent = document.querySelector(".popup-content")

    if (!popup || !closePopupButton || !popupContent) {
        return
    }

    // Remove existing listeners to prevent duplicates
    detailedTemp.replaceWith(detailedTemp.cloneNode(true))
    const newDetailedTemp = document.querySelector('.temperature-header .header')
    
    newDetailedTemp.style.cursor = 'pointer'
    newDetailedTemp.addEventListener('click', () => {
        setUpPopupContent(index)
        popup.classList.add('popup-active')
        setTimeout(() => {
            popupContent.classList.add('popup-content-active')
        }, 10)
    })

    closePopupButton.addEventListener('click', closePopup)
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup()
    })

    function closePopup() {
        popupContent.classList.remove('popup-content-active')
        setTimeout(() => {
            popup.classList.remove('popup-active')
        }, 300)
    }
}

function setUpPopupContent(index) {
    const popupCity = document.querySelector('.popup-city')
    const popupDate = document.querySelector('.popup-date')
    const popupDescription = document.querySelector('.popup-description')
    const popupMaxTemp = document.querySelector('.max-real')
    const popupMinTemp = document.querySelector('.min-real')
    const popupMaxFeel = document.querySelector('.max-feels')
    const popupMinFeel = document.querySelector('.min-feels')
    const popupSunrise = document.querySelector('.sunrise')
    const popupSunset = document.querySelector('.sunset')
    const popupVisibility = document.querySelector('.visibility')
    const popupPressure = document.querySelector('.pressure')

    const day = daysData[index]

    popupCity.textContent = currentAddress
    const dateStr = day.datetime
    const date = new Date(dateStr)

    const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    popupDate.textContent = formatted
    popupDescription.textContent = day.description
    popupMaxTemp.textContent = Math.round(day.tempmax) + '°C'
    popupMinTemp.textContent = Math.round(day.tempmin) + '°C'
    popupMaxFeel.textContent = Math.round(day.feelslikemax) + '°C'
    popupMinFeel.textContent = Math.round(day.feelslikemin) + '°C'
    const time = day.sunrise
    const [hours, minutes] = time.split(":")
    const shortTime = `${hours}:${minutes}`
    popupSunrise.textContent = shortTime

    const timeTwo = day.sunset
    const [hoursTwo, minutesTwo] = timeTwo.split(":")
    const shortTimeTwo = `${hoursTwo}:${minutesTwo}`
    popupSunset.textContent = shortTimeTwo

    popupVisibility.textContent = day.visibility + 'km'
    popupPressure.textContent = day.pressure + 'hPa'
}

function exportWeatherDataForReport() {
    if (!daysData || daysData.length === 0) {
        return;
    }
    
    const reportData = daysData.map(day => ({
        City: currentCity || 'Unknown',
        Country: currentAddress ? currentAddress.split(',').pop().trim() : 'Unknown',
        Date: day.datetime,
        MaxTemp: Math.round(day.tempmax),
        MinTemp: Math.round(day.tempmin),
        Humidity: day.humidity,
        WindSpeed: Math.round(day.windspeed),
        Conditions: day.conditions,
        Description: day.description,
        Pressure: day.pressure,
        Visibility: day.visibility
    }))
    
    localStorage.setItem('weatherReportData', JSON.stringify(reportData))
}

document.addEventListener('DOMContentLoaded', function() {
    const reportButton = document.querySelector('.report-button')
    if (reportButton) {
        reportButton.addEventListener('click', function() {
            exportWeatherDataForReport()
            window.open('./report.html', '_blank')
        })
    }
})

loadWeather('Mankivka')