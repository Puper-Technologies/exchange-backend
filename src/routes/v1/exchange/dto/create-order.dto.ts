export class CreateNewOrderDto {
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  quoteOrderQty: number;
  newOrderResp: string;
}
