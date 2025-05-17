import type { Priority } from "../types/priority";

// 表示名の定義
export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

// 表示順の定義
export const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];
