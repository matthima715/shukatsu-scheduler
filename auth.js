/* ---------- ログイン（Firebase Authentication + Firestore） ----------
   window.cloudReady … ログイン済みなら cloud オブジェクト、未設定・読み込み失敗なら null。
   各ページは null のとき今まで通りブラウザ（localStorage）に保存する。 */
(() => {
const SDK = "https://www.gstatic.com/firebasejs/10.14.1/";
const cfg = window.FIREBASE_CONFIG;
const allowed = (window.ALLOWED_EMAILS || []).map(s => s.toLowerCase());
if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith("YOUR")) { window.cloudReady = Promise.resolve(null); return; }

const style = document.createElement("style");
style.textContent = `
.lg-wrap{position:fixed;inset:0;z-index:1000;background:var(--bg,#EEF1F5);display:grid;place-items:center;padding:16px}
.lg-card{background:var(--paper,#fff);border:1px solid var(--line,#D5DAE5);border-radius:14px;padding:28px 24px;width:min(380px,100%);display:grid;gap:12px;text-align:center}
.lg-card h1{margin:0;font-size:22px;font-weight:900}
.lg-card p{margin:0;color:var(--muted,#5E6782);font-size:14px}
.lg-btn{border:0;border-radius:999px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer;background:var(--accent,#2B3A8C);color:var(--accent-ink,#fff)}
.lg-btn:disabled{opacity:.5;cursor:default}
.lg-msg{color:var(--danger,#B42318)!important;min-height:1.2em}
.lg-acct{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:900;display:flex;gap:8px;align-items:center;background:var(--paper,#fff);border:1px solid var(--line,#D5DAE5);border-radius:999px;padding:4px 4px 4px 12px;font-size:12px;color:var(--muted,#5E6782);max-width:calc(100vw - 24px)}
.lg-acct span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lg-acct button{border:1px solid var(--line,#D5DAE5);background:none;border-radius:999px;padding:3px 10px;font:inherit;font-weight:700;color:var(--ink,#18213B);cursor:pointer;white-space:nowrap}`;
document.head.append(style);

// 判定が終わるまでアプリの上を覆っておく
const gateEl = document.createElement("div");
gateEl.className = "lg-wrap";
gateEl.innerHTML = `<div class="lg-card"><h1></h1><p>続けるにはログインしてください。</p>
  <button class="lg-btn" disabled>Googleでログイン</button><p class="lg-msg" role="alert"></p></div>`;
gateEl.querySelector("h1").textContent = document.title;
document.body.append(gateEl);
const btn = gateEl.querySelector(".lg-btn");
const say = msg => { gateEl.querySelector(".lg-msg").textContent = msg; };

window.cloudReady = (async () => {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + "firebase-firestore.js")]);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  const user = await signIn(auth, A);
  gateEl.remove();
  showAccount(user, auth, A);

  const ref = name => F.collection(db, "users", user.uid, name);
  const clean = o => JSON.parse(JSON.stringify(o)); // Firestore は undefined を受け付けない
  return {
    user: { uid: user.uid, email: user.email },
    collection(name){
      const col = ref(name);
      return {
        doc: id => ({
          set: data => F.setDoc(F.doc(col, id), clean(data)),
          delete: () => F.deleteDoc(F.doc(col, id)),
        }),
        onSnapshot: (next, error) => F.onSnapshot(col, s => next({
          docs: s.docs.map(d => ({ id: d.id, data: () => d.data() })),
          fromCache: s.metadata.fromCache,
        }), error),
      };
    },
    // この端末のブラウザに残っているデータをクラウドへ移す（移したら true）
    async importLocal(key, name){
      let list = [];
      try { list = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
      if (!Array.isArray(list) || !list.length) return false;
      const batch = F.writeBatch(db);
      for (const x of list) if (x && x.id) batch.set(F.doc(ref(name), String(x.id)), clean(x));
      await batch.commit();
      try { localStorage.setItem(key + ".backup", localStorage.getItem(key)); localStorage.removeItem(key); } catch {}
      return true;
    },
  };
})().catch(e => { console.error(e); gateEl.remove(); return null; });

function signIn(auth, A){
  return new Promise(resolve => {
    let done = false;
    A.onAuthStateChanged(auth, async u => {
      if (done) { if (!u) location.reload(); return; }
      if (u && (!allowed.length || allowed.includes((u.email || "").toLowerCase()))) { done = true; resolve(u); return; }
      if (u) { await A.signOut(auth); say(`このアカウント（${u.email}）では利用できません。`); }
      btn.disabled = false;
    });
    btn.onclick = async () => {
      say(""); btn.disabled = true;
      const provider = new A.GoogleAuthProvider();
      try { await A.signInWithPopup(auth, provider); }
      catch (e) {
        if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") return A.signInWithRedirect(auth, provider);
        if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") say(`ログインできませんでした（${e.code}）`);
        btn.disabled = false;
      }
    };
  });
}

function showAccount(user, auth, A){
  const el = document.createElement("div");
  el.className = "lg-acct";
  el.innerHTML = `<span></span><button type="button">ログアウト</button>`;
  el.querySelector("span").textContent = user.email || "";
  el.querySelector("button").onclick = () => A.signOut(auth);
  document.body.append(el);
}
})();
