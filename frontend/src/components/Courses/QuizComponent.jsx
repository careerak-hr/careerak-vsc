import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import '../../styles/quizComponent.css';

const QuizComponent = ({ quiz, onComplete, isCompleted }) => {
  const { language } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const translations = {
    ar: {
      question: 'سؤال',
      of: 'من',
      selectAnswer: 'اختر إجابة',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال',
      retry: 'إعادة المحاولة',
      yourScore: 'درجتك',
      passed: 'نجحت!',
      failed: 'لم تنجح',
      passingScore: 'الدرجة المطلوبة',
      correct: 'صحيح',
      incorrect: 'خطأ',
      explanation: 'الشرح',
      results: 'النتائج',
      answeredQuestions: 'الأسئلة المجابة',
      correctAnswers: 'الإجابات الصحيحة',
      viewResults: 'عرض النتائج',
      backToQuiz: 'العودة للاختبار'
    },
    en: {
      question: 'Question',
      of: 'of',
      selectAnswer: 'Select an answer',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      retry: 'Retry',
      yourScore: 'Your Score',
      passed: 'Passed!',
      failed: 'Failed',
      passingScore: 'Passing Score',
      correct: 'Correct',
      incorrect: 'Incorrect',
      explanation: 'Explanation',
      results: 'Results',
      answeredQuestions: 'Answered Questions',
      correctAnswers: 'Correct Answers',
      viewResults: 'View Results',
      backToQuiz: 'Back to Quiz'
    },
    fr: {
      question: 'Question',
      of: 'de',
      selectAnswer: 'Sélectionnez une réponse',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      retry: 'Réessayer',
      yourScore: 'Votre score',
      passed: 'Réussi!',
      failed: 'Échoué',
      passingScore: 'Score de passage',
      correct: 'Correct',
      incorrect: 'Incorrect',
      explanation: 'Explication',
      results: 'Résultats',
      answeredQuestions: 'Questions répondues',
      correctAnswers: 'Réponses correctes',
      viewResults: 'Voir les résultats',
      backToQuiz: 'Retour au quiz'
    }
  };

  const t = translations[language] || translations.en;

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (submitted) return;

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    return (correctCount / quiz.questions.length) * 100;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);
    setShowResults(true);

    // Check if passed
    const passingScore = quiz.passingScore || 70;
    if (finalScore >= passingScore && onComplete && !isCompleted) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setSubmitted(false);
    setScore(0);
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  const handleBackToQuiz = () => {
    setShowResults(false);
  };

  const isAnswered = (questionIndex) => {
    return selectedAnswers.hasOwnProperty(questionIndex);
  };

  const isCorrect = (questionIndex) => {
    return selectedAnswers[questionIndex] === quiz.questions[questionIndex].correctAnswer;
  };

  const allQuestionsAnswered = () => {
    return Object.keys(selectedAnswers).length === quiz.questions.length;
  };

  const passingScore = quiz.passingScore || 70;
  const passed = score >= passingScore;

  if (showResults) {
    return (
      <div className="quiz-results">
        <div className="results-header">
          <h2>{t.results}</h2>
          <div className={`score-display ${passed ? 'passed' : 'failed'}`}>
            <span className="score-label">{t.yourScore}</span>
            <span className="score-value">{score.toFixed(0)}%</span>
            <span className="score-status">
              {passed ? `✓ ${t.passed}` : `✗ ${t.failed}`}
            </span>
          </div>
          <p className="passing-score">
            {t.passingScore}: {passingScore}%
          </p>
        </div>

        <div className="results-summary">
          <div className="summary-stat">
            <span className="stat-value">{Object.keys(selectedAnswers).length}</span>
            <span className="stat-label">{t.answeredQuestions}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">
              {quiz.questions.filter((_, index) => isCorrect(index)).length}
            </span>
            <span className="stat-label">{t.correctAnswers}</span>
          </div>
        </div>

        <div className="results-questions">
          {quiz.questions.map((question, qIndex) => (
            <div 
              key={qIndex}
              className={`result-question ${
                isCorrect(qIndex) ? 'correct' : 'incorrect'
              }`}
            >
              <div className="result-question-header">
                <span className="result-question-number">
                  {t.question} {qIndex + 1}
                </span>
                <span className={`result-status ${isCorrect(qIndex) ? 'correct' : 'incorrect'}`}>
                  {isCorrect(qIndex) ? `✓ ${t.correct}` : `✗ ${t.incorrect}`}
                </span>
              </div>

              <p className="result-question-text">{question.question}</p>

              <div className="result-answers">
                {question.options.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    className={`result-answer ${
                      oIndex === question.correctAnswer ? 'correct-answer' : ''
                    } ${
                      oIndex === selectedAnswers[qIndex] && oIndex !== question.correctAnswer
                        ? 'wrong-answer'
                        : ''
                    }`}
                  >
                    <span className="answer-text">{option}</span>
                    {oIndex === question.correctAnswer && (
                      <span className="answer-indicator">✓</span>
                    )}
                    {oIndex === selectedAnswers[qIndex] && oIndex !== question.correctAnswer && (
                      <span className="answer-indicator">✗</span>
                    )}
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="result-explanation">
                  <strong>{t.explanation}:</strong> {question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button className="back-button" onClick={handleBackToQuiz}>
            {t.backToQuiz}
          </button>
          {!passed && !isCompleted && (
            <button className="retry-button" onClick={handleRetry}>
              {t.retry}
            </button>
          )}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-component">
      {/* Quiz Progress */}
      <div className="quiz-progress">
        <div className="progress-text">
          {t.question} {currentQuestion + 1} {t.of} {quiz.questions.length}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="quiz-question">
        <h3>{question.question}</h3>
      </div>

      {/* Answer Options */}
      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${
              selectedAnswers[currentQuestion] === index ? 'selected' : ''
            } ${submitted && index === question.correctAnswer ? 'correct' : ''} ${
              submitted && 
              selectedAnswers[currentQuestion] === index && 
              index !== question.correctAnswer 
                ? 'incorrect' 
                : ''
            }`}
            onClick={() => handleAnswerSelect(currentQuestion, index)}
            disabled={submitted}
          >
            <span className="option-letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="option-text">{option}</span>
            {submitted && index === question.correctAnswer && (
              <span className="option-indicator">✓</span>
            )}
            {submitted && 
              selectedAnswers[currentQuestion] === index && 
              index !== question.correctAnswer && (
              <span className="option-indicator">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation (shown after submission) */}
      {submitted && question.explanation && (
        <div className="quiz-explanation">
          <strong>{t.explanation}:</strong> {question.explanation}
        </div>
      )}

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          {t.previous}
        </button>

        {!submitted && (
          <>
            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                className="nav-button"
                onClick={handleNext}
                disabled={!isAnswered(currentQuestion)}
              >
                {t.next}
              </button>
            ) : (
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered()}
              >
                {t.submit}
              </button>
            )}
          </>
        )}

        {submitted && (
          <button
            className="view-results-button"
            onClick={handleViewResults}
          >
            {t.viewResults}
          </button>
        )}

        {currentQuestion < quiz.questions.length - 1 && submitted && (
          <button
            className="nav-button"
            onClick={handleNext}
          >
            {t.next}
          </button>
        )}
      </div>

      {/* Question Indicators */}
      <div className="quiz-indicators">
        {quiz.questions.map((_, index) => (
          <div
            key={index}
            className={`indicator ${
              index === currentQuestion ? 'current' : ''
            } ${isAnswered(index) ? 'answered' : ''} ${
              submitted && isCorrect(index) ? 'correct' : ''
            } ${submitted && isAnswered(index) && !isCorrect(index) ? 'incorrect' : ''}`}
            onClick={() => setCurrentQuestion(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizComponent;
