export interface Item {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  status: 'actif' | 'inactif';
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ItemFormData {
  name: string;
  description: string;
  category: string;
  status: 'actif' | 'inactif';
  price: number;
  quantity: number;
}
