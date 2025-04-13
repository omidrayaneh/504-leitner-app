// وضعیت اولیه برنامه
const state = {
    currentWordIndex: 0,
    currentBox: 'all',
    words: [...vocabulary504],
    boxes: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        learned: []
    }
};

// المان‌های DOM
const flashcard = document.getElementById('flashcard')
const wordText = document.getElementById('word-text')
const pronunciation = document.getElementById('pronunciation')
const meaning = document.getElementById('meaning')
const example = document.getElementById('example')
const boxSelect = document.getElementById('box-select')
const progressBar = document.getElementById('progress-bar')

// اضافه کردن دکمه پخش صدا به HTML
const speakButton = document.createElement('button')
speakButton.innerHTML = '🔊'
speakButton.className = 'speak-btn'
document.querySelector('.flashcard-front').appendChild(speakButton)

// اضافه کردن استایل دکمه
const style = document.createElement('style')
style.textContent = `
    .speak-btn {
        background: var(--primary-color)
        color: white
        border: none
        border-radius: 50%
        width: 40px
        height: 40px
        font-size: 20px
        cursor: pointer
        margin-top: 10px
        transition: transform 0.2s
    }
    .speak-btn:hover {
        transform: scale(1.1)
    }
`
document.head.appendChild(style)

// جلوگیری از انتشار رویداد کلیک به کارت
speakButton.addEventListener('click', (event) => {
    event.stopPropagation(); // این خط مهم است
    const word = state.words[state.currentWordIndex].word
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    speechSynthesis.speak(utterance)
})

// نمایش لغت فعلی
function showCurrentWord() {
    if (state.words.length === 0) return
    
    const currentWord = state.words[state.currentWordIndex]
    wordText.textContent = currentWord.word
    pronunciation.textContent = currentWord.pronunciation
    meaning.textContent = currentWord.meaning
    example.textContent = currentWord.example
    
    // بروزرسانی progress bar
    const progress = ((state.currentWordIndex + 1) / state.words.length) * 100
    progressBar.style.width = `${progress}%`
}

// چرخاندن کارت
flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped')
})

// رفتن به لغت بعدی
document.getElementById('next-btn').addEventListener('click', () => {
    if (state.currentWordIndex < state.words.length - 1) {
        state.currentWordIndex++
        showCurrentWord()
        flashcard.classList.remove('flipped')
    }
})

// رفتن به لغت قبلی
document.getElementById('prev-btn').addEventListener('click', () => {
    if (state.currentWordIndex > 0) {
        state.currentWordIndex--
        showCurrentWord()
        flashcard.classList.remove('flipped')
    }
})

// محاسبه تعداد کل لغات
const totalVocabulary = vocabulary504.length;
// const totalHardWords = hardWords ? hardWords.length : 0;
const totalWords = totalVocabulary;

// آپدیت آمار
function updateStats() {
    // بروزرسانی تعداد لغات در هر جعبه
    for (let i = 1; i <= 5; i++) {
        const boxCount = state.boxes[i].length;
        document.getElementById(`box${i}-count`).textContent = boxCount;
    }
    
    // بروزرسانی تعداد لغات یادگرفته شده
    const learnedCount = state.boxes.learned.length;
    document.getElementById('learned-count').textContent = learnedCount;
}

// یافتن جعبه فعلی یک لغت
function getCurrentBox(wordId) {
    for (let box in state.boxes) {
        if (state.boxes[box].includes(wordId)) {
            return parseInt(box) || box;
        }
    }
    return 1;
}

// تغییر جعبه نمایش
boxSelect.addEventListener('change', (e) => {
    state.currentBox = e.target.value
    filterWords()
})

// فیلتر کردن لغات بر اساس جعبه انتخاب شده
function filterWords() {
    if (state.currentBox === 'all') {
        state.words = [...vocabulary504]
    } else {
        state.words = vocabulary504.filter(word => 
            state.boxes[state.currentBox].includes(word.id)
        )
    }
    state.currentWordIndex = 0
    showCurrentWord()
}

// شروع مجدد
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید از اول شروع کنید؟')) {
        // پاک کردن همه جعبه‌ها
        state.boxes = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            learned: []
        };
        // برگرداندن همه لغات به جعبه 1
        state.boxes[1] = vocabulary504.map(word => word.id);
        state.currentWordIndex = 0;
        state.currentBox = 'all';
        boxSelect.value = 'all';
        state.words = [...vocabulary504];
        
        // ذخیره در localStorage
        localStorage.setItem('leitnerState', JSON.stringify(state));
        
        // بروزرسانی نمایش
        updateStats();
        showCurrentWord();
    }
})

function saveState() {
    localStorage.setItem('leitnerState', JSON.stringify({
        boxes: state.boxes,
        currentWordIndex: state.currentWordIndex,
        currentBox: state.currentBox,
        lastStudyDate: new Date().toISOString()
    }));
}

function loadState() {
    const savedState = localStorage.getItem('leitnerState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state.boxes = parsed.boxes;
        state.currentWordIndex = parsed.currentWordIndex;
        state.currentBox = parsed.currentBox;
        updateStats();
    } else {
        initialize();
    }
}

// انتقال لغت به جعبه جدید
function moveToBox(wordId, targetBox) {
    // حذف از جعبه فعلی
    Object.keys(state.boxes).forEach(box => {
        state.boxes[box] = state.boxes[box].filter(id => id !== wordId);
    });

    // اضافه به جعبه جدید
    state.boxes[targetBox].push(wordId);

    // ذخیره تغییرات
    saveState();
    
    // بروزرسانی آمار
    updateStats();
}

// مدیریت دکمه‌های سختی
function handleDifficulty(difficulty) {
    const currentWord = state.words[state.currentWordIndex];
    const currentBox = getCurrentBox(currentWord.id);
    
    switch(difficulty) {
        case 'hard':
            moveToBox(currentWord.id, 1);
            break;
        case 'medium':
            if (currentBox < 5) {
                moveToBox(currentWord.id, currentBox + 1);
            }
            break;
        case 'easy':
            moveToBox(currentWord.id, 'learned');
            break;
    }

    // نمایش لغت بعدی
    if (state.currentWordIndex < state.words.length - 1) {
        state.currentWordIndex++;
        showCurrentWord();
    }
}

// نمایش نوتیفیکیشن
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }, 100);
}

// اتصال دکمه‌ها به توابع
document.getElementById('hard-btn').addEventListener('click', () => handleDifficulty('hard'));
document.getElementById('medium-btn').addEventListener('click', () => handleDifficulty('medium'));
document.getElementById('easy-btn').addEventListener('click', () => handleDifficulty('easy'));

// راه‌اندازی اولیه برنامه
function initialize() {
    state.boxes[1] = state.words.map(word => word.id);
    updateStats();
    showCurrentWord();
}

initialize();