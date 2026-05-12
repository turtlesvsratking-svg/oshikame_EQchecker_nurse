const GAS_URL = 'https://script.google.com/macros/s/AKfycbwuTnBa2xY2XogZumLIJob5ypUhJJirZqefp5TFd5Zgrk5OjfaeWpD4MGcjo_vC3cOo7A/exec';

const grid = document.getElementById('mood-grid');
const displayJp = document.getElementById('selected-emotion-jp');
const displayEn = document.getElementById('selected-emotion-en');
const memoInput = document.getElementById('memo-input');
const saveBtn = document.getElementById('save-btn');
const historyList = document.getElementById('history-list');
const groupIdInput = document.getElementById('group-id-input');
const thanksModal = document.getElementById('thanks-modal');

let currentSelection = null;
let currentCoords = { x: 0, y: 0 };

const emotions = {
    "10-1": ["忙しい", "Engaged"], "10-2": ["うろたえる", "Panicked"], "10-3": ["ストレスが強い", "Stressed"], "10-4": ["神経質", "Jittery"], "10-5": ["衝撃的", "Shocked"],
    "10-6": ["驚いている", "Surprised"], "10-7": ["陽気", "Upbeat"], "10-8": ["お祭り気分", "Festive"], "10-9": ["ウキウキする", "Exhilarated"], "10-10": ["有頂天", "Ecstatic"],
    "9-1": ["激怒", "Livid"], "9-2": ["青ざめる", "Furious"], "9-3": ["落胆した", "Frustrated"], "9-4": ["張り詰めた", "Tense"], "9-5": ["あ然とする", "Stunned"],
    "9-6": ["興奮状態", "Hyper"], "9-7": ["愉快", "Cheerful"], "9-8": ["やる気がある", "Motivated"], "9-9": ["触発された", "Inspired"], "9-10": ["大喜び", "Elated"],
    "8-1": ["怒りで爆発する", "Fuming"], "8-2": ["おびえる", "Frightened"], "8-3": ["怒り", "Angry"], "8-4": ["神経が高ぶる", "Nervous"], "8-5": ["落ち着かない", "Restless"],
    "8-6": ["精力的", "Energized"], "8-7": ["生き生きとした", "Lively"], "8-8": ["興奮した", "Excited"], "8-9": ["楽観的", "Optimistic"], "8-10": ["熱狂的", "Enthusiastic"],
    "7-1": ["気が気でない・緊張", "Anxious"], "7-2": ["危惧する", "Apprehensive"], "7-3": ["心配する", "Worried"], "7-4": ["うわついた", "Imitated"], "7-5": ["いらいらする", "Annoyed"],
    "7-6": ["うれしい", "Pleased"], "7-7": ["集中", "Focused"], "7-8": ["幸せ", "Happy"], "7-9": ["誇りに思う", "Proud"], "7-10": ["ぞくぞくする", "Thrilled"],
    "6-1": ["嫌悪感を抱く", "Repulsed"], "6-2": ["当惑する・困る", "Troubled"], "6-3": ["憂慮する", "Concerned"], "6-4": ["そわそわする", "Uneasy"], "6-5": ["もどかしい", "Peeved"],
    "6-6": ["快適", "Pleasant"], "6-7": ["楽しい", "Joyful"], "6-8": ["希望に満ちた", "Hopeful"], "6-9": ["遊び心のある", "Playful"], "6-10": ["至福", "Blissful"],
    "5-1": ["うんざりする", "Disgusted"], "5-2": ["ふさぎこむ", "Glum"], "5-3": ["期待を裏切られた", "Disappointed"], "5-4": ["落ち込む", "Down"], "5-5": ["無感情", "Apathetic"],
    "5-6": ["気楽", "At Ease"], "5-7": ["のんびり", "Easygoing"], "5-8": ["満足している", "Content"], "5-9": ["愛情のある", "Loving"], "5-10": ["充実している", "Fulfilled"],
    "4-1": ["悲観的", "Pessimistic"], "4-2": ["気難しい", "Morose"], "4-3": ["気を落とす", "Discouraged"], "4-4": ["悲しい", "Sad"], "4-5": ["つまらない", "Bored"],
    "4-6": ["穏やか", "Calm"], "4-7": ["安心している", "Secure"], "4-8": ["満ち足りている", "Satisfied"], "4-9": ["ありがたい", "Grateful"], "4-10": ["感動する", "Touched"],
    "3-1": ["疎外される", "Alienated"], "3-2": ["悲惨", "Miserable"], "3-3": ["孤独", "Lonely"], "3-4": ["がっかりする", "Disheartened"], "3-5": ["疲れている", "Tired"],
    "3-6": ["リラックスしている", "Relaxed"], "3-7": ["ゆっくりする", "Chill"], "3-8": ["心が休まる", "Restful"], "3-9": ["恵まれている", "Blessed"], "3-10": ["バランスがとれている", "Balanced"],
    "2-1": ["しょげ返った", "Despondent"], "2-2": ["意気消沈", "Depressed"], "2-3": ["不機嫌", "Sullen"], "2-4": ["疲労困憊", "Exhausted"], "2-5": ["疲労・倦怠感", "Fatigued"],
    "2-6": ["落ち着いている", "Mellow"], "2-7": ["思いにふける", "Thoughtful"], "2-8": ["平然とした", "Peaceful"], "2-9": ["心地良い", "Comfortable"], "2-10": ["のんき", "Carefree"],
    "1-1": ["絶望", "Despairing"], "1-2": ["望みがない", "Hopeless"], "1-3": ["みじめ", "Desolate"], "1-4": ["失望する", "Spent"], "1-5": ["疲れ切っている", "Drained"],
    "1-6": ["眠たい", "Sleepy"], "1-7": ["無関心", "Complacent"], "1-8": ["冷静", "Tranquil"], "1-9": ["くつろいでいる", "Cozy"], "1-10": ["平穏", "Serene"]
};

// グリッド作成
for (let y = 10; y >= 1; y--) {
    for (let x = 1; x <= 10; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        let color = x <= 5 ? (y > 5 ? `hsl(0, 75%, ${90-(y-5)*6}%)` : `hsl(210, 60%, ${95-(5-y)*6}%)`) : (y > 5 ? `hsl(40, 90%, ${90-(y-5)*6}%)` : `hsl(140, 50%, ${90-(5-y)*6}%)`);
        cell.style.backgroundColor = color;
        cell.onclick = () => {
            const data = emotions[`${y}-${x}`];
            currentSelection = { jp: data[0], en: data[1], color: color };
            currentCoords = { x, y };
            displayJp.innerText = data[0];
            displayEn.innerText = data[1];
            saveBtn.disabled = false;
            document.querySelectorAll('.cell').forEach(c => c.style.border = "none");
            cell.style.border = "2.5px solid #333";
        };
        grid.appendChild(cell);
    }
}

// 保存処理
saveBtn.onclick = async () => {
    const groupId = groupIdInput.value.trim();
    if (!groupId) return alert("グループIDを入力してください");
    saveBtn.disabled = true;
    saveBtn.innerText = "保存中...";
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
                method: 'save', groupId,
                emotionJp: currentSelection.jp, emotionEn: currentSelection.en,
                y: currentCoords.y, x: currentCoords.x,
                memo: memoInput.value || "（なし）", color: currentSelection.color
            })
        });
        memoInput.value = "";
        thanksModal.classList.remove('thanks-hidden');
        setTimeout(() => thanksModal.classList.add('thanks-hidden'), 3000);
        fetchLogs();
    } catch (e) { alert("保存に失敗しました"); }
    finally { saveBtn.disabled = false; saveBtn.innerText = "今の自分を記録する"; }
};

// 取得・履歴表示
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
                        <span>身体の元気度:${l.y}</span> / <span>心の元気度:${l.x}</span>
                    </div>
                    <div class="memo-text">${l.memo}</div>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error("履歴取得失敗", e); }
}

groupIdInput.onchange = fetchLogs;
window.onload = () => { if (groupIdInput.value) fetchLogs(); };
