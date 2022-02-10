type InternalException = {
  status: number
  code: string
  log?: string
  isInternalException: boolean
}

const generic = (status: number, code: string, log?: string): InternalException => ({
  status,
  code,
  log,
  isInternalException: true,
})

export default {
  internalServerError: (code?: string, log?: string) =>
    generic(500, code || 'INTERNAL_SERVER_ERROR', log),
  forbidden: (code?: string, log?: string) => generic(403, code || 'FORBIDDEN', log),
  invalid: (code?: string, log?: string) => generic(400, code || 'INVALID', log),
  badRequest: (code?: string, log?: string) => generic(400, code || 'BAD_REQUEST', log),
  unauthorised: (code?: string, log?: string) => generic(401, code || 'UNAUTHORISED', log),
  notFound: (code?: string, log?: string) => generic(404, code || 'NOT_FOUND', log),
  conflict: (code?: string, log?: string) => generic(409, code || 'ALREADY_EXISTS', log),
  validationFailed: (code?: string, log?: string) => generic(422, code || 'UNPROCESSABLE', log),
  custom: (status: number, code: string, log?: string) => generic(status, code, log),
}
