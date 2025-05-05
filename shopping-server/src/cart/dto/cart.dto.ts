export class CreateCartItemDto {
  productId: number;
  quantity: number;
  specs?: Record<string, string>;
}

export class UpdateCartItemDto {
  quantity?: number;
  selected?: boolean;
} 