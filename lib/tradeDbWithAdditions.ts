import { tradeDb as generatedTradeDb } from "@/lib/tradeDb";
import { tradeDbAdditions } from "@/lib/tradeDbAdditions";

export const tradeDb: Record<string, string> = {
  ...generatedTradeDb,
  ...tradeDbAdditions,
};
