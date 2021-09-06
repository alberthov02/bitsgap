import { observable, computed, action } from "mobx";

import { OrderSide, ProfitType } from "../model";

import { 
  ERROR_PROFIT_MIN,
  ERROR_PROFIT_MAX,
  ERROR_PROFIT_PREV ,
  ERROR_TARGET_AMOUNT,
  ERROR_TARGET_PRICE_GREATER
} from "../constants";

export class PlaceOrderStore {
  @observable activeOrderSide: OrderSide = "buy";
  @observable price: number = 0;
  @observable amount: number = 0;

  @observable profit: number = 2;
  @observable amountToSell : number = 100;
  @observable showProfit : boolean = false;
  @observable profits : Array<ProfitType> = [];
  @observable errors : Array<ProfitType> = []; 

  @computed get total(): number {
    return this.price * this.amount;
  }

  @computed get targetPrice(): number {
    return this.price + (this.price * this.profit/100);
  } 

  @computed get profitsCount(): number {
    return this.profits.length;
  }

  @computed get projectedFit(): string {
    const fit = this.profits.reduce((acc, item) => (
      acc + item.targetPrice * (this.amount * item.amountToSell / 100) - this.total * item.amountToSell / 100
    ), 0)
    
    return this.activeOrderSide === 'sell' ? `-${fit.toFixed(2)}` : fit.toFixed(2);
  }

  @action.bound
  public setErrors(errors: any) {
    this.errors = errors;
  }

  @action.bound
  public setProfit(profit: number, id: number) {
    const updatedIndex = this.profits.findIndex(item => item.id === id);
    this.profits[updatedIndex].profit = profit;
    this.profits[updatedIndex].targetPrice = this.price + (this.price * profit / 100);
  }

  @action.bound
  public setTargetPrice(targetPrice: number, id: number) {
    const updatedIndex = this.profits.findIndex(item => item.id === id);
    this.profits[updatedIndex].profit = 100 / this.price * targetPrice - 100;
    this.profits[updatedIndex].targetPrice = 
      this.price + (this.price * this.profits[updatedIndex].profit / 100);
  }

  @action.bound
  public addProfit() {
    const sumSell = this.profits.reduce((acc, profitItem) => (
      acc + profitItem.amountToSell
    ), 0);
    const difference = 100 - sumSell
    let amountToSell = 0;
    if (100 - sumSell > 20) {
      amountToSell = difference
    } else {
      const maxAmountToSell = this.profits.reduce((acc, profitItem, index) => (
        profitItem.amountToSell > acc.value
          ? {value: profitItem.amountToSell, index}
          : acc
      ), {value: 0, index: 0});
      this.profits[maxAmountToSell.index].amountToSell = maxAmountToSell.value - 20 + difference;
      amountToSell = 20;
    }
    const profit = this.profitsCount === 0 ? 2 : this.profits[this.profitsCount - 1].profit + 2
    this.profits.push({
      id: this.profits[this.profitsCount - 1].id + 1,
      profit,
      targetPrice: this.price + (this.price * profit/100),
      amountToSell: amountToSell,
    })
  }

  @action.bound
  public setAmountToSell(amountToSell: number, id: number) {
    const updatedIndex = this.profits.findIndex(item => item.id === id);
    this.profits[updatedIndex].amountToSell = amountToSell; 
  }

  @action.bound
  public setShowProfit(showProfit: boolean) {
    if (showProfit) {
      this.profits.push({
        id: this.profitsCount,
        profit: 2,
        targetPrice: this.targetPrice,
        amountToSell: 100
      });
    } else {
      this.profits = [];
    }
    this.showProfit = showProfit;
  }

  @action.bound
  public deleteProfitItem(event: any, id: number) {
    event.preventDefault();
    this.profits = this.profits.filter(item => item.id !== id);
    if (this.profitsCount === 0) {
      this.setShowProfit(false)
    };
  }

  @action.bound
  public setOrderSide(side: OrderSide) {
    this.activeOrderSide = side;
  }

  @action.bound
  public setPrice(price: number) {
    this.price = price;
    this.profits = this.profits.map(item => {
      return {
        ...item,
        targetPrice: this.price + (this.price * item.profit/100)
      }
    })
  }

  @action.bound
  public setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  public setTotal(total: number) {
    this.amount = this.price > 0 ? total / this.price : 0;
  }

  @action.bound
  public submitValidator() {
    const currentErrors = this.profits.map((item, index) => {
      const {id, profit, targetPrice} = item;
      let profitMessage = '', targetPriceMessage = '', amountToSellMessage = '';
      const sumProfit = this.profits.reduce((acc, item) => ( acc + item.profit ), 0);
      if (profit < 0.01) {
        profitMessage = ERROR_PROFIT_MIN;
      } else if (sumProfit > 500) {
        profitMessage = ERROR_PROFIT_MAX;
      } else if (index !== 0 && profit < this.profits[index - 1].profit) {
        profitMessage = ERROR_PROFIT_PREV;
      }
      if (targetPrice <= 0) {
        targetPriceMessage = ERROR_TARGET_PRICE_GREATER;
      }
      const sumAmounts = this.profits.reduce((acc, item) => ( acc + item.amountToSell ), 0);
      if (sumAmounts > 100) {
        amountToSellMessage = `${sumAmounts} ${ERROR_TARGET_AMOUNT} ${-(100 - sumAmounts)}`
      }
      const errorMessages = {
        id,
        profit: profitMessage,
        targetPrice: targetPriceMessage,
        amountToSell: amountToSellMessage,
      };
      return errorMessages;
    });
    this.setErrors(currentErrors);
  }
}
