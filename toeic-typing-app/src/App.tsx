import { useState } from "react";
import "./App.css";

function App() {
  const [inputText, setInputText] = useState("");
  const targetWord = "apple"; // 例: 出題する英単語

  return (
    <main className="container">
      <h1>TOEIC Typing App</h1>

      {/* 出題される単語 */}
      <div className="word-display">
        <h2>{targetWord}</h2>
      </div>

      {/* タイピング入力欄 */}
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="ここにタイプしてください"
        autoFocus
      />

      {/* 判定結果 */}
      {inputText === targetWord && (
        <p style={{ color: "green", fontWeight: "bold" }}>正解！</p>
      )}
    </main>
  );
}

export default App;
