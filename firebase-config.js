// Firebase コンソール →「プロジェクトの設定」→「マイアプリ（ウェブ）」の firebaseConfig をここに貼り付ける。
// この値はサイトを見た人に公開されても問題ない（データは firestore.rules で守る）。
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// ログインを許可する Google アカウント。firestore.rules にも同じアドレスを書く。
window.ALLOWED_EMAILS = ["YOUR_EMAIL@gmail.com"];
