const f = (en, ar) => ({ en, ar })

export const locations = [
  { id: 'cai', name: f('Cairo International Airport', 'مطار القاهرة الدولي') },
  { id: 'nasr', name: f('Nasr City', 'مدينة نصر') },
  { id: 'maadi', name: f('Maadi', 'المعادي') },
  { id: 'heliopolis', name: f('Heliopolis', 'مصر الجديدة') },
  { id: 'october', name: f('6th of October City', 'مدينة 6 أكتوبر') },
]

// Daily price per extra, EGP.
export const extras = [
  { id: 'driver', priceEgp: 150, name: f('Additional driver', 'سائق إضافي') },
  { id: 'insurance', priceEgp: 200, name: f('Full insurance cover', 'تأمين شامل') },
  { id: 'childseat', priceEgp: 100, name: f('Child seat', 'مقعد أطفال') },
  { id: 'wifi', priceEgp: 80, name: f('Mobile Wi-Fi hotspot', 'راوتر إنترنت متنقل') },
]

export const services = [
  { id: 'airport', icon: 'plane', title: f('Airport pick-up', 'استلام من المطار'), text: f('Collect your car at Cairo Airport, at any hour of the day.', 'استلم سيارتك من مطار القاهرة في أي ساعة.') },
  { id: 'pricing', icon: 'tag', title: f('Transparent pricing', 'أسعار واضحة'), text: f('One daily price. Extras and VAT are shown before you confirm.', 'سعر يومي واحد. الإضافات والضريبة تظهر قبل التأكيد.') },
  { id: 'locations', icon: 'pin', title: f('Five pick-up points', 'خمس نقاط استلام'), text: f('Nasr City, Maadi, Heliopolis, 6th of October and the airport.', 'مدينة نصر والمعادي ومصر الجديدة و6 أكتوبر والمطار.') },
  { id: 'unlimited', icon: 'road', title: f('Unlimited kilometres', 'كيلومترات غير محدودة'), text: f('Drive as far as you like, with no mileage counting.', 'قُد إلى أي مدى تريد دون حساب للكيلومترات.') },
  { id: 'support', icon: 'phone', title: f('Help on the road', 'مساعدة على الطريق'), text: f('A real person answers our support line every day.', 'يرد عليك شخص حقيقي على خط الدعم كل يوم.') },
  { id: 'flex', icon: 'calendar', title: f('Flexible changes', 'تعديل مرن'), text: f('Cancel free up to 24 hours before pick-up.', 'إلغاء مجاني حتى 24 ساعة قبل الاستلام.') },
]

export const testimonials = [
  { id: 'r1', avatar: 'ava-1', name: f('Ahmed Samir', 'أحمد سمير'), role: f('Business traveller', 'مسافر أعمال'), quote: f('Picked up at the airport in ten minutes. The price on the screen was the price I paid.', 'استلمت من المطار في عشر دقائق. السعر على الشاشة هو ما دفعته.') },
  { id: 'r2', avatar: 'ava-2', name: f('Laila Hassan', 'ليلى حسن'), role: f('Family trip', 'رحلة عائلية'), quote: f('We took the GLS to Ain Sokhna with five people and luggage. No stress at all.', 'أخذنا الـGLS إلى العين السخنة بخمسة أشخاص وأمتعة. بدون أي توتر.') },
  { id: 'r3', avatar: 'ava-3', name: f('Karim Adel', 'كريم عادل'), role: f('Weekend driver', 'قيادة نهاية الأسبوع'), quote: f('Cancelling took one minute in My Bookings. That is how it should be.', 'الإلغاء استغرق دقيقة من صفحة حجوزاتي. هكذا يجب أن يكون.') },
  { id: 'r4', avatar: 'ava-4', name: f('Nadine Fathy', 'نادين فتحي'), role: f('Wedding guest', 'ضيفة زفاف'), quote: f('The Mercedes coupe arrived spotless. Friendly handover and clear terms.', 'وصلت كوبيه المرسيدس نظيفة تمامًا. تسليم ودود وشروط واضحة.') },
]

export const faqs = [
  { id: 'age', q: f('Who can rent a car?', 'من يمكنه استئجار سيارة؟'), a: f('Drivers aged 21 or over with a valid license held for at least one year. Luxury cars require 25 or over.', 'السائقون من عمر 21 سنة فأكثر برخصة سارية منذ سنة على الأقل. السيارات الفاخرة تتطلب 25 سنة فأكثر.') },
  { id: 'docs', q: f('What do I bring at pick-up?', 'ماذا أحضر عند الاستلام؟'), a: f('Your driving license, national ID or passport, and the payment method you chose.', 'رخصة القيادة وبطاقة الرقم القومي أو جواز السفر ووسيلة الدفع التي اخترتها.') },
  { id: 'cancel', q: f('Can I cancel?', 'هل يمكنني الإلغاء؟'), a: f('Yes. Cancellation is free up to 24 hours before pick-up. You can do it from My Bookings.', 'نعم. الإلغاء مجاني حتى 24 ساعة قبل الاستلام. يمكنك ذلك من صفحة حجوزاتي.') },
  { id: 'fuel', q: f('What is the fuel policy?', 'ما هي سياسة الوقود؟'), a: f('Return the car with the fuel level you received it with. Electric cars are handed over fully charged.', 'أعد السيارة بنفس مستوى الوقود الذي استلمتها به. السيارات الكهربائية تُسلَّم مشحونة بالكامل.') },
  { id: 'km', q: f('Is mileage limited?', 'هل الكيلومترات محدودة؟'), a: f('No. Every rental includes unlimited kilometres within Egypt.', 'لا. كل إيجار يشمل كيلومترات غير محدودة داخل مصر.') },
]

export const posts = [
  {
    id: 'choose-the-right-car',
    image: 'blog-1',
    date: '2026-09-02',
    minutes: 4,
    title: f('How to choose the right rental car', 'كيف تختار سيارة الإيجار المناسبة'),
    excerpt: f('Seats, luggage, fuel and budget: four questions that decide the right car in under a minute.', 'المقاعد والأمتعة والوقود والميزانية: أربعة أسئلة تحدد السيارة المناسبة في أقل من دقيقة.'),
    body: [
      f('Start with people and bags, not with the car you would like to own. Four adults and two large suitcases need a sedan with a real boot or an SUV; a coupe will not do.', 'ابدأ بعدد الأشخاص والحقائب لا بالسيارة التي تتمنى امتلاكها. أربعة بالغين وحقيبتان كبيرتان يحتاجون سيدان بصندوق حقيقي أو SUV، والكوبيه لن تناسب.'),
      f('Next, think about the route. City driving rewards a compact car that parks easily. A long highway day is far more comfortable in a larger sedan with cruise control.', 'بعد ذلك فكّر في الطريق. القيادة داخل المدينة تناسب سيارة صغيرة سهلة الركن. أما يوم طويل على الطريق السريع فأريح بكثير في سيدان أكبر بمثبت سرعة.'),
      f('Finally, compare the whole price, not only the daily rate: extras, insurance and VAT add up. Our booking page shows the full total before you confirm.', 'أخيرًا قارن السعر الكامل لا السعر اليومي فقط: الإضافات والتأمين والضريبة تتراكم. صفحة الحجز لدينا تعرض الإجمالي كاملًا قبل التأكيد.'),
    ],
  },
  {
    id: 'driving-in-cairo',
    image: 'blog-3',
    date: '2026-09-16',
    minutes: 5,
    title: f('Driving in Cairo: four tips for visitors', 'القيادة في القاهرة: أربع نصائح للزائرين'),
    excerpt: f('Traffic, parking and navigation, explained by people who drive here every day.', 'الزحام والركن والملاحة، يشرحها أناس يقودون هنا كل يوم.'),
    body: [
      f('Avoid the busiest windows if you can: weekday mornings from eight to ten and evenings from four to seven. A short delay in your start time can save an hour.', 'تجنب أوقات الذروة إن استطعت: صباح أيام العمل من الثامنة إلى العاشرة ومساءً من الرابعة إلى السابعة. تأخير بسيط في الانطلاق قد يوفر ساعة.'),
      f('Use a navigation app with live traffic and download offline maps in case the signal drops in tunnels.', 'استخدم تطبيق ملاحة بحركة المرور المباشرة ونزّل الخرائط دون اتصال تحسبًا لانقطاع الإشارة في الأنفاق.'),
      f('Drive defensively, keep a safe distance and expect lane changes without signals. Horns are communication here, not aggression.', 'قُد بحذر وحافظ على مسافة آمنة وتوقع تغيير المسارات دون إشارة. الزمور هنا وسيلة تواصل لا عدوان.'),
      f('Parking: prefer paid lots and hotel garages over street spots, and take photos of the car before you leave it.', 'الركن: فضّل المواقف المدفوعة وجراجات الفنادق على الشارع، والتقط صورًا للسيارة قبل أن تتركها.'),
    ],
  },
  {
    id: 'before-you-drive-away',
    image: 'polo',
    date: '2026-10-01',
    minutes: 3,
    title: f('What to check before you drive away', 'ما الذي تفحصه قبل أن تنطلق'),
    excerpt: f('A two-minute walk-around protects you and the car. Here is the checklist we use.', 'جولة دقيقتين حول السيارة تحميك وتحمي السيارة. هذه قائمة الفحص التي نستخدمها.'),
    body: [
      f('Walk around the car with our agent and note any scratches or dents on the handover form. Photograph anything you find, including the wheels.', 'تجول حول السيارة مع موظفنا ودوّن أي خدوش أو تعرجات في نموذج التسليم. صوّر كل ما تجده بما في ذلك العجلات.'),
      f('Inside, check the fuel level, the air conditioning, the lights and the spare tyre. Make sure the paperwork is in the glove box.', 'في الداخل افحص مستوى الوقود والتكييف والأنوار والإطار الاحتياطي. وتأكد من وجود الأوراق في الدرج.'),
      f('Ask how to reach support, and save the number before you leave the lot.', 'اسأل عن طريقة الوصول إلى الدعم واحفظ الرقم قبل مغادرة الموقف.'),
    ],
  },
]

export const postById = (id) => posts.find((p) => p.id === id)
