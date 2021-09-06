export type OrderSide = "buy" | "sell";
export interface ProfitType {
  [key: string]: number;
  id: number;
  profit: number;
  targetPrice: number;
  amountToSell: number;
}