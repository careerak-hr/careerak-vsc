/**
 * رسائل خطأ محسّنة مع اقتراحات للحل
 * Requirement 8.1: رسائل واضحة ومحددة مع اقتراحات للحل
 */

export const getErrorMessage = (field, value, language = 'ar') => {
  const messages = {
    ar: {
      firstName: {
        empty: 'الاسم الأول مطلوب',
        suggestion: 'يرجى إدخال اسمك الأول كما هو في بطاقة الهوية'
      },
      lastName: {
        empty: 'الاسم الأخير مطلوب',
        suggestion: 'يرجى إدخال اسم العائلة كما هو في بطاقة الهوية'
      },
      email: {
        empty: 'البريد الإلكتروني مطلوب',
        invalid: 'البريد الإلكتروني غير صحيح',
        suggestion: 'مثال: name@example.com'
      },
      phone: {
        empty: 'رقم الهاتف مطلوب',
        invalid: 'رقم الهاتف غير صحيح',
        suggestion: 'يرجى إدخال رقم هاتف صحيح (10-15 رقم)'
      },
      password: {
        empty: 'كلمة المرور مطلوبة',
        weak: 'كلمة المرور ضعيفة جداً',
        suggestion: 'يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص'
      },
      confirmPassword: {
        empty: 'تأكيد كلمة المرور مطلوب',
        mismatch: 'كلمات المرور غير متطابقة',
        suggestion: 'تأكد من إدخال نفس كلمة المرور في الحقلين'
      },
      country: {
        empty: 'البلد مطلوب',
        suggestion: 'اختر بلد إقامتك الحالي'
      },
      city: {
        empty: 'المدينة مطلوبة',
        suggestion: 'أدخل اسم المدينة التي تقيم فيها'
      },
      gender: {
        empty: 'الجنس مطلوب',
        suggestion: 'اختر الجنس من القائمة'
      },
      birthDate: {
        empty: 'تاريخ الميلاد مطلوب',
        invalid: 'تاريخ الميلاد غير صحيح',
        suggestion: 'يجب أن يكون عمرك 16 سنة على الأقل'
      },
      education: {
        empty: 'المستوى العلمي مطلوب',
        suggestion: 'اختر أعلى مستوى تعليمي حصلت عليه'
      },
      specialization: {
        empty: 'التخصص مطلوب',
        suggestion: 'أدخل مجال دراستك أو تخصصك'
      },
      interests: {
        empty: 'الاهتمامات مطلوبة',
        suggestion: 'أدخل مجالات العمل التي تهتم بها (مفصولة بفواصل)'
      },
      companyName: {
        empty: 'اسم المنشأة مطلوب',
        suggestion: 'أدخل الاسم الرسمي للمنشأة'
      },
      industry: {
        empty: 'مجال العمل مطلوب',
        suggestion: 'اختر المجال الذي تعمل فيه المنشأة'
      },
      subIndustry: {
        empty: 'التخصص مطلوب',
        suggestion: 'حدد التخصص الدقيق لمجال عملك'
      },
      authorizedName: {
        empty: 'اسم الشخص المفوض مطلوب',
        suggestion: 'أدخل اسم الشخص المخول بالتسجيل'
      },
      authorizedPosition: {
        empty: 'وظيفة الشخص المفوض مطلوبة',
        suggestion: 'أدخل المسمى الوظيفي للشخص المفوض'
      },
      companyKeywords: {
        empty: 'كلمات مفتاحية مطلوبة',
        suggestion: 'أدخل كلمات تصف نشاط المنشأة (مفصولة بفواصل)'
      },
      agreed: {
        empty: 'يجب الموافقة على سياسة الخصوصية',
        suggestion: 'يرجى قراءة سياسة الخصوصية والموافقة عليها للمتابعة'
      },
      specialNeedType: {
        empty: 'نوع الاحتياج مطلوب',
        suggestion: 'حدد نوع الاحتياج الخاص إذا كان ينطبق عليك'
      },
      image: {
        permission: 'تم رفض الإذن',
        suggestion: 'يرجى السماح بالوصول للكاميرا والصور من إعدادات التطبيق',
        invalid: 'الصورة غير مناسبة',
        suggestionInvalid: 'يرجى اختيار صورة شخصية واضحة',
        cropError: 'حدث خطأ أثناء قص الصورة',
        suggestionCrop: 'يرجى المحاولة مرة أخرى أو اختيار صورة أخرى'
      }
    },
    en: {
      firstName: {
        empty: 'First name is required',
        suggestion: 'Please enter your first name as it appears on your ID'
      },
      lastName: {
        empty: 'Last name is required',
        suggestion: 'Please enter your family name as it appears on your ID'
      },
      email: {
        empty: 'Email is required',
        invalid: 'Invalid email address',
        suggestion: 'Example: name@example.com'
      },
      phone: {
        empty: 'Phone number is required',
        invalid: 'Invalid phone number',
        suggestion: 'Please enter a valid phone number (10-15 digits)'
      },
      password: {
        empty: 'Password is required',
        weak: 'Password is too weak',
        suggestion: 'Must contain at least 8 characters, uppercase, lowercase, number, and special character'
      },
      confirmPassword: {
        empty: 'Password confirmation is required',
        mismatch: 'Passwords do not match',
        suggestion: 'Make sure to enter the same password in both fields'
      },
      country: {
        empty: 'Country is required',
        suggestion: 'Select your current country of residence'
      },
      city: {
        empty: 'City is required',
        suggestion: 'Enter the name of the city you live in'
      },
      gender: {
        empty: 'Gender is required',
        suggestion: 'Select your gender from the list'
      },
      birthDate: {
        empty: 'Date of birth is required',
        invalid: 'Invalid date of birth',
        suggestion: 'You must be at least 16 years old'
      },
      education: {
        empty: 'Education level is required',
        suggestion: 'Select your highest level of education'
      },
      specialization: {
        empty: 'Specialization is required',
        suggestion: 'Enter your field of study or specialization'
      },
      interests: {
        empty: 'Interests are required',
        suggestion: 'Enter work fields you are interested in (comma separated)'
      },
      companyName: {
        empty: 'Company name is required',
        suggestion: 'Enter the official name of the company'
      },
      industry: {
        empty: 'Industry is required',
        suggestion: 'Select the industry your company operates in'
      },
      subIndustry: {
        empty: 'Sub-industry is required',
        suggestion: 'Specify the exact specialization of your business'
      },
      authorizedName: {
        empty: 'Authorized person name is required',
        suggestion: 'Enter the name of the person authorized to register'
      },
      authorizedPosition: {
        empty: 'Authorized person position is required',
        suggestion: 'Enter the job title of the authorized person'
      },
      companyKeywords: {
        empty: 'Keywords are required',
        suggestion: 'Enter keywords describing your company activity (comma separated)'
      },
      agreed: {
        empty: 'You must agree to the privacy policy',
        suggestion: 'Please read and agree to the privacy policy to continue'
      },
      specialNeedType: {
        empty: 'Special need type is required',
        suggestion: 'Specify the type of special need if applicable'
      },
      image: {
        permission: 'Permission denied',
        suggestion: 'Please allow access to camera and photos from app settings',
        invalid: 'Image is not suitable',
        suggestionInvalid: 'Please select a clear profile picture',
        cropError: 'Error cropping image',
        suggestionCrop: 'Please try again or select another image'
      }
    },
    fr: {
      firstName: {
        empty: 'Le prénom est requis',
        suggestion: 'Veuillez entrer votre prénom tel qu\'il apparaît sur votre pièce d\'identité'
      },
      lastName: {
        empty: 'Le nom de famille est requis',
        suggestion: 'Veuillez entrer votre nom de famille tel qu\'il apparaît sur votre pièce d\'identité'
      },
      email: {
        empty: 'L\'email est requis',
        invalid: 'Adresse email invalide',
        suggestion: 'Exemple: nom@exemple.com'
      },
      phone: {
        empty: 'Le numéro de téléphone est requis',
        invalid: 'Numéro de téléphone invalide',
        suggestion: 'Veuillez entrer un numéro de téléphone valide (10-15 chiffres)'
      },
      password: {
        empty: 'Le mot de passe est requis',
        weak: 'Le mot de passe est trop faible',
        suggestion: 'Doit contenir au moins 8 caractères, majuscule, minuscule, chiffre et caractère spécial'
      },
      confirmPassword: {
        empty: 'La confirmation du mot de passe est requise',
        mismatch: 'Les mots de passe ne correspondent pas',
        suggestion: 'Assurez-vous d\'entrer le même mot de passe dans les deux champs'
      },
      country: {
        empty: 'Le pays est requis',
        suggestion: 'Sélectionnez votre pays de résidence actuel'
      },
      city: {
        empty: 'La ville est requise',
        suggestion: 'Entrez le nom de la ville où vous habitez'
      },
      gender: {
        empty: 'Le sexe est requis',
        suggestion: 'Sélectionnez votre sexe dans la liste'
      },
      birthDate: {
        empty: 'La date de naissance est requise',
        invalid: 'Date de naissance invalide',
        suggestion: 'Vous devez avoir au moins 16 ans'
      },
      education: {
        empty: 'Le niveau d\'éducation est requis',
        suggestion: 'Sélectionnez votre plus haut niveau d\'éducation'
      },
      specialization: {
        empty: 'La spécialisation est requise',
        suggestion: 'Entrez votre domaine d\'études ou spécialisation'
      },
      interests: {
        empty: 'Les intérêts sont requis',
        suggestion: 'Entrez les domaines de travail qui vous intéressent (séparés par des virgules)'
      },
      companyName: {
        empty: 'Le nom de l\'entreprise est requis',
        suggestion: 'Entrez le nom officiel de l\'entreprise'
      },
      industry: {
        empty: 'Le secteur est requis',
        suggestion: 'Sélectionnez le secteur dans lequel votre entreprise opère'
      },
      subIndustry: {
        empty: 'Le sous-secteur est requis',
        suggestion: 'Spécifiez la spécialisation exacte de votre entreprise'
      },
      authorizedName: {
        empty: 'Le nom de la personne autorisée est requis',
        suggestion: 'Entrez le nom de la personne autorisée à s\'inscrire'
      },
      authorizedPosition: {
        empty: 'Le poste de la personne autorisée est requis',
        suggestion: 'Entrez le titre du poste de la personne autorisée'
      },
      companyKeywords: {
        empty: 'Les mots-clés sont requis',
        suggestion: 'Entrez des mots-clés décrivant l\'activité de votre entreprise (séparés par des virgules)'
      },
      agreed: {
        empty: 'Vous devez accepter la politique de confidentialité',
        suggestion: 'Veuillez lire et accepter la politique de confidentialité pour continuer'
      },
      specialNeedType: {
        empty: 'Le type de besoin spécial est requis',
        suggestion: 'Spécifiez le type de besoin spécial si applicable'
      },
      image: {
        permission: 'Permission refusée',
        suggestion: 'Veuillez autoriser l\'accès à la caméra et aux photos depuis les paramètres de l\'application',
        invalid: 'L\'image n\'est pas appropriée',
        suggestionInvalid: 'Veuillez sélectionner une photo de profil claire',
        cropError: 'Erreur lors du recadrage de l\'image',
        suggestionCrop: 'Veuillez réessayer ou sélectionner une autre image'
      }
    }
  };

  const lang = messages[language] || messages.ar;
  return lang[field] || { empty: 'هذا الحقل مطلوب', suggestion: '' };
};

/**
 * مكون عرض رسالة الخطأ مع الاقتراح
 */
export const ErrorMessage = ({ field, type = 'empty', language = 'ar' }) => {
  const error = getErrorMessage(field, null, language);
  const message = error[type] || error.empty;
  const suggestion = type === 'empty' ? error.suggestion : 
                     type === 'invalid' ? error.suggestion :
                     type === 'mismatch' ? error.suggestion :
                     type === 'weak' ? error.suggestion :
                     type === 'permission' ? error.suggestion :
                     type === 'cropError' ? error.suggestionCrop :
                     error.suggestionInvalid;

  return {
    message,
    suggestion
  };
};
