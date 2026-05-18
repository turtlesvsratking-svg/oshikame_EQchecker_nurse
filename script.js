// ご提示いただいた最新のGASウェブアプリURLを適用済みです
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzrL5ZB5AFUTMEcB421goBY2rZnp3psMYfCnMCzfZMuUD4_eLnSEkvMaOvsMmalwyukzw/exec';

const grid = document.getElementById('mood-grid');
const displayJp = document.getElementById('selected-emotion-jp');
const userNameInput = document.getElementById('user-name-input');
const groupIdInput = document.getElementById('group-id-input');
const saveBtn = document.getElementById('save-btn');
const historyList = document.getElementById('history-list');
const thanksModal = document.getElementById('thanks-modal');

let currentSelection = null;
let currentCoords = { x: 0, y: 0 };

// 画面読み込み時にブラウザのlocalStorageから名前とグループIDを自動復元
window.onload = () => {
    userNameInput.value = localStorage.getItem('kame_userName') || '';
    groupIdInput.value = localStorage.getItem('kame_groupId') || '';
    if(groupIdInput.value.trim()) fetchLogs();
};

// 100マスの感情定義データ
const emotions = {
    "10-1": ["超多忙", "Engaged"], "10-2": ["動揺", "Panicked"], "10-3": ["ストレス限界", "Stressed"], "10-4": ["ピリピリする", "Jittery"], "10-5": ["衝撃的", "Shocked"],
    "10-6": ["驚き／喜び", "Surprised"], "10-7": ["気分爽快", "Upbeat"], "10-8": ["お祭り気分", "Festive"], "10-9": ["最高にハッピー", "Exhilarated"], "10-10": ["有頂天", "Ecstatic"],
    "9-1": ["猛烈な怒り", "Livid"], "9-2": ["憤慨", "Furious"], "9-3": ["イライラ最高潮", "Frustrated"], "9-4": ["余裕ゼロ", "Tense"], "9-5": ["呆然", "Stunned"],
    "9-6": ["興奮", "Hyper"], "9-7": ["愉快", "Cheerful"], "9-8": ["やる気満々", "Motivated"], "9-9": ["インスピレーション", "Inspired"], "9-10": ["大喜び", "Elated"],
    "8-1": ["爆発寸前", "Fuming"], "8-2": ["おびえる", "Frightened"], "8-3": ["腹立たしい", "Angry"], "8-4": ["ハラハラする", "Nervous"], "8-5": ["落ち着かない", "Restless"],
    "8-6": ["エネルギッシュ", "Energized"], "8-7": ["いきいき", "Lively"], "8-8": ["ワクワク", "Excited"], "8-9": ["前向き", "Optimistic"], "8-10": ["熱狂", "Enthusiastic"],
    "7-1": ["不安", "Anxious"], "7-2": ["心配ごと", "Apprehensive"], "7-3": ["気掛かり", "Worried"], "7-4": ["不快", "Irritated"], "7-5": ["もどかしい", "Annoyed"],
    "7-6": ["嬉しい", "Pleased"], "7-7": ["集中モード", "Focused"], "7-8": ["幸せ", "Happy"], "7-9": ["誇らしい", "Proud"], "7-10": ["興奮", "Thrilled"],
    "6-1": ["嫌悪感", "Repulsed"], "6-2": ["困惑", "Troubled"], "6-3": ["憂慮", "Concerned"], "6-4": ["そわそわ", "Uneasy"], "6-5": ["ちょっと嫌", "Peeved"],
    "6-6": ["快適", "Pleasant"], "6-7": ["楽しい", "Joyful"], "6-8": ["希望がある", "Hopeful"], "6-9": ["陽気な気分", "Playful"], "6-10": ["至福", "Blissful"],
    "5-1": ["うんざり", "Disgusted"], "5-2": ["ふさぎこむ", "Glum"], "5-3": ["がっかり", "Disappointed"], "5-4": ["どんより", "Down"], "5-5": ["無感情", "Apathetic"],
    "5-6": ["ひと安心", "At Ease"], "5-7": ["気楽", "Easygoing"], "5-8": ["満足", "Content"], "5-9": ["愛情を感じる", "Loving"], "5-10": ["心が満たされる", "Fulfilled"],
    "4-1": ["悲観的", "Pessimistic"], "4-2": ["不機嫌", "Morose"], "4-3": ["自信喪失", "Discouraged"], "4-4": ["悲しい", "Sad"], "4-5": ["退屈", "Bored"],
    "4-6": ["おだやか", "Calm"], "4-7": ["安心感", "Secure"], "4-8": ["満ち足りた気分", "Satisfied"], "4-9": ["感謝", "Grateful"], "4-10": ["じーんとくる", "Touched"],
    "3-1": ["疎外感", "Alienated"], "3-2": ["みじめ", "Miserable"], "3-3": ["孤独", "Lonely"], "3-4": ["意気消沈", "Disheartened"], "3-5": ["疲労", "Tired"],
    "3-6": ["リラックス", "Relaxed"], "3-7": ["のんびり", "Chill"], "3-8": ["心休まる", "Restful"], "3-9": ["恵まれている", "Blessed"], "3-10": ["バランスが良い", "Balanced"],
    "2-1": ["孤独感", "Despondent"], "2-2": ["ひどく落ち込む", "Depressed"], "2-3": ["うつうつ", "Sullen"], "2-4": ["消耗", "Exhausted"], "2-5": ["ぐったり", "Fatigued"],
    "2-6": ["まったり", "Mellow"], "2-7": ["思いをめぐらす", "Thoughtful"], "2-8": ["平和", "Peaceful"], "2-9": ["心地よい", "Comfortable"], "2-10": ["のんびり", "Carefree"],
    "1-1": ["絶望", "Despairing"], "1-2": ["無力感", "Hopeless"], "1-3": ["虚無感", "Desolate"], "1-4": ["燃え尽き", "Spent"], "1-5": ["限界", "Drained"],
    "1-6": ["ねむい", "Sleepy"], "1-7": ["無関心", "Complacent"], "1-8": ["静寂", "Tranquil"], "1-9": ["おうちでぬくぬく", "Cozy"], "1-10": ["平穏", "Serene"]
};

// クアドラントカラーに基づいた10x10のグリッドセルを自動生成
for (let y = 10; y >= 1; y--) {
    for (let x = 1; x <= 10; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        let color = x <= 5 ? (y > 5 ? `hsl(0, 75%, ${90-(y-5)*6}%)` : `hsl(210, 60%, ${95-(5-y)*6}%)`) : (y > 5 ? `hsl(40, 90%, ${90-(y-5)*6}%)` : `hsl(140, 50%, ${90-(5-y)*6}%)`);
        cell.style.backgroundColor = color;
        cell.onclick = () => {
            const data = emotions[`${y}-${x}`];
            currentSelection = { jp: data[0], color: color };
            currentCoords = { x, y };
            displayJp.innerText = `${data[0]} (身体:${y} / 心:${x})`;
            checkReadyToSave();
            document.querySelectorAll('.cell').forEach(c => c.style.outline = "none");
            cell.style.outline = "2px solid #333";
        };
        grid.appendChild(cell);
    }
}

// ボタンの活性化条件をチェック
function checkReadyToSave() {
    saveBtn.disabled = !(currentSelection && userNameInput.value.trim() && groupIdInput.value.trim());
}

// ユーザーがIDや名前を変更した際、自動保存し、履歴を動的リロード
groupIdInput.addEventListener('input', () => {
    localStorage.setItem('kame_groupId', groupIdInput.value.trim());
    if(groupIdInput.value.trim().length >= 1) fetchLogs();
    checkReadyToSave();
});
userNameInput.addEventListener('input', () => {
    localStorage.setItem('kame_userName', userNameInput.value.trim());
    checkReadyToSave();
});

// 記録ボタンクリック時の送信処理
saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.innerText = "送信中...";
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
                method: 'save',
                groupId: groupIdInput.value.trim(),
                userName: userNameInput.value.trim(),
                emotionJp: `${currentSelection.jp} (身体:${currentCoords.y} / 心:${currentCoords.x})`,
                y: currentCoords.y, x: currentCoords.x,
                memo: document.getElementById('memo-input').value || "（なし）",
                color: currentSelection.color
            })
        });
        document.getElementById('memo-input').value = "";
        thanksModal.classList.remove('thanks-hidden');
        setTimeout(() => thanksModal.classList.add('thanks-hidden'), 2000);
        await fetchLogs(); // 履歴を最新にする
    } catch (e) { alert("保存に失敗しました"); }
    finally { saveBtn.innerText = "今の自分を記録する"; checkReadyToSave(); }
};

// 履歴データを取得し、日付見出しごとにグループ化して画面描画
async function fetchLogs() {
    const groupId = groupIdInput.value.trim();
    if (!groupId) return;
    try {
        const res = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ method: 'fetch', groupId }) });
        const logs = await res.json();
        if(logs.length === 0) {
            historyList.innerHTML = '<p class="loading-msg">直近3日間の履歴はありません</p>';
            return;
        }
        let html = '';
        let lastDate = '';
        logs.forEach(l => {
            const currentDate = l.date.split(' ')[0]; // "M/d"の部分を抽出
            if (currentDate !== lastDate) {
                html += `<div class="date-header">${currentDate}</div>`;
                lastDate = currentDate;
            }
            html += `
                <div class="history-item" style="border-left-color: ${l.color}">
                    <div class="time">${l.date.split(' ')[1]}</div>
                    <div><span class="user-name-tag">${l.userName}</span><strong>${l.emotionJp}</strong></div>
                    <div class="status-tags">身体:${l.y} / 心:${l.x}</div>
                    <div class="memo-text">${l.memo}</div>
                </div>
            `;
        });
        historyList.innerHTML = html;
    } catch (e) { console.error(e); }
}

// 5分（300,000ミリ秒）おきにチームのデータを自動更新（画面開きっぱなしに対応）
setInterval(() => { if(groupIdInput.value.trim()) fetchLogs(); }, 300000);
