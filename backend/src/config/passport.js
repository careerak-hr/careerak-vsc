const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { User } = require('../models/User');
const OAuthAccount = require('../models/OAuthAccount');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ==================== Google OAuth Strategy ====================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔵 Google OAuth - Processing profile:', profile.id);
      
      // Check if OAuth account already exists
      let oauthAccount = await OAuthAccount.findOne({
        provider: 'google',
        providerId: profile.id
      }).populate('userId');
      
      if (oauthAccount && oauthAccount.userId) {
        // User already exists with this Google account
        console.log('✅ Existing Google account found for user:', oauthAccount.userId._id);
        
        // Update last used and tokens
        oauthAccount.lastUsed = new Date();
        oauthAccount.accessToken = accessToken;
        if (refreshToken) oauthAccount.refreshToken = refreshToken;
        await oauthAccount.save();
        
        return done(null, oauthAccount.userId);
      }
      
      // Check if user exists with this email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      let user = null;
      
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
      }
      
      if (user) {
        // Link Google account to existing user
        console.log('🔗 Linking Google account to existing user:', user._id);
        
        // Update user's OAuth accounts array
        const oauthEntry = {
          provider: 'google',
          providerId: profile.id,
          email: email,
          connectedAt: new Date()
        };
        
        // Check if already in array
        const existingIndex = user.oauthAccounts.findIndex(
          acc => acc.provider === 'google' && acc.providerId === profile.id
        );
        
        if (existingIndex === -1) {
          user.oauthAccounts.push(oauthEntry);
        } else {
          user.oauthAccounts[existingIndex] = oauthEntry;
        }
        
        // Mark email as verified since Google verified it
        user.emailVerified = true;
        
        // Update profile picture if not set
        if (!user.profileImage && profile.photos && profile.photos[0]) {
          user.profileImage = profile.photos[0].value;
        }
        
        await user.save();
        
        // Create OAuth account record
        oauthAccount = new OAuthAccount({
          userId: user._id,
          provider: 'google',
          providerId: profile.id,
          email: email,
          displayName: profile.displayName,
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          accessToken: accessToken,
          refreshToken: refreshToken,
          connectedAt: new Date(),
          lastUsed: new Date()
        });
        
        await oauthAccount.save();
        
        return done(null, user);
      }
      
      // Create new user
      console.log('🆕 Creating new user from Google account');
      
      const newUser = new User({
        email: email ? email.toLowerCase() : null,
        password: Math.random().toString(36).slice(-12) + 'Aa1!', // Random password (won't be used)
        phone: `+google_${profile.id}`, // Temporary phone
        role: 'Employee', // Default role
        country: 'Egypt',
        profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        emailVerified: true, // Google verified
        isVerified: true,
        oauthAccounts: [{
          provider: 'google',
          providerId: profile.id,
          email: email,
          connectedAt: new Date()
        }],
        registrationProgress: {
          step: 3, // Skip basic info and password steps
          completed: false,
          lastSaved: new Date()
        }
      });
      
      // Extract name
      if (profile.name) {
        if (profile.name.givenName) newUser.firstName = profile.name.givenName;
        if (profile.name.familyName) newUser.lastName = profile.name.familyName;
      } else if (profile.displayName) {
        const nameParts = profile.displayName.split(' ');
        newUser.firstName = nameParts[0];
        newUser.lastName = nameParts.slice(1).join(' ') || nameParts[0];
      }
      
      await newUser.save();
      
      // Create OAuth account record
      oauthAccount = new OAuthAccount({
        userId: newUser._id,
        provider: 'google',
        providerId: profile.id,
        email: email,
        displayName: profile.displayName,
        profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        accessToken: accessToken,
        refreshToken: refreshToken,
        connectedAt: new Date(),
        lastUsed: new Date()
      });
      
      await oauthAccount.save();
      
      console.log('✅ New user created successfully:', newUser._id);
      return done(null, newUser);
      
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error, null);
    }
  }));
  
  console.log('✅ Google OAuth Strategy configured');
} else {
  console.warn('⚠️ Google OAuth credentials not found in environment variables');
}

// ==================== Facebook OAuth Strategy ====================
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔵 Facebook OAuth - Processing profile:', profile.id);
      
      // Similar logic to Google OAuth
      let oauthAccount = await OAuthAccount.findOne({
        provider: 'facebook',
        providerId: profile.id
      }).populate('userId');
      
      if (oauthAccount && oauthAccount.userId) {
        oauthAccount.lastUsed = new Date();
        oauthAccount.accessToken = accessToken;
        if (refreshToken) oauthAccount.refreshToken = refreshToken;
        await oauthAccount.save();
        return done(null, oauthAccount.userId);
      }
      
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      let user = null;
      
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
      }
      
      if (user) {
        const oauthEntry = {
          provider: 'facebook',
          providerId: profile.id,
          email: email,
          connectedAt: new Date()
        };
        
        const existingIndex = user.oauthAccounts.findIndex(
          acc => acc.provider === 'facebook' && acc.providerId === profile.id
        );
        
        if (existingIndex === -1) {
          user.oauthAccounts.push(oauthEntry);
        } else {
          user.oauthAccounts[existingIndex] = oauthEntry;
        }
        
        user.emailVerified = true;
        
        if (!user.profileImage && profile.photos && profile.photos[0]) {
          user.profileImage = profile.photos[0].value;
        }
        
        await user.save();
        
        oauthAccount = new OAuthAccount({
          userId: user._id,
          provider: 'facebook',
          providerId: profile.id,
          email: email,
          displayName: profile.displayName,
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          accessToken: accessToken,
          refreshToken: refreshToken,
          connectedAt: new Date(),
          lastUsed: new Date()
        });
        
        await oauthAccount.save();
        return done(null, user);
      }
      
      // Create new user
      const newUser = new User({
        email: email ? email.toLowerCase() : null,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
        phone: `+facebook_${profile.id}`,
        role: 'Employee',
        country: 'Egypt',
        profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        emailVerified: true,
        isVerified: true,
        oauthAccounts: [{
          provider: 'facebook',
          providerId: profile.id,
          email: email,
          connectedAt: new Date()
        }],
        registrationProgress: {
          step: 3,
          completed: false,
          lastSaved: new Date()
        }
      });
      
      if (profile.name) {
        newUser.firstName = profile.name.givenName || profile.displayName;
        newUser.lastName = profile.name.familyName || '';
      }
      
      await newUser.save();
      
      oauthAccount = new OAuthAccount({
        userId: newUser._id,
        provider: 'facebook',
        providerId: profile.id,
        email: email,
        displayName: profile.displayName,
        profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        accessToken: accessToken,
        refreshToken: refreshToken,
        connectedAt: new Date(),
        lastUsed: new Date()
      });
      
      await oauthAccount.save();
      return done(null, newUser);
      
    } catch (error) {
      console.error('❌ Facebook OAuth error:', error);
      return done(error, null);
    }
  }));
  
  console.log('✅ Facebook OAuth Strategy configured');
} else {
  console.warn('⚠️ Facebook OAuth credentials not found in environment variables');
}

// ==================== LinkedIn OAuth Strategy ====================
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔵 LinkedIn OAuth - Processing profile:', profile.id);
      
      let oauthAccount = await OAuthAccount.findOne({
        provider: 'linkedin',
        providerId: profile.id
      }).populate('userId');
      
      if (oauthAccount && oauthAccount.userId) {
        oauthAccount.lastUsed = new Date();
        oauthAccount.accessToken = accessToken;
        if (refreshToken) oauthAccount.refreshToken = refreshToken;
        await oauthAccount.save();
        return done(null, oauthAccount.userId);
      }
      
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      let user = null;
      
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
      }
      
      if (user) {
        const oauthEntry = {
          provider: 'linkedin',
          providerId: profile.id,
          email: email,
          connectedAt: new Date()
        };
        
        const existingIndex = user.oauthAccounts.findIndex(
          acc => acc.provider === 'linkedin' && acc.providerId === profile.id
        );
        
        if (existingIndex === -1) {
          user.oauthAccounts.push(oauthEntry);
        } else {
          user.oauthAccounts[existingIndex] = oauthEntry;
        }
        
        user.emailVerified = true;
        
        if (!user.profileImage && profile.photos && profile.photos[0]) {
          user.profileImage = profile.photos[0].value;
        }
        
        await user.save();
        
        oauthAccount = new OAuthAccount({
          userId: user._id,
          provider: 'linkedin',
          providerId: profile.id,
          email: email,
          displayName: profile.displayName,
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          accessToken: accessToken,
          refreshToken: refreshToken,
          connectedAt: new Date(),
          lastUsed: new Date()
        });
        
        await oauthAccount.save();
        return done(null, user);
      }
      
      // Create new user
      const newUser = new User({
        email: email ? email.toLowerCase() : null,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
        phone: `+linkedin_${profile.id}`,
        role: 'Employee',
        country: 'Egypt',
        profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        emailVerified: true,
        isVerified: true,
        oauthAccounts: [{
          provider: 'linkedin',
          providerId: profile.id,
          email: email,
          connectedAt: new Date()
        }],
        registrationProgress: {
          step: 3,
          completed: false,
          lastSaved: new Date()
        }
      });
      
      if (profile.name) {
        newUser.firstName = profile.name.givenName || profile.displayName;
        newUser.lastName = profile.name.familyName || '';
      }
      
      await newUser.save();
      
      oauthAccount = new OAuthAccount({
        userId: newUser._id,
        provider: 'linkedin',
        providerId: profile.id,
        email: email,
        displayName: profile.displayName,
        profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        accessToken: accessToken,
        refreshToken: refreshToken,
        connectedAt: new Date(),
        lastUsed: new Date()
      });
      
      await oauthAccount.save();
      return done(null, newUser);
      
    } catch (error) {
      console.error('❌ LinkedIn OAuth error:', error);
      return done(error, null);
    }
  }));
  
  console.log('✅ LinkedIn OAuth Strategy configured');
} else {
  console.warn('⚠️ LinkedIn OAuth credentials not found in environment variables');
}

module.exports = passport;
