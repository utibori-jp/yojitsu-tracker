import type { Status } from "../types/status";

// 表示名の定義
export const STATUS_LABELS: Record<Status, string> = {
  todo: "未着手",
  doing: "進行中",
  pending: "停止中",
  done: "完了",
};
