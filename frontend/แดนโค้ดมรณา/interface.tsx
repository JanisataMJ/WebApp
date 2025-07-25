
  export interface Package {
    ID: number;
    pack_amount: number;
    pack_price: number;
    pack_pic: string;
  }




 
  
  export interface UsersInterface {
    id: string;
    username: string;
    email: string;
    password?: string;
    created_at?: Date;
    updated_at?: Date;
  }
  



  
  export interface PackageInterface {
    id: string;
    Amount: string;
    price: number;
    Pic: Date;
    updated_at?: Date;
  }
  
  export interface CoinInterface {
    id: string;
    package_id: string;
    amount: number;
    price: number;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface GendersInterface {
    id: string;
    name: string;
  }

  
  
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



interface Bookshelf {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  userId: number;
  user: User;
}
