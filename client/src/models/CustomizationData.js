export class CustomizationData {
  static sizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  static sugarLevels = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'extra', label: 'Extra' }
  ];

  static iceLevels = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'extra', label: 'Extra' }
  ];

  static temperatures = [
    { value: 'hot', label: 'Hot' },
    { value: 'cold', label: 'Cold' }
  ];

  static toppings = [
    { key: 'hasBoba', label: 'Boba' },
    { key: 'hasAiyuJelly', label: 'Aiyu Jelly' }
  ];

  constructor() {
    this.size = 'medium';
    this.sugarLevel = 'medium';
    this.iceLevel = 'medium';
    this.temperature = 'cold';
    this.hasBoba = false;
    this.hasAiyuJelly = false;
    this.quantity = 1;
  }
}
