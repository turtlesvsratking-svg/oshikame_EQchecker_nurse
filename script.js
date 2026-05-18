// 1. 新しいGASのウェブアプリURL（最新版に更新済み）
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyVbuFqBndJUexbK-BqX_Xf46dASKomN9mjUEFqtx7lS2EVHDEvDRLIqZghspmyOSavKg/exec';

// 2. URLからグループID（部屋の識別子）を自動取得する設定
const urlParams = new URLSearchParams(window.location.search);
const GROUP_ID = urlParams.get('room') || 'default_room';

// 画面が読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    // 直近3日間の履歴を読み込む
    fetchLogs();

    // フォーム送信時のイベント
    const form = document.getElementById('checker-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveLog();
        });
    }
});

// データ保存（送信）処理
function saveLog() {
    const userName = document.getElementById('user-name').value.trim();
    const memo = document.getElementById('memo').value.trim();
    
    // 選択されている感情マスの要素を取得
    const selectedCell = document.querySelector('.grid-cell.selected');

    if (!userName) {
        alert('名前を入力してください。');
        return;
    }
    if (!selectedCell) {
        alert('マトリクスから現在の状態（マス）を1つ選択してください。');
        return;
    }

    // 選択されたマスからデータを抽出
    const emotionJp = selectedCell.getAttribute('data-journal-jp') || selectedCell.getAttribute('data-emotion-jp');
    const emotionEn = selectedCell.getAttribute('data-emotion-en');
    const x = selectedCell.getAttribute('data-x');
    const y = selectedCell.getAttribute('data-y');
    const color = selectedCell.style.backgroundColor || '#aaaaaa'; // マスの背景色（LINEの色分けに使用）

    // 送信ボタンを連打できないように無効化
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    // GASへ送るデータの組み立て
    const payload = {
        method: 'save',
        groupId: GROUP_ID,
        userName: userName,
        emotionJp: emotionJp,
        emotionEn: emotionEn,
        x: Number(x),
        y: Number(y),
        memo: memo,
        color: color,
        date: new Date().toISOString()
    };

    // GASへデータを送信
    fetch(GAS_URL, {
        method: 'POST',
        contentType: 'text/plain',
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('記録が完了し、LINEへ共有されました！');
            document.getElementById('memo').value = ''; // メモをリセット
            fetchLogs(); // 履歴を再読み込み
        } else {
            alert('保存に失敗しました。');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('通信エラーが発生しました。時間をおいて再度お試しください。');
    })
    .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
    });
}

// 履歴読み込み処理
function fetchLogs() {
    const logList = document.getElementById('log-list');
    if (!logList) return;

    const payload = {
        method: 'fetch',
        groupId: GROUP_ID
    };

    fetch(GAS_URL, {
        method: 'POST',
        contentType: 'text/plain',
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        logList.innerHTML = ''; // 一度クリア
        
        if (data.length === 0) {
            logList.innerHTML = '<p class="no-data">直近3日間の記録はありません。</p>';
            return;
        }

        // 届いたデータを画面の下部履歴にリスト表示
        data.forEach(item => {
            const li = document.createElement('li');
            li.className = 'log-item';
            // 左側に選択されたマスの色でボーダーをつける
            li.style.borderLeft = `5px solid ${item.color || '#aaaaaa'}`;
            
            li.innerHTML = `
                <div class="log-meta">
                    <span class="log-user">${escapeHtml(item.userName)}</span>
                    <span class="log-date">${item.date}</span>
                </div>
                <div class="log-emotion" style="color: ${item.color || '#333'}">${escapeHtml(item.emotionJp)}</div>
                ${item.memo ? `<div class="log-memo">${escapeHtml(item.memo)}</div>` : ''}
            `;
            logList.appendChild(li);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        logList.innerHTML = '<p class="no-data">履歴の読み込みに失敗しました。</p>';
    });
}

// セキュリティ対策（文字の無害化）
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
