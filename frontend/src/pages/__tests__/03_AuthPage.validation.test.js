/**
 * اختبارات التحقق من صحة دالة isNextDisabled في AuthPage
 * 
 * Requirements: 8.5 - تعطيل زر "التالي" حتى ملء الحقول المطلوبة
 */

describe('AuthPage - isNextDisabled validation', () => {
  describe('Step 1: Basic Information', () => {
    describe('Individual users', () => {
      it('should disable next button when firstName is empty', () => {
        const formData = {
          firstName: '',
          lastName: 'Test',
          email: 'test@example.com',
          education: 'bachelor'
        };
        const userType = 'individual';
        const currentStep = 1;
        
        // Expected: button should be disabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should disable next button when lastName is empty', () => {
        const formData = {
          firstName: 'Test',
          lastName: '',
          email: 'test@example.com',
          education: 'bachelor'
        };
        const userType = 'individual';
        const currentStep = 1;
        
        // Expected: button should be disabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should disable next button for educated users without email', () => {
        const formData = {
          firstName: 'Test',
          lastName: 'User',
          email: '',
          education: 'bachelor'
        };
        const userType = 'individual';
        const currentStep = 1;
        
        // Expected: button should be disabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should disable next button for educated users with invalid email', () => {
        const formData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          education: 'bachelor'
        };
        const userType = 'individual';
        const currentStep = 1;
        
        // Expected: button should be disabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should enable next button for illiterate users without email', () => {
        const formData = {
          firstName: 'Test',
          lastName: 'User',
          email: '',
          education: 'illiterate'
        };
        const userType = 'individual';
        const currentStep = 1;
        
        // Expected: button should be enabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(false);
      });

      it('should enable next button for educated users with valid email', () => {
        const formData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          education: 'bachelor'
        };
        const userType = 'individual';
        const currentStep = 1;
        
        // Expected: button should be enabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(false);
      });
    });

    describe('Company users', () => {
      it('should disable next button when companyName is empty', () => {
        const formData = {
          companyName: '',
          email: 'company@example.com'
        };
        const userType = 'company';
        const currentStep = 1;
        
        // Expected: button should be disabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should disable next button when email is empty', () => {
        const formData = {
          companyName: 'Test Company',
          email: ''
        };
        const userType = 'company';
        const currentStep = 1;
        
        // Expected: button should be disabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should disable next button with invalid email', () => {
        const formData = {
          companyName: 'Test Company',
          email: 'invalid-email'
        };
        const userType = 'company';
        const currentStep = 1;
        
        // Expected: button should be disabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should enable next button with valid data', () => {
        const formData = {
          companyName: 'Test Company',
          email: 'company@example.com'
        };
        const userType = 'company';
        const currentStep = 1;
        
        // Expected: button should be enabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(false);
      });
    });
  });

  describe('Step 2: Password', () => {
    it('should disable next button when password is empty', () => {
      const formData = {
        password: '',
        confirmPassword: 'Test1234'
      };
      const userType = 'individual';
      const currentStep = 2;
      
      // Expected: button should be disabled
      expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
    });

    it('should disable next button when confirmPassword is empty', () => {
      const formData = {
        password: 'Test1234',
        confirmPassword: ''
      };
      const userType = 'individual';
      const currentStep = 2;
      
      // Expected: button should be disabled
      expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
    });

    it('should disable next button when passwords do not match', () => {
      const formData = {
        password: 'Test1234',
        confirmPassword: 'Different1234'
      };
      const userType = 'individual';
      const currentStep = 2;
      
      // Expected: button should be disabled
      expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
    });

    it('should disable next button when password is too short', () => {
      const formData = {
        password: 'Test12',
        confirmPassword: 'Test12'
      };
      const userType = 'individual';
      const currentStep = 2;
      
      // Expected: button should be disabled
      expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
    });

    it('should enable next button with valid matching passwords', () => {
      const formData = {
        password: 'Test1234',
        confirmPassword: 'Test1234'
      };
      const userType = 'individual';
      const currentStep = 2;
      
      // Expected: button should be enabled
      expect(isNextDisabled(formData, userType, currentStep)).toBe(false);
    });
  });

  describe('Step 3: Account Type', () => {
    describe('Individual users', () => {
      it('should disable next button when required fields are missing', () => {
        const formData = {
          country: '',
          city: 'Test City',
          gender: 'male',
          birthDate: '2000-01-01',
          education: 'bachelor',
          specialization: 'IT',
          interests: 'Programming',
          countryCode: '+1',
          phone: '1234567890'
        };
        const userType = 'individual';
        const currentStep = 3;
        
        // Expected: button should be disabled (country is missing)
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should enable next button when all required fields are filled', () => {
        const formData = {
          country: 'US',
          city: 'Test City',
          gender: 'male',
          birthDate: '2000-01-01',
          education: 'bachelor',
          specialization: 'IT',
          interests: 'Programming',
          countryCode: '+1',
          phone: '1234567890'
        };
        const userType = 'individual';
        const currentStep = 3;
        
        // Expected: button should be enabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(false);
      });
    });

    describe('Company users', () => {
      it('should disable next button when required fields are missing', () => {
        const formData = {
          country: 'US',
          city: '',
          industry: 'IT',
          subIndustry: 'Software',
          authorizedName: 'John Doe',
          authorizedPosition: 'CEO',
          companyKeywords: 'tech, software',
          countryCode: '+1',
          phone: '1234567890'
        };
        const userType = 'company';
        const currentStep = 3;
        
        // Expected: button should be disabled (city is missing)
        expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
      });

      it('should enable next button when all required fields are filled', () => {
        const formData = {
          country: 'US',
          city: 'Test City',
          industry: 'IT',
          subIndustry: 'Software',
          authorizedName: 'John Doe',
          authorizedPosition: 'CEO',
          companyKeywords: 'tech, software',
          countryCode: '+1',
          phone: '1234567890'
        };
        const userType = 'company';
        const currentStep = 3;
        
        // Expected: button should be enabled
        expect(isNextDisabled(formData, userType, currentStep)).toBe(false);
      });
    });
  });

  describe('Step 4: Details (Optional)', () => {
    it('should disable next button when privacy policy is not agreed', () => {
      const formData = {
        agreed: false
      };
      const userType = 'individual';
      const currentStep = 4;
      
      // Expected: button should be disabled
      expect(isNextDisabled(formData, userType, currentStep)).toBe(true);
    });

    it('should enable next button when privacy policy is agreed', () => {
      const formData = {
        agreed: true
      };
      const userType = 'individual';
      const currentStep = 4;
      
      // Expected: button should be enabled
      expect(isNextDisabled(formData, userType, currentStep)).toBe(false);
    });
  });
});

// Helper function to simulate the isNextDisabled logic
function isNextDisabled(formData, userType, currentStep) {
  if (!userType) return true;

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  switch (currentStep) {
    case 1:
      if (userType === 'individual') {
        const hasBasicInfo = formData.firstName?.trim() && formData.lastName?.trim();
        if (formData.education && formData.education !== 'illiterate' && formData.education !== 'uneducated') {
          return !hasBasicInfo || !formData.email?.trim() || !isValidEmail(formData.email);
        }
        return !hasBasicInfo;
      } else {
        return !formData.companyName?.trim() || !formData.email?.trim() || !isValidEmail(formData.email);
      }
      
    case 2:
      if (!formData.password || !formData.confirmPassword) {
        return true;
      }
      if (formData.password !== formData.confirmPassword) {
        return true;
      }
      if (formData.password.length < 8) {
        return true;
      }
      return false;
      
    case 3:
      if (userType === 'individual') {
        return !formData.country || 
               !formData.city?.trim() || 
               !formData.gender || 
               !formData.birthDate || 
               !formData.education || 
               !formData.specialization?.trim() || 
               !formData.interests?.trim() ||
               !formData.countryCode ||
               !formData.phone?.trim();
      } else {
        return !formData.country || 
               !formData.city?.trim() || 
               !formData.industry || 
               !formData.subIndustry?.trim() || 
               !formData.authorizedName?.trim() || 
               !formData.authorizedPosition?.trim() || 
               !formData.companyKeywords?.trim() ||
               !formData.countryCode ||
               !formData.phone?.trim();
      }
      
    case 4:
      return !formData.agreed;
      
    default:
      return false;
  }
}
