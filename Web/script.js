let currentIndex = 0;
let userScores = { 'O': 0, 'C': 0, 'E': 0, 'A': 0, 'N': 0 };
let selectedUniverseData = [];
let activeQuestions = [];
let userAnswers = [];
let timerInterval;
let secondsElapsed = 0;

function batDau() {
    let selectedName = document.getElementById("universeSelect").value;
    selectedUniverseData = universes[selectedName];

    let inputNum = parseInt(document.getElementById("numQuestions").value);
    if (isNaN(inputNum) || inputNum < 1) inputNum = 10;
    if (inputNum > questionBank.length) inputNum = questionBank.length;

    let shuffledBank = [...questionBank].sort(() => 0.5 - Math.random());
    activeQuestions = shuffledBank.slice(0, inputNum);

    userAnswers = new Array(activeQuestions.length).fill(null);

    document.getElementById("setup-section").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";

    secondsElapsed = 0;
    startTimer();
    taoGrid();
    hienThiCauHoi();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        let m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        let s = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById("timerDisplay").innerText = m + ":" + s;
    }, 1000);
}

function taoGrid() {
    let grid = document.getElementById("questionGrid");
    grid.innerHTML = "";
    for (let i = 0; i < activeQuestions.length; i++) {
        let btn = document.createElement("button");
        btn.innerText = i + 1;
        btn.className = "grid-btn";
        btn.id = "grid-btn-" + i;
        btn.onclick = () => chuyenDenCau(i);
        grid.appendChild(btn);
    }
}

function hienThiCauHoi() {
    let q = activeQuestions[currentIndex];
    document.getElementById("questionText").innerText = "Câu " + (currentIndex + 1) + ":\n" + q.text;

    let optsContainer = document.getElementById("options-container");
    optsContainer.innerHTML = "";
    let options = [
        { text: "⭕ Hoàn toàn đồng ý", val: 5 },
        { text: "🟢 Đồng ý", val: 4 },
        { text: "⚪ Bình thường", val: 3 },
        { text: "🟠 Không đồng ý", val: 2 },
        { text: "🔴 Hoàn toàn không đồng ý", val: 1 }
    ];

    options.forEach(opt => {
        let btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt.text;
        if (userAnswers[currentIndex] === opt.val) {
            btn.classList.add("selected");
        }
        btn.onclick = () => chonOption(opt.val, btn);
        optsContainer.appendChild(btn);
    });

    document.querySelectorAll(".grid-btn").forEach((btn, idx) => {
        btn.classList.remove("current");
        if (idx === currentIndex) btn.classList.add("current");
        if (userAnswers[idx] !== null) btn.classList.add("answered");
    });

    let answered = userAnswers.filter(x => x !== null).length;
    document.getElementById("answeredCount").innerText = answered + " / " + activeQuestions.length;
    document.getElementById("progressBar").style.width = ((answered / activeQuestions.length) * 100) + "%";
    document.getElementById("progressText").innerText = answered + "/" + activeQuestions.length;

    let prevBtn = document.getElementById("prevBtn");
    if (currentIndex === 0) {
        prevBtn.style.display = "none";
    } else {
        prevBtn.style.display = "block";
    }

    let nextBtn = document.getElementById("nextBtn");
    if (currentIndex === activeQuestions.length - 1) {
        nextBtn.innerText = "NỘP BÀI";
        nextBtn.style.backgroundColor = "#f9e2af";
        nextBtn.style.color = "#11111b";
    } else {
        nextBtn.innerText = "Câu tiếp theo ➔";
        nextBtn.style.backgroundColor = "#89b4fa";
        nextBtn.style.color = "#11111b";
    }
}

function chonOption(val, btnElement) {
    userAnswers[currentIndex] = val;

    let siblings = btnElement.parentNode.children;
    for (let btn of siblings) btn.classList.remove("selected");
    btnElement.classList.add("selected");

    document.getElementById("grid-btn-" + currentIndex).classList.add("answered");
    let answered = userAnswers.filter(x => x !== null).length;
    document.getElementById("answeredCount").innerText = answered + " / " + activeQuestions.length;
    document.getElementById("progressBar").style.width = ((answered / activeQuestions.length) * 100) + "%";
    document.getElementById("progressText").innerText = answered + "/" + activeQuestions.length;
}

function cauTruocDo() {
    if (currentIndex > 0) {
        currentIndex--;
        hienThiCauHoi();
    }
}

function cauTiepTheo() {
    if (userAnswers[currentIndex] === null) {
        alert("Vui lòng chọn một đáp án trước khi tiếp tục nhé!");
        return;
    }

    if (currentIndex < activeQuestions.length - 1) {
        currentIndex++;
        hienThiCauHoi();
    } else {
        let missing = userAnswers.indexOf(null);
        if (missing !== -1) {
            alert("Bạn chưa làm câu số " + (missing + 1) + " kìa!");
            chuyenDenCau(missing);
            return;
        }
        tinhDiemVaKetThuc();
    }
}

function chuyenDenCau(index) {
    currentIndex = index;
    hienThiCauHoi();
}

function tinhDiemVaKetThuc() {
    clearInterval(timerInterval);

    userScores = { 'O': 0, 'C': 0, 'E': 0, 'A': 0, 'N': 0 };

    for (let i = 0; i < activeQuestions.length; i++) {
        let q = activeQuestions[i];
        let diem = userAnswers[i];
        let multiplier = 0;

        if (diem === 5) multiplier = 2;
        else if (diem === 4) multiplier = 1;
        else if (diem === 3) multiplier = 0;
        else if (diem === 2) multiplier = -1;
        else if (diem === 1) multiplier = -2;

        for (let trait in q.factors) {
            userScores[trait] += q.factors[trait] * multiplier;
        }
    }

    tinhToanKetQua();
}

function normalize(scoresMap) {
    let sum = 0;
    let traits = ['O', 'C', 'E', 'A', 'N'];
    for (let t of traits) sum += Math.pow((scoresMap[t] || 0), 2);
    let length_of_vector = Math.sqrt(sum);

    let norm = {};
    for (let t of traits) norm[t] = length_of_vector === 0 ? 0 : (scoresMap[t] || 0) / length_of_vector;
    return norm;
}

function cosineSimilarityOf(normUser, normPerson) {
    let traits = ['O', 'C', 'E', 'A', 'N'];
    let similarity = 0;
    for (let t of traits) similarity += (normUser[t] || 0) * (normPerson[t] || 0);
    return similarity;
}

function tinhToanKetQua() {
    document.getElementById("quiz-section").style.display = "none";
    document.getElementById("result-section").style.display = "block";

    let normUserScores = normalize(userScores);
    let maxCosineSimilarity = -9999;
    let bestMatch = "";

    for (let p of selectedUniverseData) {
        let normPersonScores = normalize(p.scores);
        let curSim = cosineSimilarityOf(normUserScores, normPersonScores);

        if (curSim > maxCosineSimilarity) {
            maxCosineSimilarity = curSim;
            bestMatch = p.name;
        }
    }

    let traits = [
        { key: 'O', name: 'Cởi mở (Openness)', desc: 'Bạn là người có tâm hồn nghệ sĩ, thích khám phá cái mới và có trí tưởng tượng phong phú.' },
        { key: 'C', name: 'Tận tâm (Conscientiousness)', desc: 'Bạn là người kỷ luật, chu đáo, làm việc có kế hoạch và cực kỳ đáng tin cậy.' },
        { key: 'E', name: 'Hướng ngoại (Extraversion)', desc: 'Bạn tràn đầy năng lượng, thích giao tiếp và luôn là tâm điểm của mọi cuộc vui.' },
        { key: 'A', name: 'Dễ chịu (Agreeableness)', desc: 'Bạn tốt bụng, biết thông cảm và luôn ưu tiên sự hòa hợp trong các mối quan hệ.' },
        { key: 'N', name: 'Nhạy cảm (Neuroticism)', desc: 'Bạn có nội tâm sâu sắc, dễ bị tác động bởi cảm xúc và luôn quan sát mọi thứ rất tinh tế.' }
    ];

    let sortedTraits = traits.sort((a, b) => userScores[b.key] - userScores[a.key]);
    let primaryTrait = sortedTraits[0];

    document.getElementById("finalScore").innerText = bestMatch;

    document.getElementById("personalityTitle").innerText = "Nhóm: " + primaryTrait.name;

    let detailHTML = `<p style="font-style: italic; margin-bottom: 15px;">"${primaryTrait.desc}"</p>`;
    detailHTML += "<div style='text-align: left; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;'>";
    detailHTML += "<strong>Chỉ số tính cách của bạn:</strong><br>";
    traits.forEach(t => {
        detailHTML += `• ${t.name}: <strong>${userScores[t.key]}</strong><br>`;
    });
    detailHTML += "</div>";

    document.getElementById("personalityDesc").innerHTML = detailHTML;

    let icons = { 'O': '🎨', 'C': '📊', 'E': '📢', 'A': '🤝', 'N': '🌊' };
    document.getElementById("personalityIcon").innerText = icons[primaryTrait.key] || '✨';
}

function choiLai() {
    currentIndex = 0;
    userScores = { 'O': 0, 'C': 0, 'E': 0, 'A': 0, 'N': 0 };

    if (document.getElementById("progressBar")) {
        document.getElementById("progressBar").style.width = "0%";
    }

    document.getElementById("result-section").style.display = "none";
    document.getElementById("setup-section").style.display = "block";

    window.scrollTo(0, 0);
}

function taoBauTroiSao() {
    const starContainer = document.createElement("div");
    starContainer.style.position = "fixed";
    starContainer.style.top = "0";
    starContainer.style.left = "0";
    starContainer.style.width = "100%";
    starContainer.style.height = "100%";
    starContainer.style.zIndex = "-1";
    starContainer.style.pointerEvents = "none";
    document.body.appendChild(starContainer);

    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
        let star = document.createElement("div");
        star.classList.add("star");

        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';

        let size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        star.style.animationDuration = (Math.random() * 3 + 2) + 's';

        star.style.animationDelay = (Math.random() * 5) + 's';

        starContainer.appendChild(star);
    }
}

taoBauTroiSao();