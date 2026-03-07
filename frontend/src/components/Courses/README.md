# Course Components

This directory contains all components related to the Courses Page Enhancements feature.

## Components

### CourseFilters

A comprehensive filtering component for courses with support for multiple filter types.

#### Features

- **Level Filter**: Checkbox selection for Beginner, Intermediate, and Advanced levels
- **Category Filter**: Dropdown selection for course categories
- **Duration Filter**: Range slider with numeric inputs for course duration (0-100 hours)
- **Price Filter**: Radio buttons for All, Free, and Paid courses
- **Rating Filter**: Star-based minimum rating selector (1-5 stars)
- **Clear All**: Button to reset all filters
- **Responsive Design**: 
  - Desktop: Fixed sidebar
  - Mobile: Bottom sheet drawer with overlay
- **Multi-language Support**: Arabic, English, and French
- **Dark Mode**: Full dark mode support
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels and 44px touch targets

#### Props

```jsx
<CourseFilters
  filters={object}      // Current filter state
  onChange={function}   // Callback when filters change
  onClear={function}    // Callback when clear all is clicked
/>
```

#### Filter Object Structure

```javascript
{
  level: 'Beginner' | 'Intermediate' | 'Advanced' | '',
  category: string,
  minDuration: number,
  maxDuration: number,
  isFree: 'true' | 'false' | undefined,
  minRating: 1 | 2 | 3 | 4 | 5 | ''
}
```

#### Usage Example

```jsx
import CourseFilters from './components/Courses/CourseFilters';

function CoursesPage() {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Fetch courses with new filters
  };

  const handleClearFilters = () => {
    setFilters({});
    // Fetch all courses
  };

  return (
    <div className="courses-page">
      <CourseFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />
      {/* Course list */}
    </div>
  );
}
```

#### Responsive Behavior

**Desktop (≥768px)**:
- Fixed sidebar with sticky positioning
- Always visible
- Scrollable content

**Mobile (<768px)**:
- Toggle button to open drawer
- Bottom sheet drawer (80vh height)
- Overlay background
- Swipe-friendly interface

#### Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Minimum 44x44px touch targets
- Screen reader compatible
- Focus management
- Reduced motion support

#### Styling

The component uses custom CSS with the following features:
- Project color palette (#304B60, #E3DAD1, #D48161)
- Dark mode support
- RTL layout support
- Smooth transitions
- Custom scrollbar styling

#### Testing

Run tests with:
```bash
npm test -- CourseFilters.test.jsx
```

The test suite covers:
- Rendering all filter groups
- Level filter interactions
- Category filter selection
- Duration slider and inputs
- Price filter radio buttons
- Rating filter star selection
- Clear filters functionality
- Mobile drawer behavior
- Accessibility compliance
- Multi-language support

#### Requirements Validation

This component satisfies the following requirements:
- **1.1**: Level filter (Beginner/Intermediate/Advanced)
- **1.2**: Category filter (dropdown)
- **1.3**: Duration range filter (slider + inputs)
- **1.4**: Price filter (All/Free/Paid)
- **1.5**: Minimum rating filter (1-5 stars)
- **1.7**: Clear all filters button
- **10.4**: Responsive with collapsible drawer on mobile

---

### CourseSortBar

Sort and view options for the courses list.

#### Features

- Sort dropdown (Newest, Popular, Rating, Price)
- View toggle (Grid/List)
- Search input with debouncing
- RTL support

#### Props

```jsx
<CourseSortBar
  sort={string}
  onSortChange={function}
  view={string}
  onViewChange={function}
  searchQuery={string}
  onSearchChange={function}
/>
```

---

### CourseCard

Display individual course information in grid or list view.

#### Features

- Course thumbnail with lazy loading
- Badge display (Most Popular, New, Recommended, Top Rated)
- Course details (title, description, level, duration, lessons)
- Rating and review count
- Enrollment count
- Price display
- Wishlist button
- View Details button
- Grid and list layout support

#### Props

```jsx
<CourseCard
  course={object}
  view={'grid' | 'list'}
/>
```

---

### CourseGrid

Display courses in grid or list layout with empty state handling.

#### Features

- Grid and list view layouts
- Empty state with helpful message
- Loading state
- Responsive columns (1 on mobile, 2 on tablet, 4 on desktop)

#### Props

```jsx
<CourseGrid
  courses={array}
  view={'grid' | 'list'}
  loading={boolean}
/>
```

---

### Pagination

Pagination component for navigating through course pages.

#### Features

- **Page Numbers**: Display current page and total pages
- **Navigation**: Previous and Next buttons
- **Results Count**: Show total results and current range
- **Smart Display**: Shows ellipsis (...) for large page counts
- **Disabled States**: Disables buttons appropriately
- **Responsive Design**: Adapts to mobile, tablet, and desktop
- **Multi-language Support**: Arabic, English, and French
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
- **RTL Support**: Full right-to-left layout support
- **Dark Mode**: Full dark mode support

#### Props

```jsx
<Pagination
  currentPage={number}        // Current page (1-based)
  totalPages={number}         // Total number of pages
  totalResults={number}       // Total number of results
  onPageChange={function}     // Callback when page changes
  resultsPerPage={number}     // Results per page (default: 12)
/>
```

#### Usage Example

```jsx
import Pagination from './components/Courses/Pagination';

function CoursesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 12;

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Fetch courses for the new page
  };

  return (
    <div className="courses-page">
      {/* Course list */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        onPageChange={handlePageChange}
        resultsPerPage={resultsPerPage}
      />
    </div>
  );
}
```

#### Page Number Display Logic

- **≤5 pages**: Shows all page numbers
- **>5 pages**: Shows first, last, and pages around current with ellipsis
- **Current page**: Highlighted with active state
- **Ellipsis**: Shown when pages are skipped

#### Responsive Behavior

**Desktop (≥1024px)**:
- Full button text (Previous/Next)
- All page numbers visible
- Larger touch targets

**Tablet (640px-1023px)**:
- Full button text
- Optimized spacing

**Mobile (<640px)**:
- Icon-only buttons (arrows)
- Smaller page numbers
- Compact layout
- Minimum 40px touch targets

#### Accessibility Features

- Proper ARIA labels for all buttons
- `aria-current="page"` for active page
- Keyboard navigation support
- Focus indicators
- Screen reader compatible
- Disabled state handling

#### Styling

The component uses custom CSS with:
- Project color palette (#304B60, #E3DAD1, #D48161)
- Dark mode support
- RTL layout support
- Smooth transitions
- Hover and active states
- Reduced motion support

#### Testing

Run tests with:
```bash
npm test -- Pagination.test.jsx
```

The test suite covers:
- Rendering with correct info
- Page navigation
- Button states (disabled/enabled)
- Results display
- Multi-language support
- Accessibility compliance
- Edge cases (0 results, 1 page)

#### Requirements Validation

This component satisfies the following requirements:
- **12.6**: Pagination with 12 courses per page by default
- Display page numbers
- Handle page navigation
- Show total results count
- Disable buttons appropriately

---

## File Structure

```
Courses/
├── CourseFilters.jsx          # Main filter component
├── CourseFilters.css          # Filter styles
├── CourseSortBar.jsx          # Sort and view options
├── CourseSortBar.css          # Sort bar styles
├── CourseCard.jsx             # Course card component
├── CourseCard.css             # Course card styles
├── CourseGrid.jsx             # Grid/list layout component
├── CourseGrid.css             # Grid styles
├── Pagination.jsx             # Pagination component
├── Pagination.css             # Pagination styles
├── README.md                  # This file
└── __tests__/
    ├── CourseFilters.test.jsx # Filter component tests
    ├── CourseCard.test.jsx    # Card component tests
    ├── CourseGrid.test.jsx    # Grid component tests
    └── Pagination.test.jsx    # Pagination component tests
```

## Design Standards

All components follow the Careerak design standards:

**Colors**:
- Primary: #304B60 (Navy)
- Secondary: #E3DAD1 (Beige)
- Accent: #D48161 (Copper)
- Border: #D4816180 (Copper 50% opacity)

**Fonts**:
- Arabic: Amiri, Cairo
- English: Cormorant Garamond
- French: EB Garamond

**Accessibility**:
- Minimum touch target: 44x44px
- Color contrast: WCAG AA compliant
- Keyboard navigation: Full support
- Screen readers: ARIA labels

## Contributing

When adding new course components:

1. Follow the existing naming convention
2. Add proper TypeScript/PropTypes
3. Include comprehensive tests
4. Update this README
5. Ensure accessibility compliance
6. Support RTL and dark mode
7. Add multi-language support
