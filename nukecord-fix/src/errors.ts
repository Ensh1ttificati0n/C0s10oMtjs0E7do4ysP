const userAbortError = new Error('Received abort signal, quitting.')
userAbortError.name = 'USER_ABORT'

const userDeclinedError = new Error('User declined to proceed.')
userDeclinedError.name = 'USER_DECLINED'

export { userAbortError, userDeclinedError }
