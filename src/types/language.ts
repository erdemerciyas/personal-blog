export interface Language {
  _id: string;
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  isDefault: boolean;
  isActive: boolean;
  direction: 'ltr' | 'rtl';
}
