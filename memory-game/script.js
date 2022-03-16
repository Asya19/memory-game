console.log(`
Оценка: 70 / 60
1. Вёрстка +10
   реализован интерфейс игры +5
   в футере приложения есть ссылка на гитхаб автора приложения, год создания приложения, логотип курса со ссылкой на курс +5
2. Логика игры. Карточки, по которым кликнул игрок, переворачиваются согласно правилам игры +10
3. Игра завершается, когда открыты все карточки +10
4. По окончанию игры выводится её результат - количество ходов, которые понадобились для завершения игры +10
5. Результаты последних 10 игр сохраняются в local storage. Есть таблица рекордов, в которой сохраняются результаты предыдущих 10 игр +10
6. По клику на карточку – она переворачивается плавно, если пара не совпадает – обе карточки так же плавно переварачиваются рубашкой вверх +10
7. Очень высокое качество оформления приложения и/или дополнительный не предусмотренный в задании функционал, улучшающий качество приложения +10
   высокое качество оформления приложения предполагает собственное оригинальное оформление равное или отличающееся в лучшую сторону по сравнению с демо
_________________________________________________________________________________________________________________________________________________
Дополнительный функционал:
1. Ввод, запись и чтение имени игрока
2. Выбор уровня сложности игры
3. Есть таймер, засекающий продолжительность игры
4. Есть вкладка с правилами
   `);
document.addEventListener('DOMContentLoaded', () => {

    // Current results and all cards fields
    const memoryCards = document.querySelector('.memory-cards'); 
    const currentStep = document.querySelector('.current-step');
    const currentScore = document.querySelector('.current-score'); 

    // Timer fields
    const minEl = document.querySelector('.min');
    const secEl = document.querySelector('.sec');
    const milsecEl = document.querySelector('.milsec');
    
    // Кнопки меню
    const btnRules = document.querySelector('.btn-rules');
    const prevRules = document.querySelector('.prev-rules');
    const wrapRules = document.querySelector('.wrap-rules');
    const btnHeaderRes = document.querySelector('.btn-header-res');
    const btnMain = document.querySelector('.btn-main');
    
    // Menu
    const containerMainMenu = document.querySelector('.container-main-menu');
    const switchLevel = document.querySelector('.switch-level'); 
    const nickname = document.querySelector('.ninja'); 

    const btnPlay = document.querySelector('.btn-play'); 
    const btnRes = document.querySelector('.btn-res'); 
    const btnBack = document.querySelector('.btn-back');

    const helloNameInput = document.querySelector('.hello-name-input'); 
    const helpMessage = document.querySelector('.help-message'); 
    
    const history = document.querySelector('.history'); 
    const mainMenu = document.querySelector('.main-menu'); 
    
    // Results
    const results = document.querySelector('.results'); 
    const bestResults = document.querySelector('.best-results'); 
   
    let firstCard = '', 
        secondCard = '', // для Сравнение карт
        toBlock = false,
        curStep = 0,
        curScore = 0,
        messageStatus = 'start',
        allResults = [],  // для вывода результатов в  таблицу
        allBestResults = [   
            {name: '-', min: '00', sec: '00', score: 0, steps: 0},
            {name: '-', min: '00', sec: '00', score: 0, steps: 0},
            {name: '-', min: '00', sec: '00', score: 0, steps: 0}
        ],
        matchCards = 0,
        nameNinja = '',
        taskLevel = 'genin',
        // variables for timer
        minute = 0,
        second = 0,
        millisecond = 0,
        interval;


        // Перечень героев по уровню сложности заданий
        const heroes = {
            'genin':   ['deidara', 'gaara', 'hinata', 'itachi'],
            'chuunin': ['deidara', 'gaara', 'hinata', 'itachi', 'jiraya', 'kabuto', 'kakashi', 'killer_b'],
            'zenin':   ['deidara', 'gaara', 'hinata', 'itachi', 'jiraya', 'kabuto', 'kakashi', 'killer_b', 'madara', 'naruto'],
            'kage':    ['deidara', 'gaara', 'hinata', 'itachi', 'jiraya', 'kabuto', 'kakashi', 'killer_b', 'madara', 'naruto', 'rocklee', 'sakura', 'saske', 'tsunade', 'kankuro']
        }

        changeStatus('start');
        getLocalStorage();
        writeResultsGame();
        getNameNinja();
        missionActivation();


    // Event Listener

        // Клик по кнопке выбора сложности задания
            switchLevel.addEventListener('click', (e) => {
                    let currentBtn = e.target;
                    Array.from(switchLevel.children).forEach(child => child.classList.remove('_active'));
                    currentBtn.classList.add('_active');
                    taskLevel = currentBtn.dataset.level;
                    // При клике на кнопку выбора сложности задания 
                    // выстраивается поле для выполнения миссии
                    missionActivation();
                //}
            });
        
        // Клик по кнопке начать миссию
            btnPlay.addEventListener('click', function() {
                if (btnPlay.classList.contains('disabled')) return;

                toBlock = true;
                clearFieldForMission(); 
                setTimeout(() => {   // перемешивание карт
                    shuffleCards();
                }, 150);

                btnPlay.classList.add('disabled');

                clearInterval(interval);
                interval = setInterval(startTimer, 10);
                
                changeStatus('mission');
                setTimeout(() => {
                    containerMainMenu.style.opacity = 0;
                    containerMainMenu.style.zIndex = -1;
                    toBlock = false;
                }, 600);
            });

        // Клик по кнопке результатов из главного меню
            btnRes.addEventListener('click', () => {
                history.classList.add('block');
                mainMenu.classList.add('none');
            });

        // Получаем данные из инпута
            helloNameInput.addEventListener('input', (e) => {
                nameNinja = e.target.value;
                getNameNinja();
            });
        
        // Клик по карточке
            memoryCards.addEventListener('click', function(e) {
                if (e.target.classList.contains('one-card') & !e.target.parentNode.classList.contains('open-card')) {
                    rotateCard(e.target.parentNode);
                }
            });

        // Кнопка вернуться назад из результатов
            btnBack.addEventListener('click', () => {
                history.classList.remove('block');
                mainMenu.classList.remove('none');
            });

        // Клик по кнопке с правилами
            btnRules.addEventListener('click', () => {
                wrapRules.classList.toggle('block');
            });

        //Кнопка назад из раздела с правилами
            prevRules.addEventListener('click', () => {
                wrapRules.classList.remove('block');
            }); 
        
        // Клик по кнопке результатов в шапке 
            btnHeaderRes.addEventListener('click', () => {
                history.classList.toggle('block');
                mainMenu.classList.toggle('none');
            });

        // Клин по кнопке Меню в шапке - перезагружает страницу
            btnMain.addEventListener('click', () =>  {
                setTimeout(function() {window.location.reload();}, 200);
            });


    // FUNCTIONS

        // Таймер
            function startTimer() {
                millisecond++;
                if (millisecond > 99) {
                    second++;
                    millisecond = 0;
                }
                // millisecond
                if (second < 10) {
                    secEl.innerHTML = `0${second}`;
                }
                if (second > 9) {
                    secEl.innerHTML = second;
                }
                if (second > 59) {
                    minute++;
                    minEl.innerHTML = `0${second}`;
                    second = 0;
                    secEl.innerHTML = `0${second}`;            
                }
                // millisecond  
                if (minute < 10) {
                    minEl.innerHTML = `0${minute}`;
                }
                if (minute > 9) {
                    minEl.innerHTML = minute;
                }
                    
            }

        // Состояния до начала игры, во время и после - для показания результатов
            function changeStatus(changeMes) {
                messageStatus = changeMes;

                switch (changeMes) {
                    case 'start':
                        helpMessage.innerHTML = `Now everyone can become a Hokage. Press <b>NEW MISSION</b> to start a mission`;
                        break;
                    case 'mission':
                        helpMessage.innerHTML = `${nameNinja || 'ninja'} is playing now`;
                        helloNameInput.setAttribute('disabled', 'disabled');
                        helloNameInput.classList.toggle('main-menu-disabled');
                        break;
                    case 'mission over':
                        helpMessage.innerHTML = `Your score: ${curScore} <br>Your step: ${curStep} <br> Press <b>NEW MISSION</b> to start a mission again!`;
                        helpMessage.classList.add('mes-result');
                        helloNameInput.removeAttribute('disabled');
                        helloNameInput.classList.toggle('main-menu-disabled');
                        break;
                }
            }

        // Вызывается при клике по кнопке выбора сложности задания
        // в зависимости от уровня сложности строится площадка для выполнения миссии
            function missionActivation() {
                memoryCards.innerHTML = '';

                heroes[taskLevel].forEach(hero => {
                    // Создаем набор уникальных карточек и вызываем еще раз для создания пары
                        cardGeneration(hero);
                        cardGeneration(hero); 
                });

                // Переключатель уровня миссии взависимости от уровня ниндзя
                    switch (taskLevel) {
                        case 'genin':
                            memoryCards.style.height = '270px';
                            memoryCards.style.width = '760px';
                            break;
                        case 'chuunin':
                            memoryCards.style.height = '550px';
                            memoryCards.style.width = '800px';
                            break
                        case 'zenin':
                            memoryCards.style.height = '550px';
                            memoryCards.style.width = '1000px';
                            break;
                        case 'kage':
                            memoryCards.style.height = '655px';
                            memoryCards.style.width = '1130px';
                            break;
                    }

            }
        
        // Создание карточки
        // Вызывается из missionActivation() в зависимости от уровня ниндзя
            function cardGeneration(hero) {
                let divCard = `
                <div class="card" data-hero="${hero}" style="order: ${Math.round(Math.random() * heroes[taskLevel].length)};">
                    <img src="assets/img/card/${hero}.jpg" alt="${hero}" class="front-face one-card" style="display: none;">
                    <img src="assets/img/card/naruto-badge.jpg" alt="${hero}" class="back-face one-card">
                </div>`;
                // Вставляем блок после последнего потомка
                memoryCards.insertAdjacentHTML('beforeend', divCard);
            }

        // Показать имя ниндзя для приветствия и в строке ввода
            function getNameNinja() {
                nickname.innerHTML = nameNinja || 'ninja';
            }

        // Очищения поля для миссии. Обнуление значений
            function clearFieldForMission() {
                toBlock = true;

                // прячем карту рубашкой вверх
                Array.from(memoryCards.children).forEach(card => { hideCard(card); });

                // Обнуление значений
                firstCard = '', 
                secondCard = '', 
                toBlock = false, 
                matchCards = 0,
                curStep = 0,
                curScore = 0,
                countMissions = 0,
                minute = '0',
                second = '0',
                millisecond = '00',
                currentStep.innerHTML = curStep;
                currentScore.innerHTML = curScore;             
            }

        // Перемешивание карт с помощью присвоения рандомного значения свойству order
            function shuffleCards() {
                Array.from(memoryCards.children).forEach(item => {
                    item.style.order = Math.round(Math.random() * heroes[taskLevel].length)
                });
            }

        // Переворачивание карты
            function rotateCard(card) {
                if (toBlock || messageStatus !== 'mission') return;

                const frontFace = card.querySelector('.front-face'),
                      backFace = card.querySelector('.back-face');

                card.classList.add('open-card');
                frontFace.style.display = 'block';

                setTimeout(() => {
                    backFace.style.display = 'none';
                }, 200);

                if (!firstCard) {
                    firstCard = card;
                } else {
                    secondCard = card;
                    toBlock = true;
                }

                if (firstCard && secondCard) {
                    curStep++;
                    currentStep.innerHTML = curStep;
                    checkForMatch();
                }
            }

        // Прячем карту рубашкой вверх
            function hideCard(card) {
                card.classList.remove('open-card');
                card.querySelector('.back-face').style.display = 'block';

                setTimeout(() => { card.querySelector('.front-face').style.display = 'none'; }, 200);
            }

        // Запись рекордов и всех игр 
            function writeResultsGame() {
                results.innerHTML = '';
            
                if (!allResults.length) results.innerHTML = 'No completed missions';
                else allResults.forEach((res) => { results.insertAdjacentHTML('beforeend', createResult(res)); });

                bestResults.innerHTML = '';
                allBestResults.forEach((res) => { bestResults.insertAdjacentHTML('beforeend', createResult(res)); });
            }

        // Создание блока с записанными результатами
            function createResult(res) {
                const divRes = `
                    <div class="history-result-elem">
                        <div class="history_name-ninja">${res.name}</div>
                        <div class="time">
                            <div class="history_min">${res.min}</div>
                            <span>:</span>
                            <div class="history_sec">${res.sec}</div>
                        </div>
                        <div class="history_score">${res.score}</div>
                        <div class="history_step">${res.steps}</div>
                    </div>`
                return divRes;
            }

        // Сравнение карт
            function checkForMatch() { 

                if (firstCard.dataset.hero === secondCard.dataset.hero) {
                    matchCards += 2;
                    curScore += 3;
                    currentScore.innerHTML = curScore;
                    firstCard = '';
                    secondCard = '';

                    setTimeout(() => toBlock = false, 600);
                }
                else {
                    setTimeout(() => {
                        hideCard(firstCard);
                        hideCard(secondCard);

                        // Проверка, чтобы результат не уходил в минус
                        curScore = curScore - 1 <= 0 ? 0 : curScore -1;

                        currentScore.innerHTML = curScore;
                        firstCard = '';
                        secondCard = '';
                        toBlock = false;
                    }, 600);
                }

                if (matchCards === heroes[taskLevel].length * 2) {

                    changeStatus('mission over');
                    btnPlay.classList.remove('disabled');

                    containerMainMenu.style.zIndex = 16;

                    setTimeout(() => {
                        containerMainMenu.style.opacity = 1;
                    }, 1500);

                    // Если было пройдено 10 миссий - удалить последний элемент (первую игру)
                    if (allResults.length === 10) allResults.pop();

                    // Метод unshift() добавляет один или более элементов в начало массива 
                    // и возвращает новую длину массива.
                    allResults.unshift({name: nameNinja || 'ninja', min: minute, sec: second, score: curScore, steps: curStep})

                    if (allBestResults[2].score < curScore) {
                        allBestResults.pop();
                        allBestResults.unshift({name: nameNinja || 'ninja', min: minute, sec: second, score: curScore, steps: curStep})
                        allBestResults = allBestResults.sort((a, b) => b.curScore - a.curScore);
                    }

                    writeResultsGame();
                    setLocalStorage('allResults', allResults);
                    setLocalStorage('allBestResults', allBestResults);
                }
            } 


        // localStorage
            // setLocalStorage
                function setLocalStorage(key, value) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            // getLocalStorage
                function getLocalStorage() {
                    
                    if (localStorage.getItem('allResults')) allResults = JSON.parse(localStorage.getItem('allResults'));
                    if (localStorage.getItem('allBestResults')) allBestResults = JSON.parse(localStorage.getItem('allBestResults'));
                }  

});