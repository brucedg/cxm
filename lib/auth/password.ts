import argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

const PASSWORD_MIN_LENGTH = 10
const PASSWORD_REGEX_UPPER = /[A-Z]/
const PASSWORD_REGEX_LOWER = /[a-z]/
const PASSWORD_REGEX_DIGIT = /[0-9]/
const PASSWORD_REGEX_SPECIAL = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/

export type PasswordError = {
  valid: false
  errors: string[]
}

export type PasswordValid = {
  valid: true
  errors: []
}

export function validatePassword(password: string): PasswordValid | PasswordError {
  const errors: string[] = []

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Must be at least ${PASSWORD_MIN_LENGTH} characters`)
  }
  if (!PASSWORD_REGEX_UPPER.test(password)) {
    errors.push('Must contain at least one uppercase letter')
  }
  if (!PASSWORD_REGEX_LOWER.test(password)) {
    errors.push('Must contain at least one lowercase letter')
  }
  if (!PASSWORD_REGEX_DIGIT.test(password)) {
    errors.push('Must contain at least one digit')
  }
  if (!PASSWORD_REGEX_SPECIAL.test(password)) {
    errors.push('Must contain at least one special character')
  }

  if (errors.length > 0) return { valid: false, errors }
  return { valid: true, errors: [] }
}
