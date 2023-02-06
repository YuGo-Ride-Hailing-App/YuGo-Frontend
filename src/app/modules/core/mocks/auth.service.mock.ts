import {Token} from "../models/Token";
const loginCredentials01: { password: string | null | undefined; email: string | null | undefined } = {
  password:"Password123",
  email:"pera.peric@email.com"
};
const token01:Token = {
  accessToken: "default-access-token",
  refreshToken: "default-refresh-token"
}

export {loginCredentials01, token01}
