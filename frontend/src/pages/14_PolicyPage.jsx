import React, { useEffect, useState } from 'react';

export default function PolicyPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  return (
    <div className={`min-h-screen bg-[#E3DAD1] p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <div className="max-w-4xl mx-auto bg-[#E3DAD1] rounded-[4rem] shadow-2xl p-10 md:p-20 text-right border-2 border-[#304B60]/5">
        <h2 className="text-4xl font-black text-[#304B60] mb-12 border-r-8 border-[#D48161] pr-6 leading-tight">
          سياسة الخصوصية
        </h2>

        <div className="space-y-8 text-[#304B60] font-bold leading-relaxed text-lg text-justify">
          <p className="text-xl">نرحب بك في تطبيق كاريرك.</p>
          <p>نحن نولي أهمية كبيرة لخصوصيتك وحماية بياناتك الشخصية، ونلتزم بالتعامل معها بشفافية ومسؤولية، وفق المبادئ العامة لحماية البيانات المعمول بها في الدول العربية، وبما يتوافق مع القوانين المحلية ذات الصلة في كل دولة.</p>
          <p>باستخدامك لتطبيق كاريرك، فإنك تقرّ بموافقتك على سياسة الخصوصية هذه.</p>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">1. التعريف بالتطبيق</h3>
            <p>كاريرك هو تطبيق إقليمي متخصص في:</p>
            <ul className="list-disc pr-8 space-y-2 mt-2">
              <li>الموارد البشرية</li>
              <li>التوظيف وفرص العمل</li>
              <li>الدورات التدريبية والتعليمية</li>
              <li>الكورسات الأونلاين</li>
              <li>الاستشارات المهنية والتطوير الوظيفي</li>
            </ul>
            <p className="mt-2">ويخدم المستخدمين في مختلف الدول العربية.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">2. نطاق تطبيق سياسة الخصوصية</h3>
            <p>تنطبق هذه السياسة على جميع مستخدمي تطبيق كاريرك في الدول العربية، بغض النظر عن بلد الإقامة، مع مراعاة القوانين واللوائح المحلية المتعلقة بحماية البيانات الشخصية.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">3. المعلومات التي نقوم بجمعها</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-xl mb-2 text-[#304B60]">أ. المعلومات التي يقدّمها المستخدم</h4>
                <p>قد نقوم بجمع المعلومات التالية عند التسجيل أو استخدام خدمات التطبيق:</p>
                <ul className="list-disc pr-8 space-y-1 mt-2">
                  <li>الاسم، البريد الإلكتروني، رقم الهاتف</li>
                  <li>الدولة والمدينة (إن وُجدت)</li>
                  <li>السيرة الذاتية (CV) والمؤهلات والخبرات المهنية</li>
                  <li>المهارات والدورات التدريبية</li>
                  <li>الاهتمامات والمسارات الوظيفية</li>
                  <li>أي معلومات إضافية يختار المستخدم مشاركتها طوعًا</li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-xl mb-2 text-[#304B60]">ب. المعلومات التقنية</h4>
                <p>قد نجمع معلومات تقنية لأغراض تشغيلية وتحسينية، مثل: نوع الجهاز، نظام التشغيل، معرفات التطبيق، سجل الاستخدام، وتقارير الأداء.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">4. أهداف جمع واستخدام البيانات</h3>
            <p>نستخدم المعلومات للأغراض التالية:</p>
            <ul className="list-disc pr-8 space-y-1 mt-2">
              <li>إنشاء وإدارة حساب المستخدم</li>
              <li>تمكين خدمات التوظيف والموارد البشرية</li>
              <li>عرض الوظائف والدورات المناسبة</li>
              <li>تقديم المحتوى التعليمي والاستشاري</li>
              <li>تحسين جودة الخدمات وتجربة المستخدم</li>
              <li>الامتثال للمتطلبات القانونية والتنظيمية في الدول العربية</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">5. مشاركة البيانات</h3>
            <p>نلتزم بعدم بيع أو تأجير البيانات الشخصية للمستخدمين. قد تتم مشاركة بعض البيانات في حدود الضرورة مع جهات التوظيف، مزودي الخدمات التقنيين، أو عند وجود التزام قانوني.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">6. نقل البيانات عبر الحدود</h3>
            <p>نظرًا للطبيعة الإقليمية للتطبيق، قد يتم تخزين أو معالجة البيانات على خوادم خارج بلد المستخدم، مع الالتزام باتخاذ التدابير اللازمة لحمايتها.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">7. أمن وحماية المعلومات</h3>
            <p>نطبق إجراءات أمنية تشمل تقنيات التشفير المعتمدة وأنظمة الوصول المحدودة، مع الإقرار بأن أي نظام إلكتروني لا يمكن ضمان أمانه بنسبة 100%.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">8. الاحتفاظ بالبيانات</h3>
            <p>نحتفظ ببيانات المستخدم طالما كان الحساب نشطًا أو حسب الحاجة لتقديم الخدمات. يمكن للمستخدم طلب حذف بياناته في أي وقت.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">9. حقوق المستخدم</h3>
            <p>يتمتع المستخدم بحق الاطلاع على بياناته، تعديلها، طلب حذف الحساب، سحب الموافقة، والتحكم في الإشعارات.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">10. التوظيف، الدورات، والاستشارات</h3>
            <p>لا يضمن التطبيق الحصول على وظيفة. المحتوى التدريبي والاستشاري ذو طابع إرشادي وتطويري، ويعتمد نجاح الاستفادة على تفاعل المستخدم.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">11. خصوصية القاصرين</h3>
            <p>خدمات كاريرك موجهة للمستخدمين بعمر 18 عامًا فما فوق، ولا نقوم بجمع بيانات القاصرين عن قصد.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">12. التعديلات على سياسة الخصوصية</h3>
            <p>نحتفظ بالحق في تحديث سياسة الخصوصية، وسيتم إشعار المستخدمين بأي تغييرات جوهرية.</p>
          </section>

          <section className="pt-10 border-t border-[#304B60]/10">
            <h3 className="text-2xl font-black mb-4 text-[#304B60]">13. التواصل معنا</h3>
            <p>لأي استفسارات أو طلبات تتعلق بالخصوصية:</p>
            <p className="font-black mt-2">البريد الإلكتروني: <span className="underline text-[#D48161]">careerak.hr@gmail.com</span></p>
            <p>أو من خلال إعدادات التطبيق المعتمدة.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
