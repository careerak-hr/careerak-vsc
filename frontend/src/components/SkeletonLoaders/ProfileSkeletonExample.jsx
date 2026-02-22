import React from 'react';
import ProfileSkeleton from './ProfileSkeleton';

/**
 * ProfileSkeleton Usage Examples
 * 
 * This file demonstrates various use cases for the ProfileSkeleton component.
 * The skeleton matches the exact layout of the profile page.
 */
const ProfileSkeletonExample = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        ProfileSkeleton Examples
      </h1>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Basic Usage
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Single profile skeleton matching the ProfilePage layout.
        </p>
        
        <ProfileSkeleton />
      </section>

      {/* With Custom Class */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          With Custom Class
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Profile skeleton with custom styling.
        </p>
        
        <ProfileSkeleton className="opacity-75" />
      </section>

      {/* In Loading State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Conditional Rendering
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Show skeleton while loading, then show actual profile.
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Example Code:
          </h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
            <code>{`const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile().then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return <ProfileContent profile={profile} />;
};`}</code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              ✅ Matches Profile Layout
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Skeleton structure matches the actual profile page layout exactly.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              ✅ Pulse Animation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Smooth pulse animation using Tailwind's animate-pulse.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              ✅ Dark Mode Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically adapts to light and dark themes.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              ✅ RTL Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Supports right-to-left layout for Arabic language.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              ✅ Prevents Layout Shifts
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fixed dimensions prevent CLS (Cumulative Layout Shift).
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              ✅ Accessibility
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Proper ARIA attributes for screen readers.
            </p>
          </div>
        </div>
      </section>

      {/* Component Structure */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Component Structure
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>📸 <strong>Profile Header</strong> - Avatar (circle), name, title, bio</li>
            <li>📊 <strong>Stats Section</strong> - 3 stat cards in responsive grid</li>
            <li>📝 <strong>Content Section</strong> - Section title and 3 content lines</li>
            <li>🏷️ <strong>Skills/Tags</strong> - 6 pill-shaped skill tags</li>
            <li>🔘 <strong>Action Buttons</strong> - 2 rounded action buttons</li>
          </ul>
        </div>
      </section>

      {/* API Reference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          API Reference
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 px-4 text-gray-900 dark:text-white">Prop</th>
                <th className="py-2 px-4 text-gray-900 dark:text-white">Type</th>
                <th className="py-2 px-4 text-gray-900 dark:text-white">Default</th>
                <th className="py-2 px-4 text-gray-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 px-4 font-mono text-sm">className</td>
                <td className="py-2 px-4">string</td>
                <td className="py-2 px-4">''</td>
                <td className="py-2 px-4">Additional CSS classes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ProfileSkeletonExample;
