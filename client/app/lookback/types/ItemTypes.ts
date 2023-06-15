export const ItemTypes = {
  card: "card",
} as const;

export type ItemTypes = typeof ItemTypes[keyof typeof ItemTypes];