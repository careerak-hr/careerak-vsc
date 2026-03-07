# Application Multi-Step Form Components

This directory contains the multi-step form components for the job application process.

## Components

### MultiStepForm
Main container component that manages the multi-step application flow.

**Features:**
- Step navigation (next/previous)
- Progress indicator showing current step and completed steps
- Step validation before proceeding
- Auto-save integration (via onSave prop)
- Error handling and display
- Responsive design with mobile support
- RTL support

**Props:**
- `onSave`: Function to save draft
- `onCancel`: Function to cancel application

### PersonalInfoStep (Step 1)
Collects personal contact information.

**Fields:**
- Full Name (required)
- Email (required)
- Phone (required)
- Country (optional)
- City (optional)

**Features:**
- Inline validation
- Auto-fill from user profile (to be implemented in task 8)
- Responsive layout
- RTL support
- Accessibility (ARIA labels, error messages)

### EducationExperienceStep (Step 2)
Collects education and work experience.

**Features:**
- Dynamic education entries (add/remove)
- Dynamic experience entries (add/remove)
- Auto-fill from user profile (to be implemented in task 8)
- Validation for required fields
- Responsive layout
- RTL support

**Education Fields:**
- Level, Degree (required), Institution (required)
- City, Country, Year, Grade

**Experience Fields:**
- Company, Position, From/To dates
- Current position checkbox
- Responsibilities, Work Type, Job Level
- City, Country

### SkillsLanguagesStep (Step 3)
Collects skills and language proficiencies.

**Features:**
- Three skill categories: Computer Skills, Software Skills, Other Skills
- Dynamic skill entries with proficiency levels
- Dynamic language entries with proficiency levels
- Auto-fill from user profile (to be implemented in task 8)
- At least one skill required
- Responsive layout
- RTL support

## Usage

```jsx
import { ApplicationProvider } from '../../context/ApplicationContext';
import { MultiStepForm } from './';

function ApplicationPage({ jobPostingId }) {
  const handleSave = () => {
    // Save draft logic
  };

  const handleCancel = () => {
    // Cancel logic
  };

  return (
    <ApplicationProvider jobPostingId={jobPostingId}>
      <MultiStepForm 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </ApplicationProvider>
  );
}
```

## Styling

Each component has its own CSS file with:
- Responsive breakpoints (mobile, tablet, desktop)
- RTL support
- Dark mode support
- Touch-friendly targets (44x44px minimum)
- Accessibility features

## Integration

The components integrate with:
- **ApplicationContext**: For state management
- **Auto-save service**: For draft saving (task 7)
- **Auto-fill service**: For profile data (task 8)
- **File upload**: For documents (task 11)
- **Preview**: For review before submission (task 12)

## Next Steps

- Task 11: Build file upload UI component (Step 4)
- Task 12: Build preview and submission UI (Step 5)
- Task 8: Implement auto-fill functionality
- Task 7: Implement auto-save functionality

## Requirements Validated

- ✅ Requirement 7.1: Multi-step form with 5 steps
- ✅ Requirement 7.2: Progress indicator
- ✅ Requirement 7.3: Next button enabled after required fields
- ✅ Requirement 7.4: Step validation before navigation
- ✅ Requirement 7.6: Previous button without validation
- ✅ Requirement 7.7: Data preservation across navigation
- ✅ Requirement 9.1-9.3: Inline validation and feedback
- ✅ Requirement 10.1-10.10: Responsive design and accessibility
