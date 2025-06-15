import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function Home() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // ここでトークンを保存するなど（例: localStorage）
      localStorage.setItem("access_token", tokenResponse.access_token);
      navigate("/dashboard");
    },
    onError: (errorResponse) => {
      console.error("Googleログイン失敗:", errorResponse);
    },
  });

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
          onClick={() => login()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
        >
          Googleでログイン
        </button>
      </div>
    </main>
  );
}
