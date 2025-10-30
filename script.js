// ▼▼▼ いただいたURLを反映しました ▼▼▼
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzyVRmC6iXVQL4Z_UjS6xoz7lpjfvv-C7gMAPGFyIfnumfkjbZv7S6Agj6NRMlDtXUJWg/exec';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// グローバル変数として犯罪データを保持
let crimeData = [];

// DOM要素の取得
const crimeListDiv = document.getElementById('crime-list');
const interventionInput = document.getElementById('intervention-count');
const totalAmountP = document.getElementById('total-amount');

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    fetchCrimeData(); // データを取得

    // 介入人数が変更されたら再計算
    interventionInput.addEventListener('input', calculateTotal);
    
    // リスト内の数値入力が変更されたら再計算
    crimeListDiv.addEventListener('input', (event) => {
        // イベント発生源が個数入力欄（crime-count-inputクラスを持つ）の場合のみ計算
        if (event.target.classList.contains('crime-count-input')) {
            calculateTotal();
        }
    });
});

/**
 * 1. GASから犯罪データを非同期で取得
 */
async function fetchCrimeData() {
    try {
        const response = await fetch(GAS_WEB_APP_URL);
        if (!response.ok) {
            throw new Error('ネットワークの応答が正しくありません。');
        }
        crimeData = await response.json();
        populateCrimeList(); // データを取得したらリストを生成
        calculateTotal(); // 初期計算
    } catch (error) {
        crimeListDiv.innerHTML = '<p style="color: red;">データの読み込みに失敗しました。GASのURLが正しいか、デプロイ設定（全員に公開）を確認してください。</p>';
        console.error('Fetch error:', error);
    }
}

/**
 * 2. 取得したデータでHTML（個数入力リスト）を生成
 */
function populateCrimeList() {
    crimeListDiv.innerHTML = ''; // "読み込み中..."を消去

    crimeData.forEach((crime, index) => {
        // 金額が数値でない（空欄など）場合はスキップ
        const low = parseFloat(crime.lowAmount);
        const high = parseFloat(crime.highAmount);

        if (isNaN(low) || isNaN(high)) {
            return;
        }

        const crimeItem = document.createElement('div');
        crimeItem.classList.add('crime-item');
        
        // 個数入力欄を作成
        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.id = `crime-count-${index}`;
        countInput.name = 'crime-count';
        countInput.classList.add('crime-count-input'); // 計算対象の目印
        countInput.min = 0;
        countInput.value = 0; // デフォルトは0
        
        // HTMLのdata属性に金額データを埋め込む
        countInput.dataset.lowAmount = low;
        countInput.dataset.highAmount = high;

        // 犯罪名と金額情報
        const crimeInfoDiv = document.createElement('div');
        crimeInfoDiv.classList.add('crime-info');
        
        const label = document.createElement('label');
        label.htmlFor = `crime-count-${index}`; // 対応する入力欄のidを指定
        label.textContent = crime.name;

        const amountInfo = document.createElement('div');
        amountInfo.classList.add('amount-info');
        amountInfo.textContent = `(2人以下: ${low.toLocaleString()} / 3人以上: ${high.toLocaleString()})`;
        
        crimeInfoDiv.appendChild(label);
        crimeInfoDiv.appendChild(amountInfo);

        // 要素をDOMに追加 (入力欄を先に追加)
        crimeItem.appendChild(countInput);
        crimeItem.appendChild(crimeInfoDiv);
        crimeListDiv.appendChild(crimeItem);
    });
}

/**
 * 3. 合計金額を計算して表示
 */
function calculateTotal() {
    let total = 0;
    const interventionCount = parseInt(interventionInput.value) || 0;
    
    // すべての個数入力欄を取得
    const countInputs = document.querySelectorAll('.crime-count-input');
    
    countInputs.forEach(input => {
        const count = parseInt(input.value) || 0;
        
        // 個数が0より大きい場合のみ計算
        if (count > 0) {
            // data属性から金額を取得
            const low = parseFloat(input.dataset.lowAmount);
            const high = parseFloat(input.dataset.highAmount);
            
            if (interventionCount <= 2) {
                total += (low * count); // 金額 × 個数
            } else { // 3人以上
                total += (high * count); // 金額 × 個数
            }
        }
    });
    
    // 3桁区切りで表示
    totalAmountP.textContent = total.toLocaleString();
}