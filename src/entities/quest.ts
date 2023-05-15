export class quest {
  name?: string;
  description?: string;
  progress?: 0;
  duration?: number | undefined;
  completion?: false;
  category?: 'daily' | 'weekly' | 'monthly';
  reward?: any;
}
