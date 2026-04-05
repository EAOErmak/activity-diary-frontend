export type FoodUpsertDto = {
  dictionaryItemId: number;
  protein: number;
  fat: number;
  carbs: number;
  callories: number;
};

export type GeneralFoodResponseDto = {
  id: number;
  dictionaryItemId: number;
  dictionaryItemLabel: string;
  protein: number;
  fat: number;
  carbs: number;
  callories: number;
};

export type UserFoodResponseDto = {
  id: number;
  userId: number;
  dictionaryItemId: number;
  dictionaryItemLabel: string;
  protein: number;
  fat: number;
  carbs: number;
  callories: number;
};

export type FoodDictionaryOption = {
  id: number;
  label: string;
};
