import { Product, MerchantSettings } from '../types';

export const DEFAULT_SHOES: Product[] = [
  {
    id: 'def-prod-1',
    name: 'نايكي إير ماكس أحمر رياضي',
    brand: 'Nike',
    description: 'حذاء نايكي إير ماكس الرياضي يجمع بين الراحة الفائقة والتصميم العصري المبتكر. مجهز بنعل وسطي مبطن بالهواء لتخفيف الصدمات، مثالي للجري والتمارين الشاقة والاستخدام اليومي بكفاءة عالية.',
    price: 2450,
    originalPrice: 3100,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'أحذية رياضية',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ['#EF4444', '#111827', '#3B82F6'],
    inStock: true,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'def-prod-2',
    name: 'حذاء كاجوال زاهي الألوان',
    brand: 'Adidas',
    description: 'حذاء عصري فريد مستوحى من ثقافة أزياء الشارع مع لوحة ألوان دافئة ونشطة. يوفر تجربة مشي ناعمة للغاية بفضل البطانة الإسفنجية الداخلية المكثفة والياقة المرنة الداعمة للكاحل.',
    price: 1890,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'أحذية كاجوال',
    sizes: [37, 38, 39, 40, 41],
    colors: ['#F472B6', '#10B981', '#F59E0B', '#FFFFFF'],
    inStock: true,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'def-prod-3',
    name: 'حذاء كلاسيك جلدي فاخر بفتحات تهوية',
    brand: 'Oxford',
    description: 'مصنوع يدويًا من جلد بروغ الطبيعي الفاخر بنسبة 100٪. يتميز بنقوش كلاسيكية فريدة وإغلاق برباط ناعم، ليعطيك مظهرًا وقورًا ورسميًا يناسب الحفلات والمقابلات الرسمية الهامة.',
    price: 2999,
    originalPrice: 3800,
    images: [
      'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'أحذية كلاسيك',
    sizes: [41, 42, 43, 44, 45],
    colors: ['#78350F', '#1F2937'],
    inStock: true,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'def-prod-4',
    name: 'حذاء فلو أورانج كاجوال خفيف',
    brand: 'Vans',
    description: 'البساطة والشبابية في تصميم واحد للارتداء اليومي السريع والمريح. مصنوع من أقمشة كتانية متينة قابلة للتنفس مع نعل مطاطي مانع للانزلاق بالكامل يوفر ثباتًا فائقًا على كافة الأسطح.',
    price: 1100,
    originalPrice: 1450,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'أحذية كاجوال',
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ['#F59E0B', '#EF4444', '#111827'],
    inStock: true,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'def-prod-5',
    name: 'حذاء جري فليكس دارك أسود ومموه',
    brand: 'Puma',
    description: 'تم تصميم عائلة فليكس دارك للعدائين المحترفين الذين يفضلون الخفة القصوى وتدفق الهواء المستمر. النسيج الخارجي الشبكي يضمن برودة قدمك في أشد الأيام حرارة أثناء الجري وممارسة تسلق الصخور.',
    price: 1550,
    images: [
      'https://images.unsplash.com/photo-1508180589062-f182fc1699f3?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'أحذية رياضية',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['#111827', '#6B7280', '#3B82F6'],
    inStock: true,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'def-prod-6',
    name: 'حذاء رياضي أنيق مريح للنساء',
    brand: 'Nike',
    description: 'أضيفي نمط الحيوية والأناقة ليومك الطويل مع هذا الحذاء الرياضي خفيف الوزن المريح للقدمين. مناسب بالكامل لساعات العمل الطويلة أو التمارين الرياضية أو جولات التسوق المبهجة مع الصديقات.',
    price: 2100,
    originalPrice: 2500,
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600'
    ],
    category: 'أحذية نسائية',
    sizes: [36, 37, 38, 39, 40],
    colors: ['#60A5FA', '#F472B6', '#FFFFFF'],
    inStock: true,
    featured: true,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_SETTINGS: MerchantSettings = {
  whatsappNumber: '201017684532', // Example EGY phone
  messengerUsername: 'shoestore.pwa',
  currency: 'ج.م',
  storeName: 'خطوات الأناقة',
  storeSlogan: 'بوابتك إلى عالم الجودة والموضة في الأحذية العصرية'
};
