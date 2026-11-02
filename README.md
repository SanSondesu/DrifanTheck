# こもれび水槽 🐢

リアルでかわいいカメを、自由な視点から眺める小さな3D水槽ゲームです。

## 遊び方
- 画面をドラッグして視点を回転
- ピンチ操作（PCではホイール）でズーム
- カメをタップ／クリックすると、こちらを向くことがあります
- 「ひと休み」で動きを一時停止
- 「昼 / 夕方」で水槽の光を切り替え
- 「視点をリセット」で初期カメラに戻る

## 起動方法
GitHub Pagesを有効にするとブラウザで遊べます。

1. リポジトリの **Settings → Pages**
2. **Deploy from a branch** を選択
3. Branch を **main**、フォルダを **/(root)** にして Save
4. 公開URLが表示されるまで少し待つ

Three.js は jsDelivr CDN から読み込みます。初回起動時はインターネット接続が必要です。

## 技術
- HTML / CSS / JavaScript modules
- Three.js
- OrbitControls
