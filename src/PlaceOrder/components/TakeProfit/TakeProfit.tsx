/* eslint @typescript-eslint/no-use-before-define: 0 */

import React from "react";
import block from "bem-cn-lite";
import { AddCircle, Cancel } from "@material-ui/icons";

import { useStore } from "../../context";
import { observer } from "mobx-react";

import { Switch, TextButton, NumberInput } from "components";

import { QUOTE_CURRENCY } from "../../constants";
import { OrderSide } from "../../model";
import "./TakeProfit.scss";

type Props = {
  orderSide: OrderSide;
};

const b = block("take-profit");

const TakeProfit =  observer(({ orderSide }: Props) => {
  const {
    deleteProfitItem,
    setAmountToSell,
    setTargetPrice,
    setShowProfit,
    setProfit,
    addProfit,
    setErrors,
    errors,
    profits,
    showProfit,
    profitsCount,
    projectedFit 
  } = useStore();

  const handleChangeTargetPrice = (value: number, id: number) => {
    setTargetPrice(value, id);
    setErrors([]);
  };

  const handleChangeProfit = (value: number, id: number) => {
    setProfit(Number(value), Number(id));
    setErrors([]);
  };

  return (
    <div className={b()}>
      <div className={b("switch")}>
        <span>Take profit</span>
        <Switch 
          onChange={setShowProfit} 
          checked={showProfit}
        />
      </div>
      {
        showProfit && 
          <div className={b("content")}>
            {renderTitles()}
            {
            profits.map((item) => (
                <React.Fragment key={item.id}>
                  {renderInputs(item.id)}
                </React.Fragment>
              ))
            }
            {
              profitsCount < 5 &&
              <TextButton onClick={addProfit} className={b("add-button")}>
                <AddCircle className={b("add-icon")} />
                <span>Add profit target {profitsCount}/5</span>
              </TextButton>
            }
            <div className={b("projected-profit")}>
              <span className={b("projected-profit-title")}>Projected profit</span>
              <span className={b("projected-profit-value")}>
                <span>{projectedFit}</span>
                <span className={b("projected-profit-currency")}>
                  {QUOTE_CURRENCY}
                </span>
              </span>
            </div>
          </div>
      }
      </div>
  );
  function renderInputs(id: number) {
    const item = profits.find(item => item.id === id);
    const errorMessages = errors.find(item => item.id === id);
    return (
      item &&
      <div className={b("inputs")}>
        <NumberInput
          value={item.profit}
          onBlur={(value) => { handleChangeProfit(Number(value), Number(id)) }
          }
          decimalScale={2}
          InputProps={{ endAdornment: "%" }}
          variant="underlined"
          error={errorMessages?.profit}
        />
        <NumberInput
          value={item.targetPrice}
          onBlur={(value) => {
              handleChangeTargetPrice(Number(value), Number(id));
            }
          }
          decimalScale={2}
          InputProps={{ endAdornment: QUOTE_CURRENCY }}
          variant="underlined"
          error={errorMessages?.targetPrice}
        />
        <NumberInput
          value={item.amountToSell}
          onBlur={(value) => {
            setAmountToSell(Number(value), Number(id))
            setErrors([]);
          }
        }
          decimalScale={2}
          InputProps={{ endAdornment: "%" }}
          variant="underlined"
          error={errorMessages?.amountToSell}
        />
        <div className={b("cancel-icon")}>
          <TextButton className={b('cancel-button')} onClick={(event) => deleteProfitItem(event, id)}><Cancel /></TextButton>
        </div>
      </div>
    );
  }

  function renderTitles() {
    return (
      <div className={b("titles")}>
        <span>Profit</span>
        <span>Target price</span>
        <span>Amount to {orderSide === "buy" ? "sell" : "buy"}</span>
      </div>
    );
  }
});

export { TakeProfit };
