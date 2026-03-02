# Course Recommendations Dashboard Component

## Overview
The `CourseRecommendationsDashboard` component is a React component that displays AI-recommended courses with level filtering functionality. It allows users to filter courses by skill level (beginner, intermediate, advanced) and view employment improvement predictions.

## Task Information
- **Task**: 14.4 Courses Recommendations
- **Requirements**: 2.1 (Skill gap analysis), 2.3 (Employment improvement prediction)
- **Component**: `frontend/src/components/CourseRecommendationsDashboard.jsx`
- **CSS**: `frontend/src/components/CourseRecommendationsDashboard.css`
- **Tests**: `frontend/src/tests/course-recommendations.test.jsx`
- **Example**: `frontend/src/examples/CourseRecommendationsExample.jsx`

## Features

### 1. Level Filtering
- Filter courses by: All Levels, Beginner, Intermediate, Advanced
- Real-time filtering with visual feedback
- Filter statistics showing course distribution by level
- Reset filter functionality

### 2. Course Display
- Course cards with match scores (0-100%)
- Employment improvement predictions
- Skills covered by each course
- Course duration and priority levels
- Learning path visualization
- Multi-language support (Arabic, English, French)

### 3. User Experience
- Responsive design for all device sizes
- Dark mode support
- Loading states and error handling
- Local storage caching for offline access
- Accessibility compliant (ARIA labels, keyboard navigation)

## Component Structure

### State Management
```javascript
const [recommendations, setRecommendations] = useState([]);
const [filteredRecommendations, setFilteredRecommendations] = useState([]);
const [selectedLevel, setSelectedLevel] = useState('all'); // 'all', 'beginner', 'intermediate', 'advanced'
```

### Key Functions
1. `filterRecommendationsByLevel()` - Filters courses by selected level
2. `calculateLevelDistribution()` - Calculates course distribution by level
3. `fetchCourseRecommendations()` - Fetches courses from API
4. `getQuickRecommendations()` - Gets quick recommendations based on user profile

## API Integration

### Expected API Response
```json
{
  "success": true,
  "courseRecommendations": [
    {
      "id": "course-1",
      "title": "React Fundamentals",
      "description": "Learn React basics",
      "level": "beginner",
      "matchScore": 85,
      "employmentImprovement": { "percentage": 30 },
      "skills": ["JavaScript", "React", "HTML"],
      "duration": "4 weeks",
      "priority": "high",
      "category": "Web Development",
      "learningPath": [
        {
          "week": 1,
          "title": "Introduction to React",
          "skills": ["JSX", "Components", "Props"]
        }
      ]
    }
  ],
  "employmentImprovement": {
    "average": 35,
    "max": 50,
    "improvementPlan": {
      "immediateActions": ["Complete beginner courses"],
      "shortTermGoals": ["Build 2 projects"],
      "longTermDevelopment": ["Master advanced concepts"]
    }
  }
}
```

### API Endpoints
- `GET /recommendations/courses` - Main course recommendations
- `GET /recommendations/courses/quick` - Quick recommendations
- `GET /recommendations/skill-gaps` - Skill gap analysis

## Usage Examples

### Basic Usage
```jsx
import CourseRecommendationsDashboard from './components/CourseRecommendationsDashboard';

function LearningPage() {
  return (
    <div className="learning-page">
      <h1>Recommended Courses</h1>
      <CourseRecommendationsDashboard />
    </div>
  );
}
```

### With Custom Styling
```jsx
function CustomLearningPage() {
  return (
    <div className="custom-learning-page">
      <CourseRecommendationsDashboard />
      <style jsx>{`
        .custom-learning-page :global(.course-recommendations-dashboard) {
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
```

## Level Filtering Implementation

### Filter Logic
```javascript
const filterRecommendationsByLevel = (courses, level) => {
  if (level === 'all') {
    return courses;
  }
  return courses.filter(course => 
    course.level?.toLowerCase() === level.toLowerCase()
  );
};
```

### Level Distribution
```javascript
const calculateLevelDistribution = (courses) => {
  const distribution = {
    all: courses.length,
    beginner: 0,
    intermediate: 0,
    advanced: 0
  };
  
  courses.forEach(course => {
    const level = course.level?.toLowerCase();
    if (level === 'beginner') distribution.beginner++;
    else if (level === 'intermediate') distribution.intermediate++;
    else if (level === 'advanced') distribution.advanced++;
  });
  
  return distribution;
};
```

## Styling

### CSS Structure
- `.course-recommendations-dashboard` - Main container
- `.level-filter-section` - Level filtering controls
- `.course-recommendations-grid` - Course cards grid
- `.course-recommendation-card` - Individual course card
- `.impact-analysis-section` - Employment improvement analysis
- `.learning-paths-section` - Learning path visualization

### Color Scheme
- Primary: `#304B60` (Dark Blue)
- Secondary: `#E3DAD1` (Beige)
- Accent: `#D48161` (Copper)
- Text: `#495057` (Dark Gray)

## Testing

### Test Coverage
- Component rendering and basic functionality
- Level filtering logic
- API integration and error handling
- Accessibility compliance
- Responsive behavior

### Running Tests
```bash
cd frontend
npm test -- course-recommendations.test.jsx
```

## Accessibility

### ARIA Attributes
- `role="region"` and `aria-labelledby` for main container
- `role="article"` for course cards
- `role="progressbar"` for match scores
- `aria-label` and `aria-pressed` for filter buttons
- `role="status"` and `aria-live` for loading/empty states

### Keyboard Navigation
- Tab navigation through all interactive elements
- Space/Enter to activate filter buttons
- Focus indicators for all interactive elements

## Responsive Design

### Breakpoints
- **Desktop**: 1024px+ (3-column grid)
- **Tablet**: 768px-1023px (2-column grid)
- **Mobile**: <768px (1-column grid)

### Mobile Optimizations
- Stacked filter buttons on small screens
- Simplified course cards on mobile
- Touch-friendly button sizes (min 44x44px)
- Reduced padding on small screens

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

### Optimizations
- Lazy loading of course images
- Local storage caching for API responses
- Debounced filter updates
- Memoized calculations for level distribution
- Efficient re-renders with React.memo patterns

### Bundle Size
- Component: ~15KB (gzipped)
- CSS: ~8KB (gzipped)
- Dependencies: React hooks only

## Integration with Existing Systems

### Recommendation Engine
- Integrates with AI recommendation system
- Supports content-based and collaborative filtering
- Real-time updates based on user interactions

### User Profile System
- Personalizes recommendations based on user skills
- Updates recommendations when profile changes
- Tracks course interactions for ML training

### Notification System
- Sends notifications for new course matches
- Alerts for course enrollment deadlines
- Reminders for learning path progress

## Future Enhancements

### Planned Features
1. **Advanced Filtering**: Filter by category, duration, rating
2. **Sorting Options**: Sort by match score, employment improvement, popularity
3. **Personalized Learning Paths**: AI-generated learning paths based on career goals
4. **Progress Tracking**: Track course completion and skill acquisition
5. **Social Features**: Share courses, see what others are learning
6. **Offline Mode**: Download courses for offline learning
7. **Gamification**: Badges, achievements, learning streaks

### Technical Improvements
1. **Virtualized Lists**: For better performance with large course catalogs
2. **SSR Support**: Server-side rendering for better SEO
3. **PWA Integration**: Installable as standalone app
4. **Analytics Integration**: Track user engagement and conversion
5. **A/B Testing**: Test different recommendation algorithms

## Troubleshooting

### Common Issues

1. **No courses showing**
   - Check API connectivity
   - Verify user authentication
   - Check localStorage for cached data

2. **Filter not working**
   - Verify course data has `level` property
   - Check level values match filter options
   - Clear browser cache and localStorage

3. **Slow performance**
   - Reduce number of courses displayed
   - Implement virtual scrolling
   - Optimize images and assets

4. **Accessibility issues**
   - Run accessibility audit
   - Check ARIA attributes
   - Test with screen readers

### Debugging
```javascript
// Enable debug logging
localStorage.setItem('debug_course_recommendations', 'true');

// Check stored data
console.log('Cached courses:', localStorage.getItem('course_recommendations_data'));
console.log('Level distribution:', calculateLevelDistribution(recommendations));
```

## Contributing

### Development Setup
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Code Standards
- Follow existing component patterns
- Use functional components with hooks
- Implement proper TypeScript/PropTypes
- Write comprehensive tests
- Document all public APIs
- Follow accessibility guidelines

### Pull Request Checklist
- [ ] Tests pass
- [ ] Accessibility compliant
- [ ] Responsive design tested
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance optimized
- [ ] Code reviewed

## License
This component is part of the Careerak project. See project LICENSE for details.

## Changelog

### v1.0.0 (2026-02-23)
- Initial release
- Course recommendations with level filtering
- Employment improvement predictions
- Multi-language support
- Responsive design
- Accessibility compliance
- Comprehensive testing

### v1.1.0 (Planned)
- Advanced filtering options
- Sorting capabilities
- Personalized learning paths
- Progress tracking
- Social features
- Offline mode support