import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/__tests__/**/*.[jt]s?(x)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
}

export default config
