// Firebase コンソール →「プロジェクトの設定」→「マイアプリ（ウェブ）」の firebaseConfig をここに貼り付ける。
// この値はサイトを見た人に公開されても問題ない（データは firestore.rules で守る）。
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyA7ME1TLkvhS7MUYxO1OSD52-QmYOSR-X8",
  authDomain: "shukatsu-e4217.firebaseapp.com",
  projectId: "shukatsu-e4217",
  storageBucket: "shukatsu-e4217.firebasestorage.app",
  messagingSenderId: "1052572322329",
  appId: "1:1052572322329:web:ac8c40edbd06fe3c97b888",
};

// ログインを許可する Google アカウント。firestore.rules にも同じアドレスを書く。
// 空 [] のときはどの Google アカウントでもログインできる（テスト用。データは各自のものしか見えない）。
window.ALLOWED_EMAILS = [];
