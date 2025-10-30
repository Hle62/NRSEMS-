// ▼▼▼【重要】ステップ1でコピーしたGASのWebアプリURLを貼り付けてください▼▼▼
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzyVRmC6iXVQL4Z_UjS6xoz7lpjfvv-C7gMAPGFyIfnumfkjbZv7S6Agj6NRMlDtXUJWg/exec';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// グローバル変数として犯罪データを保持
let crimeData = [];

// DOM要素の取得
const crimeListDiv = document.getElementById('crime-list');
const interventionInput = document.getElementById('intervention-count');
const totalAmountP = document.getElementById('total-amount');

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    fetchCrimeData(); // データを取得

    // 介入人数かチェックボックスが変更されるたびに、合計を再計算
    interventionInput.addEventListener('input', calculateTotal);
    crimeListDiv.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
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
 * 2. 取得したデータでHTML（チェックボックスリスト）を生成
 */
function populateCrimeList() {
    crimeListDiv.innerHTML = ''; // "読み込み中..."を消去

    crimeData.forEach(crime => {
        // 金額が数値でない（空欄など）場合はスキップ
        const low = parseFloat(crime.lowAmount);
        const high = parseFloat(crime.highAmount);

        if (isNaN(low) || isNaN(high)) {
            return;
        }

        const crimeItem = document.createElement('div');
        crimeItem.classList.add('crime-item');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = crime.name;
        checkbox.name = 'crime';
        // HTMLのdata属性に金額データを埋め込む
        checkbox.dataset.lowAmount = low;
        checkbox.dataset.highAmount = high;
        
        const label = document.createElement('label');
        label.htmlFor = crime.name;
        label.textContent = crime.name;

        const amountInfo = document.createElement('div');
        amountInfo.classList.add('amount-info');
        amountInfo.textContent = `(2人以下: ${low.toLocaleString()} / 3人以上: ${high.toLocaleString()})`;
        
        crimeItem.appendChild(checkbox);
        crimeItem.appendChild(label);
        crimeItem.appendChild(amountInfo);
        crimeListDiv.appendChild(crimeItem);
    });
}

/**
 * 3. 合計金額を計算して表示
 */
function calculateTotal() {
    let total = 0;
    const interventionCount = parseInt(interventionInput.value) || 0;
    
    // チェックされている全てのチェックボックスを取得
    const selectedCheckboxes = document.querySelectorAll('input[name="crime"]:checked');
    
    selectedCheckboxes.forEach(checkbox => {
        // data属性から金額を取得
        const low = parseFloat(checkbox.dataset.lowAmount);
        const high = parseFloat(checkbox.dataset.highAmount);
        
        if (interventionCount <= 2) {
            total += low;
        } else { // 3人以上
            total += high;
        }
    });
    
    // 3桁区切りで表示
    totalAmountP.textContent = total.toLocaleString();
}