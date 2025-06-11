import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memo: string) => void;
}

const ReflectionMemoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [memo, setMemo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(memo);
    setMemo("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">タスクを完了</h2>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={5}
          placeholder="振り返りメモ..."
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={handleSubmit}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionMemoModal;
