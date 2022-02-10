export interface JwtPayload {
  uid: string
  claims: {
    userId: string
    email: string
    roles: string[]
    verified: boolean
    userName: string
  }
  userType: string[]
  iat: number
  exp: number
}
