import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 本来はここにGoogleログイン処理を入れる
    console.log("ログインボタンがクリックされました");
    // 認証後に /dashboard へ遷移する想定
    navigate("/dashboard");
  };

  return (
    <main className="bg-gray-200 min-h-screen">
      <div className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-white text-2xl font-bold text-center">
          予実 Tracker
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center mt-20 space-y-6">
        <p className="text-lg text-gray-700">
          タスク管理を効率的に行うためのツールです。
        </p>

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
        >
          Googleでログイン
        </button>
      </div>
    </main>
  );
}
