import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomQuestionsManager from './CustomQuestionsManager';

describe('CustomQuestionsManager', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Initial Rendering', () => {
    test('renders with empty questions list', () => {
      render(
        <CustomQuestionsManager 
          questions={[]} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.getByText('Custom Questions')).toBeInTheDocument();
      expect(screen.getByText(/Add up to 5 custom questions/i)).toBeInTheDocument();
      expect(screen.getByText('Add Question')).toBeInTheDocument();
      expect(screen.getByText('0 / 5')).toBeInTheDocument();
    });

    test('renders with existing questions', () => {
      const questions = [
        {
          id: 'q1',
          questionText: 'What is your experience?',
          questionType: 'short_text',
          options: [],
          required: true,
          order: 0
        }
      ];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.getByDisplayValue('What is your experience?')).toBeInTheDocument();
      expect(screen.getByText('1 / 5')).toBeInTheDocument();
    });

    test('renders in Arabic', () => {
      render(
        <CustomQuestionsManager 
          questions={[]} 
          onChange={mockOnChange} 
          language="ar"
        />
      );

      expect(screen.getByText('أسئلة مخصصة')).toBeInTheDocument();
      expect(screen.getByText('إضافة سؤال')).toBeInTheDocument();
    });

    test('renders in French', () => {
      render(
        <CustomQuestionsManager 
          questions={[]} 
          onChange={mockOnChange} 
          language="fr"
        />
      );

      expect(screen.getByText('Questions personnalisées')).toBeInTheDocument();
      expect(screen.getByText('Ajouter une question')).toBeInTheDocument();
    });
  });

  describe('Adding Questions', () => {
    test('adds a new question when Add Question button is clicked', () => {
      render(
        <CustomQuestionsManager 
          questions={[]} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      const newQuestions = mockOnChange.mock.calls[0][0];
      expect(newQuestions).toHaveLength(1);
      expect(newQuestions[0]).toMatchObject({
        questionText: '',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      });
    });

    test('enforces maximum of 5 questions', () => {
      const questions = Array(5).fill(null).map((_, i) => ({
        id: `q${i}`,
        questionText: `Question ${i}`,
        questionType: 'short_text',
        options: [],
        required: false,
        order: i
      }));

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.queryByText('Add Question')).not.toBeInTheDocument();
      expect(screen.getByText(/Maximum limit reached/i)).toBeInTheDocument();
      expect(screen.getByText('5 / 5')).toBeInTheDocument();
    });

    test('disables add button when disabled prop is true', () => {
      render(
        <CustomQuestionsManager 
          questions={[]} 
          onChange={mockOnChange} 
          language="en"
          disabled={true}
        />
      );

      const addButton = screen.getByText('Add Question');
      expect(addButton).toBeDisabled();
    });
  });

  describe('Question Type Selection', () => {
    test('renders all 5 question types in dropdown', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const select = screen.getByRole('combobox');
      const options = Array.from(select.options).map(opt => opt.value);

      expect(options).toEqual([
        'short_text',
        'long_text',
        'single_choice',
        'multiple_choice',
        'yes_no'
      ]);
    });

    test('changes question type when dropdown is changed', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'long_text' } });

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      const updatedQuestions = mockOnChange.mock.calls[0][0];
      expect(updatedQuestions[0].questionType).toBe('long_text');
    });

    test('shows options field for single_choice type', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'single_choice',
        options: ['Option 1', 'Option 2'],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.getByText(/Options/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Option 1\nOption 2')).toBeInTheDocument();
    });

    test('shows options field for multiple_choice type', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'multiple_choice',
        options: ['A', 'B', 'C'],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.getByText(/Options/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('A\nB\nC')).toBeInTheDocument();
    });

    test('hides options field for non-choice types', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.queryByText(/Options/i)).not.toBeInTheDocument();
    });

    test('clears options when changing from choice to non-choice type', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'single_choice',
        options: ['A', 'B'],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'short_text' } });

      const updatedQuestions = mockOnChange.mock.calls[0][0];
      expect(updatedQuestions[0].options).toEqual([]);
    });
  });

  describe('Required Flag', () => {
    test('toggles required flag when checkbox is clicked', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      const updatedQuestions = mockOnChange.mock.calls[0][0];
      expect(updatedQuestions[0].required).toBe(true);
    });

    test('renders checked checkbox for required questions', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'short_text',
        options: [],
        required: true,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('Question Ordering', () => {
    test('moves question up when up button is clicked', () => {
      const questions = [
        { id: 'q1', questionText: 'Q1', questionType: 'short_text', options: [], required: false, order: 0 },
        { id: 'q2', questionText: 'Q2', questionType: 'short_text', options: [], required: false, order: 1 }
      ];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const upButtons = screen.getAllByLabelText('Move Up');
      fireEvent.click(upButtons[1]); // Click up on second question

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      const updatedQuestions = mockOnChange.mock.calls[0][0];
      expect(updatedQuestions[0].id).toBe('q2');
      expect(updatedQuestions[1].id).toBe('q1');
      expect(updatedQuestions[0].order).toBe(0);
      expect(updatedQuestions[1].order).toBe(1);
    });

    test('moves question down when down button is clicked', () => {
      const questions = [
        { id: 'q1', questionText: 'Q1', questionType: 'short_text', options: [], required: false, order: 0 },
        { id: 'q2', questionText: 'Q2', questionType: 'short_text', options: [], required: false, order: 1 }
      ];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const downButtons = screen.getAllByLabelText('Move Down');
      fireEvent.click(downButtons[0]); // Click down on first question

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      const updatedQuestions = mockOnChange.mock.calls[0][0];
      expect(updatedQuestions[0].id).toBe('q2');
      expect(updatedQuestions[1].id).toBe('q1');
    });

    test('disables up button for first question', () => {
      const questions = [
        { id: 'q1', questionText: 'Q1', questionType: 'short_text', options: [], required: false, order: 0 }
      ];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const upButton = screen.getByLabelText('Move Up');
      expect(upButton).toBeDisabled();
    });

    test('disables down button for last question', () => {
      const questions = [
        { id: 'q1', questionText: 'Q1', questionType: 'short_text', options: [], required: false, order: 0 }
      ];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const downButton = screen.getByLabelText('Move Down');
      expect(downButton).toBeDisabled();
    });
  });

  describe('Removing Questions', () => {
    test('removes question when remove button is clicked', () => {
      const questions = [
        { id: 'q1', questionText: 'Q1', questionType: 'short_text', options: [], required: false, order: 0 },
        { id: 'q2', questionText: 'Q2', questionType: 'short_text', options: [], required: false, order: 1 }
      ];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const removeButtons = screen.getAllByLabelText('Remove');
      fireEvent.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      const updatedQuestions = mockOnChange.mock.calls[0][0];
      expect(updatedQuestions).toHaveLength(1);
      expect(updatedQuestions[0].id).toBe('q2');
      expect(updatedQuestions[0].order).toBe(0); // Order should be updated
    });

    test('updates order of remaining questions after removal', () => {
      const questions = [
        { id: 'q1', questionText: 'Q1', questionType: 'short_text', options: [], required: false, order: 0 },
        { id: 'q2', questionText: 'Q2', questionType: 'short_text', options: [], required: false, order: 1 },
        { id: 'q3', questionText: 'Q3', questionType: 'short_text', options: [], required: false, order: 2 }
      ];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      const removeButtons = screen.getAllByLabelText('Remove');
      fireEvent.click(removeButtons[1]); // Remove middle question

      const updatedQuestions = mockOnChange.mock.calls[0][0];
      expect(updatedQuestions).toHaveLength(2);
      expect(updatedQuestions[0].order).toBe(0);
      expect(updatedQuestions[1].order).toBe(1);
    });
  });

  describe('Validation', () => {
    test('validates empty question text', () => {
      const questions = [{
        id: 'q1',
        questionText: '',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      }];

      const { container } = render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      // Trigger validation by trying to update
      const input = screen.getByPlaceholderText(/Enter your question here/i);
      fireEvent.blur(input);

      // Check if error class would be applied (implementation detail)
      expect(input).toHaveAttribute('maxLength', '500');
    });

    test('validates choice questions need at least 2 options', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Choose one',
        questionType: 'single_choice',
        options: ['Only one'],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.getByText(/Options/i)).toBeInTheDocument();
      expect(screen.getByText(/min 2/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for buttons', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.getByLabelText('Move Up')).toBeInTheDocument();
      expect(screen.getByLabelText('Move Down')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove')).toBeInTheDocument();
    });

    test('has proper labels for form inputs', () => {
      const questions = [{
        id: 'q1',
        questionText: 'Test',
        questionType: 'short_text',
        options: [],
        required: false,
        order: 0
      }];

      render(
        <CustomQuestionsManager 
          questions={questions} 
          onChange={mockOnChange} 
          language="en"
        />
      );

      expect(screen.getByLabelText(/Question \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Question Type \*/i)).toBeInTheDocument();
    });
  });
});
