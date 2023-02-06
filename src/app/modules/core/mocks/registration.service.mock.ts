import {UserRegistration} from "../models/UserRegistration";

const mockUser1: UserRegistration = {
  name:"Vukasin",
  surname:"Bogdanovic",
  telephoneNumber:"0653614028",
  email:"vukasinzbogdanovic@email.com",
  address:"Radnicka 54",
  password:"vulejecar",
};

const mockUserArray: UserRegistration[] = [mockUser1];

export { mockUser1, mockUserArray };
