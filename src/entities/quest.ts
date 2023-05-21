export class quest {
  name?: string;
  description?: string;
  progress?: number;
  duration?: number;
  completion?: boolean;
  category?: 'daily' | 'weekly' | 'monthly';
  reward?: any;

  constructor() {
    this.progress = 0;
    this.completion = false;
  }
}
