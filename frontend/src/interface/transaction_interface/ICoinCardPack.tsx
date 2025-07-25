export interface ICoinCardPack {
    key: number;
    amount: number;
    price: number;
    imgSrc: string;
    sendData: (amount: number, price: number, key: number) => void
  }
