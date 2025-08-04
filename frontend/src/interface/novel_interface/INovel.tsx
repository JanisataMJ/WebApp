export interface Novel {
    ID: number;
    novel_name: string;
    content: string;
    description: string;
    novel_type1: string;
    novel_type2: string;
    rate: string;
    writername: string;
    cover: string;
    novel_price: number;
    novel_like: number;
    buy_amount: number;
    writer_id: string;
    Writer: {
      user_name: string;
      email: string;
    };
  }
  


  export interface NovelBuy {
    buy_amount: number;
  }