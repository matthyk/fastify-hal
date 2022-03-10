export function isPrimitiveValue(value: unknown): boolean {
  const type = typeof value

  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true
  }

  return !!(Array.isArray(value) && value[0] && isPrimitiveValue(value[0]))
}

export function copyPrimitiveProperties<T, R>(source: T, target: R): R {
  for (const [key, value] of Object.entries(source)) {
    if (isPrimitiveValue(value)) {
      target[key as keyof R] = value
    }
  }

  return target
}
