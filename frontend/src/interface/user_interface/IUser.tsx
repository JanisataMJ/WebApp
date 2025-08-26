export interface SignInInterface {

    email?: string;
  
    password?: string;
  
  }


  export interface InterfaceStatusWriter {

    ID?: number;

    writer: boolean;
    
  }

  export interface InterfaceIncome {

    ID?: number;

    income: number;
    
  }

  export interface UsersInterface {
    Profile?:     string;
    ID?:          number;
    FirstName?:   string;
    LastName?:    string;
    Email?:       string;
    Phone?:       string;
    Age?:         number;
    BirthDay?:    string;
    GenderID?:    number;
    Password?:    string;
    RoleID?:      number;
  }
    
 