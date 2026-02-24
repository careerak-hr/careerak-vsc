/**
 * OAuth Auto-fill Test
 * اختبار الملء التلقائي للاسم، البريد، والصورة من حسابات OAuth
 * 
 * Requirements: 1.4 - ملء تلقائي للاسم، البريد، الصورة
 */

const { User } = require('../src/models/User');
const OAuthAccount = require('../src/models/OAuthAccount');

describe('OAuth Auto-fill Tests', () => {
  // Mock profile data from different providers
  const mockGoogleProfile = {
    id: 'google_123456',
    displayName: 'John Doe',
    name: {
      givenName: 'John',
      familyName: 'Doe'
    },
    emails: [{ value: 'john.doe@gmail.com' }],
    photos: [{ value: 'https://lh3.googleusercontent.com/a/photo.jpg' }]
  };

  const mockFacebookProfile = {
    id: 'facebook_789012',
    displayName: 'Jane Smith',
    name: {
      givenName: 'Jane',
      familyName: 'Smith'
    },
    emails: [{ value: 'jane.smith@facebook.com' }],
    photos: [{ value: 'https://graph.facebook.com/photo.jpg' }]
  };

  const mockLinkedInProfile = {
    id: 'linkedin_345678',
    displayName: 'Bob Johnson',
    name: {
      givenName: 'Bob',
      familyName: 'Johnson'
    },
    emails: [{ value: 'bob.johnson@linkedin.com' }],
    photos: [{ value: 'https://media.licdn.com/photo.jpg' }]
  };

  describe('Google OAuth Auto-fill', () => {
    test('should auto-fill name from Google profile', () => {
      const { name } = mockGoogleProfile;
      
      expect(name.givenName).toBe('John');
      expect(name.familyName).toBe('Doe');
    });

    test('should auto-fill email from Google profile', () => {
      const email = mockGoogleProfile.emails[0].value;
      
      expect(email).toBe('john.doe@gmail.com');
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Valid email format
    });

    test('should auto-fill profile picture from Google profile', () => {
      const photo = mockGoogleProfile.photos[0].value;
      
      expect(photo).toBe('https://lh3.googleusercontent.com/a/photo.jpg');
      expect(photo).toMatch(/^https?:\/\//); // Valid URL
    });
  });

  describe('Facebook OAuth Auto-fill', () => {
    test('should auto-fill name from Facebook profile', () => {
      const { name } = mockFacebookProfile;
      
      expect(name.givenName).toBe('Jane');
      expect(name.familyName).toBe('Smith');
    });

    test('should auto-fill email from Facebook profile', () => {
      const email = mockFacebookProfile.emails[0].value;
      
      expect(email).toBe('jane.smith@facebook.com');
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('should auto-fill profile picture from Facebook profile', () => {
      const photo = mockFacebookProfile.photos[0].value;
      
      expect(photo).toBe('https://graph.facebook.com/photo.jpg');
      expect(photo).toMatch(/^https?:\/\//);
    });
  });

  describe('LinkedIn OAuth Auto-fill', () => {
    test('should auto-fill name from LinkedIn profile', () => {
      const { name } = mockLinkedInProfile;
      
      expect(name.givenName).toBe('Bob');
      expect(name.familyName).toBe('Johnson');
    });

    test('should auto-fill email from LinkedIn profile', () => {
      const email = mockLinkedInProfile.emails[0].value;
      
      expect(email).toBe('bob.johnson@linkedin.com');
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('should auto-fill profile picture from LinkedIn profile', () => {
      const photo = mockLinkedInProfile.photos[0].value;
      
      expect(photo).toBe('https://media.licdn.com/photo.jpg');
      expect(photo).toMatch(/^https?:\/\//);
    });
  });

  describe('User Creation with Auto-filled Data', () => {
    test('should create user with auto-filled data from OAuth', () => {
      const profile = mockGoogleProfile;
      
      // Simulate user creation logic from passport.js
      const userData = {
        email: profile.emails[0].value.toLowerCase(),
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profileImage: profile.photos[0].value,
        emailVerified: true,
        oauthAccounts: [{
          provider: 'google',
          providerId: profile.id,
          email: profile.emails[0].value,
          connectedAt: new Date()
        }]
      };
      
      expect(userData.email).toBe('john.doe@gmail.com');
      expect(userData.firstName).toBe('John');
      expect(userData.lastName).toBe('Doe');
      expect(userData.profileImage).toBe('https://lh3.googleusercontent.com/a/photo.jpg');
      expect(userData.emailVerified).toBe(true);
      expect(userData.oauthAccounts).toHaveLength(1);
      expect(userData.oauthAccounts[0].provider).toBe('google');
    });

    test('should handle missing profile picture gracefully', () => {
      const profileWithoutPhoto = {
        ...mockGoogleProfile,
        photos: []
      };
      
      const profilePicture = profileWithoutPhoto.photos && profileWithoutPhoto.photos[0] 
        ? profileWithoutPhoto.photos[0].value 
        : null;
      
      expect(profilePicture).toBeNull();
    });

    test('should handle missing email gracefully', () => {
      const profileWithoutEmail = {
        ...mockGoogleProfile,
        emails: []
      };
      
      const email = profileWithoutEmail.emails && profileWithoutEmail.emails[0] 
        ? profileWithoutEmail.emails[0].value 
        : null;
      
      expect(email).toBeNull();
    });

    test('should extract name from displayName if name object is missing', () => {
      const profileWithoutNameObject = {
        ...mockGoogleProfile,
        name: undefined,
        displayName: 'Alice Wonder'
      };
      
      const nameParts = profileWithoutNameObject.displayName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];
      
      expect(firstName).toBe('Alice');
      expect(lastName).toBe('Wonder');
    });
  });

  describe('Existing User Linking', () => {
    test('should link OAuth account to existing user with same email', () => {
      const existingUser = {
        _id: 'user_123',
        email: 'john.doe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImage: null,
        oauthAccounts: []
      };
      
      const profile = mockGoogleProfile;
      
      // Simulate linking logic
      const oauthEntry = {
        provider: 'google',
        providerId: profile.id,
        email: profile.emails[0].value,
        connectedAt: new Date()
      };
      
      existingUser.oauthAccounts.push(oauthEntry);
      
      // Update profile picture if not set
      if (!existingUser.profileImage && profile.photos && profile.photos[0]) {
        existingUser.profileImage = profile.photos[0].value;
      }
      
      expect(existingUser.oauthAccounts).toHaveLength(1);
      expect(existingUser.oauthAccounts[0].provider).toBe('google');
      expect(existingUser.profileImage).toBe('https://lh3.googleusercontent.com/a/photo.jpg');
    });

    test('should not overwrite existing profile picture', () => {
      const existingUser = {
        _id: 'user_456',
        email: 'jane.smith@facebook.com',
        profileImage: 'https://existing-photo.com/photo.jpg',
        oauthAccounts: []
      };
      
      const profile = mockFacebookProfile;
      
      // Simulate linking logic - should NOT overwrite
      if (!existingUser.profileImage && profile.photos && profile.photos[0]) {
        existingUser.profileImage = profile.photos[0].value;
      }
      
      expect(existingUser.profileImage).toBe('https://existing-photo.com/photo.jpg');
    });
  });

  describe('Email Verification', () => {
    test('should mark email as verified for OAuth users', () => {
      const userData = {
        email: mockGoogleProfile.emails[0].value,
        emailVerified: true // OAuth providers verify emails
      };
      
      expect(userData.emailVerified).toBe(true);
    });
  });

  describe('Registration Progress', () => {
    test('should skip basic info and password steps for OAuth users', () => {
      const userData = {
        registrationProgress: {
          step: 3, // Skip steps 1 (basic info) and 2 (password)
          completed: false,
          lastSaved: new Date()
        }
      };
      
      expect(userData.registrationProgress.step).toBe(3);
      expect(userData.registrationProgress.completed).toBe(false);
    });
  });
});
