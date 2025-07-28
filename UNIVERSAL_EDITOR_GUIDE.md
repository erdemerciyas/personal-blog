# Universal Editor - Basit ve Güvenli Metin Editörü

Bu proje basit, güvenli ve platform bağımsız bir textarea tabanlı editör içerir.

## ✨ Özellikler

- 🔒 Güvenli input handling
- 📱 Responsive tasarım
- 🌐 Tüm platformlarda çalışır
- ⚡ Hızlı ve hafif
- 🚀 GitHub/Vercel uyumlu
- 📊 Karakter sayacı

## 🚀 Kullanım

### Temel Kullanım
```tsx
import UniversalEditor from '@/components/ui/UniversalEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <UniversalEditor
      value={content}
      onChange={setContent}
      placeholder="İçeriğinizi yazın..."
    />
  );
}
```

### Özelleştirilmiş Kullanım
```tsx
<UniversalEditor
  value={content}
  onChange={setContent}
  placeholder="Özel placeholder..."
  rows={10}
  disabled={loading}
  className="custom-styles"
/>
```

## 📋 API Referansı

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `value` | string | - | Editör içeriği (zorunlu) |
| `onChange` | function | - | İçerik değişiklik callback'i (zorunlu) |
| `placeholder` | string | 'İçeriğinizi buraya yazın...' | Placeholder metni |
| `className` | string | '' | Ek CSS sınıfları |
| `rows` | number | 6 | Textarea satır sayısı |
| `disabled` | boolean | false | Editörü devre dışı bırak |

## 🌐 Platform Desteği

- ✅ Windows, macOS, Linux
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile ve tablet
- ✅ GitHub Codespaces
- ✅ Vercel deployment
- ✅ Tüm hosting platformları

## 📦 Deployment

### Vercel
- Zero configuration
- Otomatik deployment
- Edge functions uyumlu

### GitHub Pages
- Static export uyumlu
- Client-side rendering
- CDN optimized

## 🔒 Güvenlik

- Input validation
- XSS koruması (textarea doğası gereği)
- Güvenli state management
- No dangerous HTML rendering

## 📊 Performance

- Bundle size: ~2KB
- Zero external dependencies
- Optimized re-renders
- Memory efficient

## 🧪 Test

```typescript
import { render, fireEvent } from '@testing-library/react';
import UniversalEditor from '@/components/ui/UniversalEditor';

test('metin girişi çalışır', () => {
  const handleChange = jest.fn();
  const { getByRole } = render(
    <UniversalEditor value="" onChange={handleChange} />
  );
  
  fireEvent.change(getByRole('textbox'), { 
    target: { value: 'Test içeriği' } 
  });
  
  expect(handleChange).toHaveBeenCalledWith('Test içeriği');
});
```

## 📄 Lisans

MIT License - Özgürce kullanabilirsiniz.