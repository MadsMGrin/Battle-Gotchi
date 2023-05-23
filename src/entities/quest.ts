export class quest {
  name?: string;
  description?: string;
  action?: string;
  progress?: number;
  duration?: any;
  completion?: number;
  category?: 'daily' | 'weekly' | 'monthly';
  reward?: any;

  constructor() {
    this.progress = 0;
  }
}
