// --- 設定：ご提示いただいたGASのURL ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwuTnBa2xY2XogZumLIJob5ypUhJJirZqefp5TFd5Zgrk5OjfaeWpD4MGcjo_vC3cOo7A/exec';

const grid = document.getElementById('mood-grid');
const displayJp = document.getElementById('selected-emotion-jp');
const displayEn = document.getElementById('selected-emotion-en');
const memoInput = document.getElementById('memo-input');
const saveBtn = document.getElementById('save-btn');
const historyList = document.getElementById('history-list');
const groupIdInput = document.getElementById('group-id-input');

let currentSelection = null;
let currentCoords = { x: 0, y: 0 };

// 看護師版：感情データリスト（全100個）
const emotions = {
    "10-1": ["超多忙", "Engaged"], "10-2": ["動揺", "Panicked"], "10-3": ["ストレス限界", "Stressed"], "10-4": ["ピリピリする", "Jittery"], "10-5": ["衝撃的", "Shocked"],
    "10-6": ["驚きの喜び", "Surprised"], "10-7": ["気分爽快", "Upbeat"], "10-8": ["お祭り気分", "Festive"], "10-9": ["最高にハッピー", "Exhilarated"], "10-10": ["有頂天", "Ecstatic"],
    "9-1": ["猛烈な怒り", "Livid"], "9-2": ["憤慨", "Furious"], "9-3": ["イライラ最高潮", "Frustrated"], "9-4": ["余裕ゼロ", "Tense"], "9-5": ["呆然", "Stunned"],
    "9-6": ["興奮", "Hyper"], "9-7": ["愉快", "Cheerful"], "9-8": ["やる気満々", "Motivated"], "9-9": ["インスピレーション", "Inspired"], "9-10": ["大喜び", "Elated"],
    "8-1": ["爆発寸前", "Fuming"], "8-2": ["おびえる", "Frightened"], "8-3": ["腹立たしい", "Angry"], "8-4": ["ハラハラする", "Nervous"], "8-5": ["落ち着かない", "Restless"],
    "8-6": ["エネルギッシュ", "Energized"], "8-7": ["いきいき", "Lively"], "8-8": ["ワクワク", "Excited"], "8-9": ["前向き", "Optimistic"], "8-10": ["熱狂", "Enthusiastic"],
    "7-1": ["不安", "Anxious"], "7-2": ["心配ごと", "Apprehensive"], "7-3": ["気掛かり", "Worried"], "7-4": ["不快", "Irritated"], "7-5": ["もどかしい", "Annoyed"],
    "7-6": ["嬉しい", "Pleased"], "7-7": ["集中モード", "Focused"], "7-8": ["幸せ", "Happy"], "7-9": ["誇らしい", "Proud"], "7-10": ["スリル", "Thrilled"],
    "6-1": ["嫌悪感", "Repulsed"], "6-2": ["困惑", "Troubled"], "6-3": ["憂慮", "Concerned"], "6-4": ["そわそわ", "Uneasy"], "6-5": ["ちょっと嫌", "Peeved"],
    "6-6": ["快適", "Pleasant"], "6-7": ["楽しい", "Joyful"], "6-8": ["希望がある", "Hopeful"], "6-9": ["遊び心", "Playful"], "6-10": ["至福", "Blissful"],
    "5-1": ["うんざり", "Disgusted"], "5-2": ["ふさぎこむ", "Glum"], "5-3": ["がっかり", "Disappointed"], "5-4": ["どんより", "Down"], "5-5": ["無感情", "Apathetic"],
    "5-6": ["ひと安心", "At Ease"], "5-7": ["気楽", "Easygoing"], "5-8": ["満足", "Content"], "5-9": ["愛情を感じる", "Loving"], "5-10": ["心が満たされる", "Fulfilled"],
    "4-1": ["悲観的", "Pessimistic"], "4-2": ["不機嫌", "Morose"], "4-3": ["自信喪失", "Discouraged"], "4-4": ["悲しい", "Sad"], "4-5": ["退屈", "Bored"],
    "4-6": ["おだやか", "Calm"], "4-7": ["安心感", "Secure"], "4-8": ["満ち足りた気分", "Satisfied"], "4-9": ["感謝", "Grateful"], "4-10": ["じーんとくる", "Touched"],
    "3-1": ["疎外感", "Alienated"], "3-2": ["みじめ", "Miserable"], "3-3": ["孤独", "Lonely"], "3-4": ["意気消沈", "Disheartened"], "3-5": ["疲労", "Tired"],
    "3-6": ["リラックス", "Relaxed"], "3-7": ["のんびり", "Chill"], "3-8": ["心休まる", "Restful"], "3-9": ["恵まれている", "Blessed"], "3-10": ["バランスが良い", "Balanced"],
    "2-1": ["孤独感", "Despondent"], "2-2": ["ひどく落ち込む", "Depressed"], "2-3": ["うつうつ", "Sullen"], "2-4": ["消耗", "Exhausted"], "2-5": ["ぐったり", "Fatigued"],
    "2-6": ["まったり", "Mellow"], "2-7": ["内省", "Thoughtful"], "2-8": ["平和", "Peaceful"], "2-9": ["心地よい", "Comfortable"], "2-10": ["のんき", "Carefree"],
    "1-1": ["絶望", "Despairing"], "1-2": ["無力感", "Hopeless"], "1-3": ["虚無感", "Desolate"], "1-4": ["燃え尽き", "Spent"], "1-5": ["限界", "Drained"],
    "1-6": ["ねむい", "Sleepy"], "1-7": ["無関心（良い）", "Complacent"], "1-8": ["静寂", "Tranquil"], "1-9": ["おうちでぬくぬく", "Cozy"], "1-10": ["平穏", "Serene"]
};

// グリッド生成（10x10）
for (let y = 10; y >= 1; y--) {
    for (let x = 1; x <= 10; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        let color = x <= 5 ? (y > 5 ? `hsl(0, 75%, ${90-(y-5)*6}%)` : `hsl(210, 60%, ${95-(5-y)*6}%)`) : (y > 5 ? `hsl(40, 90%, ${90-(y-5)*6}%)` : `hsl(140, 50%, ${90-(5-y)*6}%)`);
        cell.style.backgroundColor = color;
        
        cell.onclick = () => {
            const data = emotions[`${y}-${x}`];
            currentSelection = { jp: data[0], en: data[1], color: color };
            currentCoords = { x: x, y: y };
            
            displayJp.innerText = data[0];
            displayEn.innerText = data[1];
            saveBtn.disabled = false;
            
            document.querySelectorAll('.cell').forEach(c => c.style.border = "none");
            cell.style.border = "2.5px solid #333";
        };
        grid.appendChild(cell);
    }
}

// データの保存（GAS経由でスプレッドシートへ）
saveBtn.onclick = async () => {
    const groupId = groupIdInput.value.trim();
    if (!groupId) {
        alert("共有用のグループIDを入力してください（例：TeamNurseA）");
        return;
    }

    const logData = {
        method: 'save',
        groupId: groupId,
        emotionJp: currentSelection.jp,
        emotionEn: currentSelection.en,
        y: currentCoords.y,
        x: currentCoords.x,
        memo: memoInput.value || "（なし）",
        color: currentSelection.color
    };

    saveBtn.disabled = true;
    saveBtn.innerText = "保存中...";

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(logData)
        });
        
        if (response.ok) {
            memoInput.value = "";
            alert("クラウドに記録しました！");
            fetchLogs(); 
        } else {
            throw new Error("保存失敗");
        }
    } catch (e) {
        console.error(e);
        alert("保存に失敗しました。GASのデプロイ設定を確認してください。");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "今の自分を記録する";
    }
};

// データの取得（同じグループIDの記録を読み込む）
async function fetchLogs() {
    const groupId = groupIdInput.value.trim();
    if (!groupId) return;

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ method: 'fetch', groupId: groupId })
        });
        const logs = await response.json();
        
        historyList.innerHTML = logs.map(l => `
            <div class="history-item" style="border-left: 6px solid ${l.color}">
                <div class="history-content">
                    <div class="time">${l.date}</div>
                    <div class="emotion-name">
                        <strong>${l.emotionJp}</strong> <span style="font-size: 0.8em; color: #667;">(${l.emotionEn})</span>
                    </div>
                    <div class="status-tags">
                        <span>身体:${l.y}</span> / <span>心:${l.x}</span>
                    </div>
                    <div class="memo-text">${l.memo}</div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error("履歴の取得に失敗しました", e);
    }
}

// 入力欄が変更されたら自動で履歴を読み込む
groupIdInput.onchange = fetchLogs;

// ページ読み込み時に既にIDが入っていれば読み込む
window.onload = () => {
    if (groupIdInput.value) fetchLogs();
};
