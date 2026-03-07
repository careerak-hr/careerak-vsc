import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import CoursePlayerPage from '../pages/CoursePlayerPage';
import ProgressTracker from '../components/courses/ProgressTracker';
import LessonContent from '../components/courses/LessonContent';
import QuizComponent from '../components/courses/QuizComponent';

// Mock fetch
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ courseId: 'course123' })
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

const mockCourse = {
  _id: 'course123',
  title: 'Test Course',
  totalLessons: 5,
  stats: {
    totalEnrollments: 100
  }
};

const mockEnrollment = {
  _id: 'enrollment123',
  course: 'course123',
  student: 'student123',
  status: 'active',
  enrolledAt: '2024-01-01',
  progress: {
    completedLessons: ['lesson1', 'lesson2'],
    percentageComplete: 40,
    lastAccessedAt: '2024-01-15'
  },
  certificateIssued: {
    issued: false
  }
};

const mockLessons = [
  {
    _id: 'lesson1',
    title: 'Introduction',
    content: 'video',
    videoUrl: 'https://example.com/video1.mp4',
    duration: 10,
    order: 1
  },
  {
    _id: 'lesson2',
    title: 'Basics',
    content: 'text',
    textContent: '<p>Lesson content</p>',
    duration: 15,
    order: 2
  },
  {
    _id: 'lesson3',
    title: 'Quiz',
    content: 'quiz',
    duration: 20,
    order: 3,
    quiz: {
      questions: [
        {
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          explanation: 'Basic math'
        }
      ],
      passingScore: 70
    }
  }
];

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('CoursePlayerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithProviders(<CoursePlayerPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('fetches and displays course data', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ course: mockCourse })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enrollment: mockEnrollment })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lessons: mockLessons })
      });

    renderWithProviders(<CoursePlayerPage />);

    await waitFor(() => {
      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
    });
  });

  test('shows error when not enrolled', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ course: mockCourse })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404
      });

    renderWithProviders(<CoursePlayerPage />);

    await waitFor(() => {
      expect(screen.getByText(/must enroll/i)).toBeInTheDocument();
    });
  });

  test('navigates to previous lesson', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ course: mockCourse })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enrollment: mockEnrollment })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lessons: mockLessons })
      });

    renderWithProviders(<CoursePlayerPage />);

    await waitFor(() => {
      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
    });

    // Find and click next button first
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    // Then click previous
    const prevButton = screen.getByText(/previous/i);
    fireEvent.click(prevButton);

    // Should be back to first lesson
    expect(screen.getByText(mockLessons[0].title)).toBeInTheDocument();
  });

  test('marks lesson as complete', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ course: mockCourse })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enrollment: mockEnrollment })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lessons: mockLessons })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          enrollment: {
            ...mockEnrollment,
            progress: {
              ...mockEnrollment.progress,
              completedLessons: [...mockEnrollment.progress.completedLessons, 'lesson3']
            }
          }
        })
      });

    renderWithProviders(<CoursePlayerPage />);

    await waitFor(() => {
      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
    });

    const completeButton = screen.getByText(/mark.*complete/i);
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/complete'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });
});

describe('ProgressTracker', () => {
  test('displays progress percentage', () => {
    renderWithProviders(
      <ProgressTracker 
        enrollment={mockEnrollment}
        course={mockCourse}
        onContinue={jest.fn()}
      />
    );

    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  test('displays completed lessons count', () => {
    renderWithProviders(
      <ProgressTracker 
        enrollment={mockEnrollment}
        course={mockCourse}
        onContinue={jest.fn()}
      />
    );

    expect(screen.getByText(/2.*5/)).toBeInTheDocument();
  });

  test('shows continue learning button for active enrollment', () => {
    renderWithProviders(
      <ProgressTracker 
        enrollment={mockEnrollment}
        course={mockCourse}
        onContinue={jest.fn()}
      />
    );

    expect(screen.getByText(/continue learning/i)).toBeInTheDocument();
  });

  test('shows certificate button for completed course', () => {
    const completedEnrollment = {
      ...mockEnrollment,
      status: 'completed',
      completedAt: '2024-02-01',
      certificateIssued: {
        issued: true,
        certificateUrl: 'https://example.com/cert.pdf'
      }
    };

    renderWithProviders(
      <ProgressTracker 
        enrollment={completedEnrollment}
        course={mockCourse}
        onContinue={jest.fn()}
      />
    );

    expect(screen.getByText(/download certificate/i)).toBeInTheDocument();
  });

  test('downloads certificate when button clicked', async () => {
    const completedEnrollment = {
      ...mockEnrollment,
      status: 'completed',
      certificateIssued: {
        issued: true,
        certificateUrl: 'https://example.com/cert.pdf'
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ certificateUrl: 'https://example.com/cert.pdf' })
    });

    window.open = jest.fn();

    renderWithProviders(
      <ProgressTracker 
        enrollment={completedEnrollment}
        course={mockCourse}
        onContinue={jest.fn()}
      />
    );

    const certButton = screen.getByText(/download certificate/i);
    fireEvent.click(certButton);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('https://example.com/cert.pdf', '_blank');
    });
  });
});

describe('LessonContent', () => {
  test('renders video lesson', () => {
    renderWithProviders(
      <LessonContent 
        lesson={mockLessons[0]}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText(/video lesson/i)).toBeInTheDocument();
  });

  test('renders text lesson', () => {
    renderWithProviders(
      <LessonContent 
        lesson={mockLessons[1]}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText(/text lesson/i)).toBeInTheDocument();
  });

  test('renders quiz lesson', () => {
    renderWithProviders(
      <LessonContent 
        lesson={mockLessons[2]}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText(/quiz/i)).toBeInTheDocument();
  });

  test('displays lesson resources', () => {
    const lessonWithResources = {
      ...mockLessons[0],
      resources: [
        { title: 'Slides', url: 'https://example.com/slides.pdf', type: 'pdf' }
      ]
    };

    renderWithProviders(
      <LessonContent 
        lesson={lessonWithResources}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Slides')).toBeInTheDocument();
  });
});

describe('QuizComponent', () => {
  const mockQuiz = mockLessons[2].quiz;

  test('displays quiz question', () => {
    renderWithProviders(
      <QuizComponent 
        quiz={mockQuiz}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
  });

  test('allows selecting an answer', () => {
    renderWithProviders(
      <QuizComponent 
        quiz={mockQuiz}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    const option = screen.getByText('4');
    fireEvent.click(option);

    expect(option.closest('.quiz-option')).toHaveClass('selected');
  });

  test('calculates score correctly', () => {
    renderWithProviders(
      <QuizComponent 
        quiz={mockQuiz}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    // Select correct answer
    const correctOption = screen.getByText('4');
    fireEvent.click(correctOption);

    // Submit
    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

    // Should show 100% score
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('shows explanation after submission', () => {
    renderWithProviders(
      <QuizComponent 
        quiz={mockQuiz}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    // Select and submit
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText(/submit/i));

    expect(screen.getByText(/basic math/i)).toBeInTheDocument();
  });

  test('calls onComplete when passing score achieved', () => {
    const onComplete = jest.fn();

    renderWithProviders(
      <QuizComponent 
        quiz={mockQuiz}
        onComplete={onComplete}
        isCompleted={false}
      />
    );

    // Select correct answer and submit
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText(/submit/i));

    expect(onComplete).toHaveBeenCalled();
  });

  test('allows retry on failed quiz', () => {
    renderWithProviders(
      <QuizComponent 
        quiz={mockQuiz}
        onComplete={jest.fn()}
        isCompleted={false}
      />
    );

    // Select wrong answer and submit
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText(/submit/i));

    // View results
    fireEvent.click(screen.getByText(/view results/i));

    // Should show retry button
    expect(screen.getByText(/retry/i)).toBeInTheDocument();
  });
});
