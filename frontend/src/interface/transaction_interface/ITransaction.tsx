export interface ITransaction {
    CreatedAt: string;
    trans_type: string;
    payment?: string;
    user_id: number;
    package_id?: number | null;
    order_id?: number | null;
    amount_t: number; 
  }
  export interface ICreTransaction {
    trans_type: string;
    payment?: string;
    user_id: number;
    package_id?: number | null;
    order_id?: number | null;
    amount_t: number; 
  }