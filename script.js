// ▼▼▼ いただいたURLを反映済みです ▼▼▼
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzyVRmC6iXVQL4Z_UjS6xoz7lpjfvv-C7gMAPGFyIfnumfkjbZv7S6Agj6NRMlDtXUJWg/exec';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// グローバル変数として犯罪データを保持
let crimeData = [];

// DOM要素の取得
const crimeListDiv = document.getElementById('crime-list');
// ▼▼▼ interventionInput を削除 ▼▼▼
const totalAmountP = document.getElementById('total-amount');

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    fetchCrimeData(); // データを取得

    // ▼▼▼ interventionInput のリスナーを削除 ▼▼▼
    
    // リスト内の数値入力が変更されたら再計算
    crimeListDiv.addEventListener('input', (event) => {
        // ▼▼▼ 対象クラスを変更 ▼▼▼
        if (event.target.classList.contains('low-count-input') || 
            event.target.classList.contains('high-count-input')) {
            calculateTotal();
        }
    });
});

/**
 * 1. GASから犯罪データを非同期で取得 (変更なし)
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
 * 2. 取得したデータでHTML（2つの入力欄リスト）を生成
 * (▼▼▼ ロジック大幅変更 ▼▼▼)
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
        
        // 犯罪名ラベル
        const nameLabel = document.createElement('label');
        nameLabel.classList.add('crime-name');
        nameLabel.textContent = crime.name;
        // nameLabel.htmlFor には設定しない (2つの入力欄があるため)

        // 2つの入力欄をまとめるコンテナ
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');

        // --- 2人以下の入力欄 ---
        const lowInputItem = document.createElement('div');
        lowInputItem.classList.add('input-item');
        
        const lowLabel = document.createElement('label');
        lowLabel.htmlFor = `low-count-${index}`;
        lowLabel.textContent = '2人以下';
        
        const lowCountInput = document.createElement('input');
        lowCountInput.type = 'number';
        lowCountInput.id = `low-count-${index}`;
        lowCountInput.classList.add('low-count-input'); // 計算対象の目印
        lowCountInput.min = 0;
        lowCountInput.value = 0;
        lowCountInput.dataset.lowAmount = low; // 金額をdata属性に

        lowInputItem.appendChild(lowLabel);
        lowInputItem.appendChild(lowCountInput);

        // --- 3人以上の入力欄 ---
        const highInputItem = document.createElement('div');
        highInputItem.classList.add('input-item');

        const highLabel = document.createElement('label');
        highLabel.htmlFor = `high-count-${index}`;
        highLabel.textContent = '3人以上';

        const highCountInput = document.createElement('input');
        highCountInput.type = 'number';
        highCountInput.id = `high-count-${index}`;
        highCountInput.classList.add('high-count-input'); // 計算対象の目印
        highCountInput.min = 0;
        highCountInput.value = 0;
        highCountInput.dataset.highAmount = high; // 金額をdata属性に

        highInputItem.appendChild(highLabel);
        highInputItem.appendChild(highCountInput);
        
        // --- 組み立て ---
        inputGroup.appendChild(lowInputItem);
        inputGroup.appendChild(highInputItem);
        
        crimeItem.appendChild(nameLabel);
        crimeItem.appendChild(inputGroup);
        
        crimeListDiv.appendChild(crimeItem);
    });
}

/**
 * 3. 合計金額を計算して表示
 * (▼▼▼ ロジック大幅変更 ▼▼▼)
 */
function calculateTotal() {
    let total = 0;
    // ▼▼▼ interventionCount を削除 ▼▼▼
    
    // "2人以下" の全入力欄を計算
    const lowCountInputs = document.querySelectorAll('.low-count-input');
    lowCountInputs.forEach(input => {
        const count = parseInt(input.value) || 0;
        if (count > 0) {
            const lowAmount = parseFloat(input.dataset.lowAmount);
            total += (lowAmount * count);
        }
    });

    // "3人以上" の全入力欄を計算
    const highCountInputs = document.querySelectorAll('.high-count-input');
    highCountInputs.forEach(input => {
        const count = parseInt(input.value) || 0;
        if (count > 0) {
            const highAmount = parseFloat(input.dataset.highAmount);
            total += (highAmount * count);
        }
    });
    
    // 3桁区切りで表示
    totalAmountP.textContent = total.toLocaleString();
}