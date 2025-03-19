export class UnreachableCaseError extends Error {
	constructor(val: never) {
		super(`Unreachable case: ${val}`)
	}
}

export function assertEmpty(obj: Record<string, never>, throwError = true) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { 'data-test': dataTest, ...rest } = obj // exclude data-test

	if (Object.keys(rest).length > 0 && throwError) {
		throw new Error(`Object must be empty ${JSON.stringify(obj)}`)
	}
}
