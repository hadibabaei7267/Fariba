const $ = (selector) => document.querySelector(selector);

const screens = {
    intro: $("#intro"),
    quiz: $("#quiz"),
    book: $("#bookScreen"),
    challenge: $("#challengeScreen"),
    finale: $("#finale")
};

const bg = $("#bg");
const voice = $("#voiceAudio");

const photos = Array.from(
    { length: 30 },
    (_, i) => `assets/photos/${String(i + 1).padStart(2, "0")}.jpg`
);


/* ========================================= */
/* STATE */
/* ========================================= */

let quizIndex = 0;

let currentSpread = 0;

let bookStarted = false;

let musicStarted = false;

let musicFinished = false;

let autoFlipTimer = null;

let isFlipping = false;

let challengeUnlocked = false;

let challengeSolved = false;

let finaleStarted = false;


/*
    هر Spread شامل دو عکس است.

    spread 0 = عکس 01 و 02
    spread 1 = عکس 03 و 04
    ...
    spread 14 = عکس 29 و 30
*/

const totalSpreads = 15;


/* ========================================= */
/* CHAPTERS */
/* ========================================= */

const chapters = [
    "فصل ۱ · خودِ فریبا",
    "فصل ۲ · بدون فیلتر",
    "فصل ۳ · Main Character",
    "فصل ۴ · پرونده محرمانه",
    "فصل ۵ · Special Edition"
];


/* ========================================= */
/* CAPTIONS */
/* ========================================= */

const captions = [
    "یک قاب برای ثبت یک لبخند خوب.",
    "مدرک محرمانه: حضور یک آدم دوست‌داشتنی تأیید شد.",
    "این عکس رسماً ارزش آرشیو شدن دارد.",
    "شواهد نشان می‌دهد سوژه حال خوبی داشته.",
    "پرونده هنوز ادامه دارد...",
    "بعضی عکس‌ها فقط عکس نیستند؛ یک حال خوب‌اند."
];


/* ========================================= */
/* QUIZ */
/* ========================================= */

const questions = [

    [
        "کدام گزینه بیشتر شبیه یک سورپرایز خوب برای فریباست؟",
        [
            "یک تبریک ساده",
            "یک پرونده محرمانه با ۳۰ عکس ✨",
            "یک جلسه کاری 😂",
            "هیچ‌کدام"
        ],
        1
    ],

    [
        "کدام ویژگی این پرونده جذاب‌تر است؟",
        [
            "هیجان و بازی",
            "گزارش اداری",
            "فایل اکسل",
            "هیچ‌کدام"
        ],
        0
    ],

    [
        "رمز ورود به آرشیو چیست؟",
        [
            "FRIEND",
            "FARIBA",
            "BIRTHDAY",
            "BESTDAY"
        ],
        1
    ]

];


/* ========================================= */
/* SCREEN SWITCH */
/* ========================================= */

function showScreen(name) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[name].classList.add("active");
}


/* ========================================= */
/* MUSIC */
/* ========================================= */

function startMusic() {

    if (musicStarted) {
        return;
    }

    musicStarted = true;

    bg.loop = false;

    bg.currentTime = 0;

    bg.play().catch(() => {});

    startMusicVisuals();
}


/*
    وقتی موزیک تمام شود:
    فقط یک بار اتفاق می‌افتد.
*/

bg.addEventListener("ended", () => {

    musicFinished = true;

    stopMusicVisuals();

    if (currentSpread >= totalSpreads - 1) {
        finishBook();
    }

});


/* ========================================= */
/* MUSIC VISUALS */
/* ========================================= */

let visualTimer = null;

function startMusicVisuals() {

    document.body.classList.add("musicActive");

    if (visualTimer) {
        clearInterval(visualTimer);
    }

    visualTimer = setInterval(() => {

        createSticker();

    }, 900);

}


function stopMusicVisuals() {

    document.body.classList.remove("musicActive");

    if (visualTimer) {
        clearInterval(visualTimer);

        visualTimer = null;
    }

}


/* ========================================= */
/* HAPPY STICKERS */
/* ========================================= */

const stickerList = [
    "🎈",
    "🎂",
    "🎉",
    "✨",
    "💛",
    "💜",
    "🎁",
    "🌸",
    "⭐️",
    "🥳",
    "💫",
    "🎊"
];

function createSticker() {

    const container = $("#stickers");const sticker = document.createElement("div");

    sticker.className = "sticker";

    sticker.textContent =
        stickerList[
            Math.floor(
                Math.random() * stickerList.length
            )
        ];

    sticker.style.left =
        Math.random() * 100 + "%";

    sticker.style.fontSize =
        18 + Math.random() * 25 + "px";

    sticker.style.animationDuration =
        5 + Math.random() * 5 + "s";

    container.appendChild(sticker);

    setTimeout(() => {
        sticker.remove();
    }, 11000);
}


/* ========================================= */
/* QUIZ */
/* ========================================= */

function renderQuiz() {

    const question = questions[quizIndex];

    const title = question[0];

    const answers = question[1];

    const correct = question[2];

    $("#quizbox").innerHTML = `

        <div class="qcard">

            <b>${title}</b>

            <div class="answers">

                ${answers.map((answer, index) => `
                    <button
                        class="answer"
                        data-index="${index}"
                    >
                        ${answer}
                    </button>
                
`).join("")}

            </div>

        </div>
    
`;

    $("#bar").style.width =
        `${(quizIndex / questions.length) * 100}%`;


    document
        .querySelectorAll(".answer")
        .forEach(button => {

            button.addEventListener("click", () => {

                const selected =
                    Number(button.dataset.index);

                if (selected !== correct) {

                    button.classList.add("wrong");

                    $("#hint").textContent =
                        "❌ اشتباهه... دوباره فکر کن 😏";

                    setTimeout(() => {
                        button.classList.remove("wrong");
                    }, 500);

                    return;
                }


                button.classList.add("correct");

                $("#hint").textContent =
                    "🔓 درست بود! پرونده در حال باز شدن است...";


                quizIndex++;


                setTimeout(() => {

                    if (quizIndex < questions.length) {

                        renderQuiz();

                    } else {

                        openBook();

                    }

                }, 650);

            });

        });

}


/* ========================================= */
/* OPEN BOOK */
/* ========================================= */

function openBook() {

    showScreen("book");

    startMusic();

    bookStarted = true;

    setTimeout(() => {

        $("#cover").classList.add("open");

        renderSpread();

        startAutoFlip();

    }, 500);

}


/* ========================================= */
/* PAGE CREATION */
/* ========================================= */

function createPage(index) {

    if (index < 0 || index >= photos.length) {
        return "";
    }

    const chapter =
        chapters[Math.floor(index / 6)];

    const caption =
        captions[index % captions.length];

    return `

        <div class="pageContent">

            <img
                src="${photos[index]}"
                alt="Fariba ${index + 1}"
                loading="eager"
                onerror="this.style.opacity='.25'"
            >

            <h3>
                ${chapter}
            </h3>

            <p>
                ${caption}
            </p>

            <span class="pageNumber">
                ${index + 1}
            </span>

        </div>
    
`;
}


/* ========================================= */
/* RENDER CURRENT SPREAD */
/* ========================================= */

function renderSpread() {

    const leftIndex =
        currentSpread * 2;

    const rightIndex =
        leftIndex + 1;


    $("#leftContent").innerHTML =
        createPage(leftIndex);

    $("#rightContent").innerHTML =
        createPage(rightIndex);


    $("#counter").textContent =
       ` صفحات ${leftIndex + 1}–${Math.min(rightIndex + 1, 30)} از 30`;$("#chapter").textContent =
        chapters[
            Math.min(
                Math.floor(leftIndex / 6),
                chapters.length - 1
            )
        ];

}


/* ========================================= */
/* REAL PAGE FLIP */
/* ========================================= */

function flipForward() {

    if (isFlipping) {
        return;
    }

    if (challengeUnlocked && !challengeSolved) {
        return;
    }

    if (currentSpread >= totalSpreads - 1) {

        finishBook();

        return;
    }


    isFlipping = true;


    const nextSpread =
        currentSpread + 1;


    const flipPage =
        $("#flipPage");


    const front =
        flipPage.querySelector(".flipFront");

    const back =
        flipPage.querySelector(".flipBack");


    /*
        صفحه سمت راست فعلی
    */

    front.querySelector(".flipContent").innerHTML =
        createPage(
            currentSpread * 2 + 1
        );


    /*
        پشت صفحه:
        صفحه چپ Spread بعدی
    */

    back.querySelector(".flipContent").innerHTML =
        createPage(
            nextSpread * 2
        );


    flipPage.classList.add("active");


    /*
        اجازه می‌دهیم مرورگر حالت اولیه را ثبت کند
    */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            flipPage.classList.add("flipping");

        });

    });


    setTimeout(() => {

        currentSpread = nextSpread;

        flipPage.classList.remove("flipping");

        flipPage.classList.remove("active");

        renderSpread();

        isFlipping = false;


        checkChapterChallenge();

        if (
            currentSpread >= totalSpreads - 1 &&
            musicFinished
        ) {
            finishBook();
        }

    }, 1300);

}


/* ========================================= */
/* BACKWARD FLIP */
/* ========================================= */

function flipBackward() {

    if (isFlipping) {
        return;
    }

    if (currentSpread <= 0) {
        return;
    }

    if (challengeUnlocked && !challengeSolved) {
        return;
    }


    isFlipping = true;


    /*
        برای برگشت، Spread قبلی را
        مستقیماً نمایش می‌دهیم و
        یک انیمیشن معکوس ایجاد می‌کنیم.
    */

    const previousSpread =
        currentSpread - 1;


    const flipPage =
        $("#flipPage");


    const front =
        flipPage.querySelector(".flipFront");

    const back =
        flipPage.querySelector(".flipBack");


    front.querySelector(".flipContent").innerHTML =
        createPage(
            previousSpread * 2
        );


    back.querySelector(".flipContent").innerHTML =
        createPage(
            currentSpread * 2 - 1
        );


    flipPage.style.transform =
        "rotateY(-180deg)";

    flipPage.classList.add("active");


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            flipPage.style.transform =
                "rotateY(0deg)";

        });

    });


    setTimeout(() => {

        currentSpread = previousSpread;

        flipPage.classList.remove("active");

        flipPage.style.transform = "";

        renderSpread();

        isFlipping = false;

    }, 1300);

}


/* ========================================= */
/* AUTO FLIP */
/* ========================================= */

function startAutoFlip() {

    stopAutoFlip();

    autoFlipTimer = setInterval(() => {

        if (!bookStarted) {
            return;
        }

        if (isFlipping) {
            return;
        }

        if (challengeUnlocked && !challengeSolved) {
            return;
        }

        if (currentSpread >= totalSpreads - 1) {

            stopAutoFlip();

            if (musicFinished) {
                finishBook();
            }

            return;
        }

        flipForward();

    }, 6500);

}


function stopAutoFlip() {

    if (autoFlipTimer) {

        clearInterval(autoFlipTimer);

        autoFlipTimer = null;

    }

}


/* ========================================= */
/* CHAPTER CHALLENGE */
/* ========================================= *//*
    بعد از صفحات:
    6
    12
    18
    24

    چالش باز می‌شود.
*/

function checkChapterChallenge() {

    const photoNumber =
        currentSpread * 2 + 2;


    const shouldChallenge =
        [6, 12, 18, 24].includes(photoNumber);


    if (
        shouldChallenge &&
        !challengeSolved
    ) {

        challengeUnlocked = true;

        stopAutoFlip();

        setTimeout(() => {

            openChallenge();

        }, 500);

    }

}


/* ========================================= */
/* OPEN CHALLENGE */
/* ========================================= */

function openChallenge() {

    showScreen("challenge");

    const ids = [
        2,
        9,
        16
    ];

    ids.sort(() => Math.random() - .5);


    $("#choices").innerHTML =
        ids.map((id, index) => {

            const isCorrect =
                index === 0;

            return `

                <button
                    class="choice"
                    data-correct="${isCorrect}"
                >

                    <img
                        src="${photos[id]}"
                        alt="مدرک ${index + 1}"
                    >

                    <div>
                        مدرک ${index + 1}
                    </div>

                </button>
            
`;

        }).join("");


    $("#result").textContent = "";


    document
        .querySelectorAll(".choice")
        .forEach(choice => {

            choice.addEventListener(
                "click",
                () => {

                    if (
                        choice.dataset.correct === "true"
                    ) {

                        challengeSolved = true;

                        challengeUnlocked = false;

                        $("#result").textContent =
                            "🔓 درست بود! قفل باز شد...";


                        setTimeout(() => {

                            showScreen("book");

                            renderSpread();

                            startAutoFlip();

                        }, 1000);

                    } else {

                        $("#result").textContent =
                            "❌ اشتباهه! دوباره نگاه کن 😏";

                    }

                }
            );

        });

}


/* ========================================= */
/* SECRET EVIDENCE */
/* ========================================= */

$("#secret").addEventListener(
    "click",
    () => {

        const notes = [

            "مدرک محرمانه: احتمال لبخند زدن هنگام دیدن این صفحه بسیار بالاست. 😄",

            "هشدار سیستم: میزان دوست‌داشتنی بودن سوژه از حد مجاز عبور کرده است. ✨",

            "گزارش نهایی: این پرونده فقط برای فریبا ساخته شده.",

            "پرونده تأیید می‌کند: امسال باید سال خیلی خوبی برای فریبا باشد. 🎂",

            "سیستم اعلام کرد: این میزان انرژی مثبت نیازمند ثبت رسمی است. 😎"

        ];


        $("#note").textContent =
            notes[
                Math.floor(
                    Math.random() * notes.length
                )
            ];


        $("#note").classList.add("show");


        setTimeout(() => {

            $("#note").classList.remove("show");

        }, 3500);

    }
);


/* ========================================= */
/* MANUAL CHALLENGE BUTTON */
/* ========================================= */

$("#challenge").addEventListener(
    "click",
    () => {

        openChallenge();

    }
);


/* ========================================= */
/* NAVIGATION */
/* ========================================= */

$("#next").addEventListener(
    "click",
    () => {

        flipForward();

    }
);


$("#prev").addEventListener(
    "click",
    () => {

        flipBackward();

    }
);


/* ========================================= */
/* MUSIC BUTTON */
/* ========================================= */

$("#music").addEventListener(
    "click",
    () => {

        if (bg.paused) {

            bg.play().catch(() => {});

        } else {

            bg.pause();

        }

    }
);/* ========================================= */
/* START BUTTON */
/* ========================================= */

$("#start").addEventListener(
    "click",
    () => {

        startMusic();

        showScreen("quiz");

        renderQuiz();

    }
);


/* ========================================= */
/* TOUCH / SWIPE */
/* ========================================= */

let touchStartX = 0;

$("#bookScreen").addEventListener(
    "touchstart",
    event => {

        touchStartX =
            event.changedTouches[0].screenX;

    },
    { passive: true }
);


$("#bookScreen").addEventListener(
    "touchend",
    event => {

        const touchEndX =
            event.changedTouches[0].screenX;

        const distance =
            touchEndX - touchStartX;


        if (Math.abs(distance) < 45) {
            return;
        }


        if (distance < 0) {

            flipForward();

        } else {

            flipBackward();

        }

    },
    { passive: true }
);


/* ========================================= */
/* FINISH BOOK */
/* ========================================= */

function finishBook() {

    if (finaleStarted) {
        return;
    }

    finaleStarted = true;

    stopAutoFlip();

    stopMusicVisuals();


    /*
        اول جلد را می‌بندیم
    */

    $("#cover").classList.remove("open");


    setTimeout(() => {

        showScreen("finale");

        prepareFinale();

    }, 1500);

}


/* ========================================= */
/* FINALE PREPARE */
/* ========================================= */

function prepareFinale() {

    $("#surpriseBox").classList.remove("hide");

    $("#finalReveal").classList.remove("show");

    $("#birthday").classList.remove("show");


    $("#poem").textContent = `

بعضی آدم‌ها قرار نیست حتماً سال‌ها کنارت باشن؛
بعضی‌ها فقط با حضورشون، روزهای معمولی رو کمی قشنگ‌تر می‌کنن.

فریبا...

این چند صفحه فقط یه بهونه بود
که بگم بودنت و انرژی خوبی که با خودت میاری، ارزشمنده.

امیدوارم سال جدید زندگیت
پر از خنده، اتفاق‌های خوب
و چیزهایی باشه که واقعاً دلت می‌خواد.

تولدت مبارک فریبا...

قشنگ‌ترین فصل‌ها هنوز نوشته نشده‌اند. ❤️
`;

}


/* ========================================= */
/* FINAL SURPRISE */
/* ========================================= */

$("#revealBtn").addEventListener(
    "click",
    () => {

        $("#surpriseBox").classList.add("hide");


        setTimeout(() => {

            $("#finalReveal").classList.add("show");

        }, 800);

    }
);


/* ========================================= */
/* VOICE */
/* ========================================= */

$("#voiceBtn").addEventListener(
    "click",
    () => {

        voice.currentTime = 0;

        voice.play().catch(() => {});

    }
);


/* ========================================= */
/* VOICE END */
/* ========================================= */

voice.addEventListener(
    "ended",
    () => {

        createExplosion();

        setTimeout(() => {

            $("#birthday").classList.add("show");

        }, 900);

    }
);


/* ========================================= */
/* EXPLOSION */
/* ========================================= */

function createExplosion() {

    const container =
        $("#confetti");

    const pieces = 140;


    for (let i = 0; i < pieces; i++) {

        const piece =
            document.createElement("div");


        piece.className =
            "confettiPiece";


        piece.style.left =
            Math.random() * 100 + "%";


        piece.style.background =
            [
                "#f5d46f",
                "#b47cff",
                "#ff77a8",
                "#72dfff",
                "#ffffff"
            ][
                Math.floor(
                    Math.random() * 5
                )
            ];


        piece.style.width =
            5 + Math.random() * 8 + "px";


        piece.style.height =
            8 + Math.random() * 15 + "px";


        piece.style.animationDelay =
            Math.random() * .7 + "s";


        piece.style.animationDuration =
            2 + Math.random() * 2 + "s";container.appendChild(piece);


        setTimeout(() => {

            piece.remove();

        }, 4500);

    }

}


/* ========================================= */
/* KEYBOARD */
/* ========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (!screens.book.classList.contains("active")) {
            return;
        }

        if (event.key === "ArrowRight") {
            flipForward();
        }

        if (event.key === "ArrowLeft") {
            flipBackward();
        }

    }
);