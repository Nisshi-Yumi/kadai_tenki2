// OpenWeatherAPIの設定
const apiKey = ''; // OpenWeatherAPIのAPIキーをここに入れてください
// 都市の緯度と経度
const locations = {
    tokyo: { lat: 35.682839, lon: 139.759455 },
    osaka: { lat: 34.6937, lon: 135.5023 },
    sapporo: { lat: 43.0621, lon: 141.3544 }
};

// コーディネート提案の条件を直接JS内で設定
const suggestionsData = [
    { tempMin: 15, tempMax: 19, rain: false, suggestion: '長袖シャツがおススメ。朝晩用に羽織る物も持って。', img: '09.png' },
    { tempMin: 16, tempMax: 20, rain: false, suggestion: '秋を感じる爽やかな一日。風も弱いから、やわらかい素材のスカートで初秋コーデを楽しもう',  img: '08.png' },
    { tempMin: 21, tempMax: 25, rain: false, suggestion: '日中はまだ暑いけど朝晩は少し秋の気配が見え隠れ。秋色を意識しつつ、半そでで風通しが良いリネン素材がおススメ。',  img: '04.png' },
    { tempMin: 26, tempMax: 30, rain: false, suggestion: '雨が降るので黒のパンツスタイルがおススメ。気温も高いので、熱がこもらないようにトップスは白など明るい色で。',  img: '02.png' },
    { tempMin: 10, tempMax: 15, rain: true, suggestion: '雨が降るので、黒や茶色などの濃い目のボトムで。トップスは長袖で朝晩用に羽織る物も！',  img: '09.png' },
    { tempMin: 16, tempMax: 20, rain: true, suggestion: '雨具とカーディガンを忘れずに', img: '09.png'},
    { tempMin: 21, tempMax: 25, rain: true, suggestion: '雨が降っているのでシャツとレインジャケットがおすすめです', img: 'shirt_umbrella.jpg' },
    { tempMin: 26, tempMax: 35, rain: true, suggestion: 'とにかく暑い一日。風も弱く、熱がこもりやすくなるので、綿素材やリネンのフレンチスリーブかノースリーブで。夏も終わりに近づいているので、お気に入りの夏服を着ておこう。', img: '01.png' },];


// ボタンイベント
document.getElementById('tokyo').addEventListener('click', () => fetchWeather('tokyo'));
document.getElementById('osaka').addEventListener('click', () => fetchWeather('osaka'));
document.getElementById('sapporo').addEventListener('click', () => fetchWeather('sapporo'));

// 矢印で日付を切り替える
document.getElementById('prevDay').addEventListener('click', () => changeDay(-1));
document.getElementById('nextDay').addEventListener('click', () => changeDay(1));

// 現在表示している日付のインデックスを保持
let currentDayIndex = 0;
let dailyForecasts = [];

// 曜日を取得するための配列
const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

// 天気データを取得して提案の条件と照合
function fetchWeather(city) {
    const { lat, lon } = locations[city];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`;

    // OpenWeatherAPIから天気データを取得
    fetch(weatherUrl)
        .then(response => response.json())
        .then(weatherData => {
            dailyForecasts = weatherData.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));
            document.getElementById('weatherContainer').classList.remove('hidden'); // 天気コンテンツを表示
            displayWeatherAndSuggestion(currentDayIndex); // 初期表示
        })
        .catch(error => console.error('Error fetching data:', error));
}

// 日付を切り替えて表示
function changeDay(direction) {
    currentDayIndex += direction;
    if (currentDayIndex < 0) currentDayIndex = 0;
    if (currentDayIndex >= dailyForecasts.length) currentDayIndex = dailyForecasts.length - 1;
    displayWeatherAndSuggestion(currentDayIndex);
}

// 天気データと提案の表示
function displayWeatherAndSuggestion(dayIndex) {
    const weatherResult = document.getElementById('weatherResult');
    const suggestionDiv = document.getElementById('suggestion');
    const forecast = dailyForecasts[dayIndex];

    const dateObj = new Date(forecast.dt_txt);
    const date = dateObj.toLocaleDateString('ja-JP'); // 日付形式
    const dayOfWeek = daysOfWeek[dateObj.getDay()]; // 曜日を取得
    const tempMin = Math.round(forecast.main.temp_min); // 小数点以下を四捨五入
    const tempMax = Math.round(forecast.main.temp_max); // 小数点以下を四捨五入
    const humidity = forecast.main.humidity; // 湿度
    const windSpeed = Math.round(forecast.wind.speed); // 小数点以下を四捨五入
    const weatherDescription = forecast.weather[0].description;

    // OpenWeatherからの雨のデータを確認し、雨があるかを判定
    const rain = forecast.weather[0].main === 'Rain' || forecast.rain ? true : false;

    
        // 天気に対応する画像を「晴」「曇」「雨」の3つに分類
        let weatherImage = '';
        if (weatherDescription.includes('晴')) {
            weatherImage = '晴.png';
        } else if (weatherDescription.includes('雲') || weatherDescription.includes('曇りがち') || weatherDescription.includes('厚い雲') || weatherDescription.includes('薄い雲')) {
            weatherImage = '雲.png';
        } else if (weatherDescription.includes('雨')) {
            weatherImage = '雨.png';
        } else {
            weatherImage = 'default.png'; // どれにも当てはまらない場合はデフォルト画像
        }

    // 天気データの表示
    weatherResult.innerHTML = `
        <div>
            <h3>${date} (${dayOfWeek})</h3>
            <p>天気: ${weatherDescription}</p>
            <img src="img/${weatherImage}" alt="${weatherDescription}" class="weather-icon" />
            <p>最高気温: ${tempMax} °C, 最低気温: ${tempMin} °C</p>
            <p>湿度: ${humidity}%, 風速: ${windSpeed} m/s</p>
        </div>
    `;

    // 提案をフィルタリングして表示
    const suggestion = suggestionsData.find(entry =>
        tempMax >= entry.tempMin && tempMax <= entry.tempMax &&
        entry.rain === rain
    );

    if (suggestion) {
        suggestionDiv.innerHTML = `
            <div>
                <p>${suggestion.suggestion}</p>
                <img src="img/${suggestion.img}" alt="コーディネート画像" />
            </div>
        `;
    } else {
        suggestionDiv.innerHTML = `<p>条件に合致する提案が見つかりません。</p>`;
    }
}