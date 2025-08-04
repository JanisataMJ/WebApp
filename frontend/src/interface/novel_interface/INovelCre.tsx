interface Coin {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    balance: number;
  }
  
  interface User {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    userName: string;
    email: string;
    idType: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    profile: string;
    coinID: number;
    coin: Coin;
    transaction?: any;
    order?: any;
  }
  
  interface Writer {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    income: number;
    userId: number;
    user: User;
  }
  
  export interface NovelCre {
        id: number;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string | null;
        name: string;
        content: string;
        type: string;
        rate: string;
        cover: string;
        price: number;
        like: number;
        buyAmount: number;
        bookshelf?: Bookshelf[];
        writerId: number;
        writer: Writer;
      }
  
  interface Bookshelf {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    userId: number;
    user: User;
    novel: NovelCre[];
  }
  