import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './13_PolicyPage.css';

const PolicyPage = ({ isModal }) => {
    const { startBgMusic, language } = useApp();

    useEffect(() => {
        if (!isModal) {
            startBgMusic();
        }
    }, [startBgMusic, isModal]);

    const isRTL = language === 'ar';
    const fontFamily = language === 'ar' 
        ? 'Amiri, Cairo, serif' 
        : language === 'fr' 
            ? 'EB Garamond, serif' 
            : 'Cormorant Garamond, serif';

    const content = {
        ar: {
            title: 'سياسة الخصوصية',
            welcome: 'نرحب بك في تطبيق كاريرك.',
            intro: 'نحن نولي أهمية كبيرة لخصوصيتك وحماية بياناتك الشخصية، ونلتزم بالتعامل معها بشفافية ومسؤولية، وفق المبادئ العامة لحماية البيانات المعمول بها في الدول العربية، وبما يتوافق مع القوانين المحلية ذات الصلة في كل دولة.',
            agreement: 'باستخدامك لتطبيق كاريرك، فإنك تقرّ بموافقتك على سياسة الخصوصية هذه.',
            sections: [
                {
                    title: '1. التعريف بالتطبيق',
                    content: 'كاريرك هو تطبيق إقليمي متخصص في:\n• الموارد البشرية\n• التوظيف وفرص العمل\n• الدورات التدريبية والتعليمية\n• الكورسات الأونلاين\n• الاستشارات المهنية والتطوير الوظيفي\nويخدم المستخدمين في مختلف الدول العربية.'
                },
                {
                    title: '2. نطاق تطبيق سياسة الخصوصية',
                    content: 'تنطبق هذه السياسة على جميع مستخدمي تطبيق كاريرك في الدول العربية، بغض النظر عن بلد الإقامة، مع مراعاة القوانين واللوائح المحلية المتعلقة بحماية البيانات الشخصية.'
                },
                {
                    title: '3. المعلومات التي نقوم بجمعها',
                    content: 'أ. المعلومات التي يقدّمها المستخدم\nقد نقوم بجمع المعلومات التالية عند التسجيل أو استخدام خدمات التطبيق:\n• الاسم\n• البريد الإلكتروني\n• رقم الهاتف\n• الدولة والمدينة (إن وُجدت)\n• السيرة الذاتية (CV)\n• المؤهلات والخبرات المهنية\n• المهارات والدورات التدريبية\n• الاهتمامات والمسارات الوظيفية\n• أي معلومات إضافية يختار المستخدم مشاركتها طوعًا\n\nب. المعلومات التقنية\nقد نجمع معلومات تقنية لأغراض تشغيلية وتحسينية، مثل:\n• نوع الجهاز ونظام التشغيل\n• معرفات التطبيق\n• عنوان IP (بشكل غير مباشر)\n• سجل استخدام التطبيق والتفاعل معه\n• تقارير الأعطال والأداء'
                },
                {
                    title: '4. أهداف جمع واستخدام البيانات',
                    content: 'نستخدم المعلومات للأغراض التالية:\n• إنشاء وإدارة حساب المستخدم\n• تمكين خدمات التوظيف والموارد البشرية\n• عرض الوظائف والدورات المناسبة\n• تقديم المحتوى التعليمي والاستشاري\n• تحسين جودة الخدمات وتجربة المستخدم\n• التواصل مع المستخدم بشأن التحديثات أو الخدمات\n• الامتثال للمتطلبات القانونية والتنظيمية في الدول العربية'
                },
                {
                    title: '5. مشاركة البيانات',
                    content: 'نلتزم بعدم بيع أو تأجير البيانات الشخصية للمستخدمين.\nقد تتم مشاركة بعض البيانات في الحالات التالية:\n• مع جهات التوظيف أو مقدمي الدورات والخدمات المهنية، في إطار استخدام الخدمة\n• مع مزودي خدمات تقنيين (استضافة، تحليل بيانات، دعم فني)\n• عند وجود التزام قانوني أو طلب رسمي من جهة مختصة\n• لحماية حقوق المستخدمين أو سلامة التطبيق\nويتم ذلك دائمًا في حدود الضرورة وبما يتوافق مع القوانين المعمول بها.'
                },
                {
                    title: '6. نقل البيانات عبر الحدود',
                    content: 'نظرًا للطبيعة الإقليمية للتطبيق، قد يتم تخزين أو معالجة البيانات على خوادم خارج بلد المستخدم.\nنلتزم باتخاذ التدابير اللازمة لضمان حماية البيانات وفق معايير أمان مناسبة، وبما لا يتعارض مع القوانين المحلية في الدول العربية.'
                },
                {
                    title: '7. أمن وحماية المعلومات',
                    content: 'نطبق إجراءات أمنية مناسبة لحماية البيانات، تشمل:\n• تقنيات حماية وتشفير معتمدة\n• أنظمة وصول محدودة\n• مراجعات دورية للأمن\nمع الإقرار بأن أي نظام إلكتروني لا يمكن ضمان أمانه بنسبة 100%.'
                },
                {
                    title: '8. الاحتفاظ بالبيانات',
                    content: 'نحتفظ ببيانات المستخدم طالما كان الحساب نشطًا أو حسب الحاجة لتقديم الخدمات، أو وفق ما تفرضه القوانين المحلية.\nيمكن للمستخدم طلب حذف بياناته أو إغلاق حسابه في أي وقت.'
                },
                {
                    title: '9. حقوق المستخدم',
                    content: 'يتمتع المستخدم بالحقوق التالية:\n• الاطلاع على بياناته الشخصية\n• تعديل أو تحديث معلوماته\n• طلب حذف الحساب والبيانات\n• سحب الموافقة على استخدام البيانات\n• التحكم في الإشعارات'
                },
                {
                    title: '10. التوظيف، الدورات، والاستشارات',
                    content: '• لا يضمن التطبيق الحصول على وظيفة\n• المحتوى التدريبي والاستشاري ذو طابع إرشادي وتطويري\n• يعتمد نجاح الاستفادة على تفاعل المستخدم والتزامه'
                },
                {
                    title: '11. خصوصية القاصرين',
                    content: 'خدمات كاريرك موجهة للمستخدمين بعمر 18 عامًا فما فوق، ولا نقوم بجمع بيانات القاصرين عن قصد.'
                },
                {
                    title: '12. التعديلات على سياسة الخصوصية',
                    content: 'نحتفظ بالحق في تحديث سياسة الخصوصية عند الحاجة.\nسيتم إشعار المستخدمين بأي تغييرات جوهرية عبر التطبيق أو الوسائل المتاحة.'
                },
                {
                    title: '13. التواصل معنا',
                    content: 'لأي استفسارات أو طلبات تتعلق بالخصوصية:\n• البريد الإلكتروني: careerak.hr@gmail.com\n• من خلال إعدادات التطبيق أو وسائل التواصل المعتمدة داخل التطبيق'
                }
            ]
        },
        en: {
            title: 'Privacy Policy',
            welcome: 'Welcome to Careerak App.',
            intro: 'We place great importance on your privacy and the protection of your personal data. We are committed to handling it with transparency and responsibility, in accordance with the general principles of data protection applicable in Arab countries, and in compliance with relevant local laws in each country.',
            agreement: 'By using the Careerak app, you acknowledge your agreement to this Privacy Policy.',
            sections: [
                {
                    title: '1. About the Application',
                    content: 'Careerak is a regional application specialized in:\n• Human Resources\n• Employment and job opportunities\n• Training and educational courses\n• Online courses\n• Career consulting and professional development\nIt serves users across various Arab countries.'
                },
                {
                    title: '2. Scope of Privacy Policy',
                    content: 'This policy applies to all users of the Careerak app in Arab countries, regardless of country of residence, taking into account local laws and regulations related to personal data protection.'
                },
                {
                    title: '3. Information We Collect',
                    content: 'A. Information Provided by the User\nWe may collect the following information during registration or use of app services:\n• Name\n• Email address\n• Phone number\n• Country and city (if provided)\n• Curriculum Vitae (CV)\n• Professional qualifications and experience\n• Skills and training courses\n• Interests and career paths\n• Any additional information the user chooses to share voluntarily\n\nB. Technical Information\nWe may collect technical information for operational and improvement purposes, such as:\n• Device type and operating system\n• Application identifiers\n• IP address (indirectly)\n• App usage log and interaction\n• Crash and performance reports'
                },
                {
                    title: '4. Purposes of Data Collection and Use',
                    content: 'We use the information for the following purposes:\n• Creating and managing user accounts\n• Enabling recruitment and human resources services\n• Displaying suitable jobs and courses\n• Providing educational and consulting content\n• Improving service quality and user experience\n• Communicating with users about updates or services\n• Complying with legal and regulatory requirements in Arab countries'
                },
                {
                    title: '5. Data Sharing',
                    content: 'We are committed not to sell or rent users\' personal data.\nSome data may be shared in the following cases:\n• With employers or providers of courses and professional services, within the scope of service use\n• With technical service providers (hosting, data analysis, technical support)\n• When there is a legal obligation or official request from a competent authority\n• To protect users\' rights or app security\nThis is always done within the limits of necessity and in compliance with applicable laws.'
                },
                {
                    title: '6. Cross-Border Data Transfer',
                    content: 'Due to the regional nature of the application, data may be stored or processed on servers outside the user\'s country.\nWe are committed to taking necessary measures to ensure data protection according to appropriate security standards, and in a manner that does not conflict with local laws in Arab countries.'
                },
                {
                    title: '7. Information Security and Protection',
                    content: 'We apply appropriate security measures to protect data, including:\n• Approved protection and encryption technologies\n• Limited access systems\n• Periodic security reviews\nWith the acknowledgment that no electronic system can guarantee 100% security.'
                },
                {
                    title: '8. Data Retention',
                    content: 'We retain user data as long as the account is active or as needed to provide services, or as required by local laws.\nUsers can request deletion of their data or account closure at any time.'
                },
                {
                    title: '9. User Rights',
                    content: 'Users have the following rights:\n• Access to their personal data\n• Modify or update their information\n• Request account and data deletion\n• Withdraw consent for data use\n• Control notifications'
                },
                {
                    title: '10. Employment, Courses, and Consulting',
                    content: '• The app does not guarantee obtaining employment\n• Training and consulting content is of an advisory and developmental nature\n• Success depends on user interaction and commitment'
                },
                {
                    title: '11. Minors\' Privacy',
                    content: 'Careerak services are intended for users aged 18 and above, and we do not intentionally collect data from minors.'
                },
                {
                    title: '12. Privacy Policy Updates',
                    content: 'We reserve the right to update the Privacy Policy when necessary.\nUsers will be notified of any substantial changes through the app or available means.'
                },
                {
                    title: '13. Contact Us',
                    content: 'For any inquiries or requests related to privacy:\n• Email: careerak.hr@gmail.com\n• Through app settings or approved communication channels within the app'
                }
            ]
        },
        fr: {
            title: 'Politique de Confidentialité',
            welcome: 'Bienvenue sur l\'application Careerak.',
            intro: 'Nous accordons une grande importance à votre vie privée et à la protection de vos données personnelles. Nous nous engageons à les traiter avec transparence et responsabilité, conformément aux principes généraux de protection des données applicables dans les pays arabes, et en conformité avec les lois locales pertinentes dans chaque pays.',
            agreement: 'En utilisant l\'application Careerak, vous reconnaissez votre accord avec cette Politique de Confidentialité.',
            sections: [
                {
                    title: '1. À propos de l\'Application',
                    content: 'Careerak est une application régionale spécialisée dans:\n• Les ressources humaines\n• L\'emploi et les opportunités de travail\n• Les cours de formation et d\'éducation\n• Les cours en ligne\n• Le conseil professionnel et le développement de carrière\nElle sert les utilisateurs dans divers pays arabes.'
                },
                {
                    title: '2. Portée de la Politique de Confidentialité',
                    content: 'Cette politique s\'applique à tous les utilisateurs de l\'application Careerak dans les pays arabes, quel que soit le pays de résidence, en tenant compte des lois et réglementations locales relatives à la protection des données personnelles.'
                },
                {
                    title: '3. Informations que Nous Collectons',
                    content: 'A. Informations Fournies par l\'Utilisateur\nNous pouvons collecter les informations suivantes lors de l\'inscription ou de l\'utilisation des services de l\'application:\n• Nom\n• Adresse e-mail\n• Numéro de téléphone\n• Pays et ville (si fournis)\n• Curriculum Vitae (CV)\n• Qualifications et expérience professionnelles\n• Compétences et cours de formation\n• Intérêts et parcours professionnels\n• Toute information supplémentaire que l\'utilisateur choisit de partager volontairement\n\nB. Informations Techniques\nNous pouvons collecter des informations techniques à des fins opérationnelles et d\'amélioration, telles que:\n• Type d\'appareil et système d\'exploitation\n• Identifiants de l\'application\n• Adresse IP (indirectement)\n• Journal d\'utilisation et d\'interaction avec l\'application\n• Rapports de plantage et de performance'
                },
                {
                    title: '4. Objectifs de la Collecte et de l\'Utilisation des Données',
                    content: 'Nous utilisons les informations aux fins suivantes:\n• Créer et gérer le compte utilisateur\n• Activer les services de recrutement et de ressources humaines\n• Afficher les emplois et cours appropriés\n• Fournir du contenu éducatif et consultatif\n• Améliorer la qualité des services et l\'expérience utilisateur\n• Communiquer avec l\'utilisateur concernant les mises à jour ou services\n• Se conformer aux exigences légales et réglementaires dans les pays arabes'
                },
                {
                    title: '5. Partage des Données',
                    content: 'Nous nous engageons à ne pas vendre ou louer les données personnelles des utilisateurs.\nCertaines données peuvent être partagées dans les cas suivants:\n• Avec les employeurs ou fournisseurs de cours et services professionnels, dans le cadre de l\'utilisation du service\n• Avec les fournisseurs de services techniques (hébergement, analyse de données, support technique)\n• En cas d\'obligation légale ou de demande officielle d\'une autorité compétente\n• Pour protéger les droits des utilisateurs ou la sécurité de l\'application\nCela se fait toujours dans les limites de la nécessité et en conformité avec les lois applicables.'
                },
                {
                    title: '6. Transfert de Données Transfrontalier',
                    content: 'En raison de la nature régionale de l\'application, les données peuvent être stockées ou traitées sur des serveurs en dehors du pays de l\'utilisateur.\nNous nous engageons à prendre les mesures nécessaires pour assurer la protection des données selon des normes de sécurité appropriées, et d\'une manière qui ne contredit pas les lois locales dans les pays arabes.'
                },
                {
                    title: '7. Sécurité et Protection des Informations',
                    content: 'Nous appliquons des mesures de sécurité appropriées pour protéger les données, notamment:\n• Technologies de protection et de cryptage approuvées\n• Systèmes d\'accès limité\n• Examens de sécurité périodiques\nAvec la reconnaissance qu\'aucun système électronique ne peut garantir une sécurité à 100%.'
                },
                {
                    title: '8. Conservation des Données',
                    content: 'Nous conservons les données de l\'utilisateur tant que le compte est actif ou selon les besoins pour fournir les services, ou conformément aux exigences des lois locales.\nL\'utilisateur peut demander la suppression de ses données ou la fermeture de son compte à tout moment.'
                },
                {
                    title: '9. Droits de l\'Utilisateur',
                    content: 'L\'utilisateur dispose des droits suivants:\n• Accéder à ses données personnelles\n• Modifier ou mettre à jour ses informations\n• Demander la suppression du compte et des données\n• Retirer le consentement pour l\'utilisation des données\n• Contrôler les notifications'
                },
                {
                    title: '10. Emploi, Cours et Conseil',
                    content: '• L\'application ne garantit pas l\'obtention d\'un emploi\n• Le contenu de formation et de conseil est de nature consultative et développementale\n• Le succès dépend de l\'interaction et de l\'engagement de l\'utilisateur'
                },
                {
                    title: '11. Confidentialité des Mineurs',
                    content: 'Les services de Careerak sont destinés aux utilisateurs âgés de 18 ans et plus, et nous ne collectons pas intentionnellement de données auprès de mineurs.'
                },
                {
                    title: '12. Modifications de la Politique de Confidentialité',
                    content: 'Nous nous réservons le droit de mettre à jour la Politique de Confidentialité si nécessaire.\nLes utilisateurs seront informés de tout changement substantiel via l\'application ou les moyens disponibles.'
                },
                {
                    title: '13. Nous Contacter',
                    content: 'Pour toute question ou demande relative à la confidentialité:\n• E-mail: careerak.hr@gmail.com\n• Via les paramètres de l\'application ou les canaux de communication approuvés dans l\'application'
                }
            ]
        }
    };

    const currentContent = content[language] || content.ar;

    return (
        <div 
            dir={isRTL ? 'rtl' : 'ltr'} 
            style={{ fontFamily }}
            className={`${isModal ? '' : 'min-h-screen bg-[#E3DAD1] p-6'}`}
            role="main"
        >
            {!isModal && (
                <header className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-black text-[#304B60] mb-6" style={{ fontFamily }}>
                        {currentContent.title}
                    </h1>
                </header>
            )}
            
            <main className={`${isModal ? '' : 'max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-lg'}`}>
                <p className="text-xl font-black text-[#304B60] mb-4 leading-relaxed" style={{ fontFamily }}>
                    {currentContent.welcome}
                </p>
                
                <p className="text-lg text-[#304B60] mb-6 leading-relaxed" style={{ fontFamily }}>
                    {currentContent.intro}
                </p>
                
                <p className="text-lg font-bold text-[#304B60] mb-8 leading-relaxed" style={{ fontFamily }}>
                    {currentContent.agreement}
                </p>

                {currentContent.sections.map((section, index) => (
                    <div key={index} className="mb-8">
                        <h2 className="text-2xl font-black text-[#304B60] mb-4" style={{ fontFamily }}>
                            {section.title}
                        </h2>
                        <p className="text-[#304B60] leading-relaxed whitespace-pre-line" style={{ fontFamily }}>
                            {section.content}
                        </p>
                    </div>
                ))}
            </main>
        </div>
    );
}

export default PolicyPage;
