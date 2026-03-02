import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoCall from '../VideoCall';

describe('VideoCall Component - Audio/Video Controls', () => {
  const mockOnToggleAudio = jest.fn();
  const mockOnToggleVideo = jest.fn();
  const mockOnSwitchCamera = jest.fn();

  const defaultProps = {
    localStream: null,
    remoteStream: null,
    onToggleAudio: mockOnToggleAudio,
    onToggleVideo: mockOnToggleVideo,
    onSwitchCamera: mockOnSwitchCamera,
    isAudioEnabled: true,
    isVideoEnabled: true,
    connectionQuality: 'good',
    hasMultipleCameras: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Audio Control Button', () => {
    test('renders audio button with correct icon when audio is enabled', () => {
      render(<VideoCall {...defaultProps} />);
      const audioButton = screen.getByTitle('كتم الصوت');
      expect(audioButton).toBeInTheDocument();
      expect(audioButton).toHaveTextContent('🎤');
    });

    test('renders audio button with correct icon when audio is disabled', () => {
      render(<VideoCall {...defaultProps} isAudioEnabled={false} />);
      const audioButton = screen.getByTitle('تفعيل الصوت');
      expect(audioButton).toBeInTheDocument();
      expect(audioButton).toHaveTextContent('🔇');
      expect(audioButton).toHaveClass('disabled');
    });

    test('calls onToggleAudio when audio button is clicked', () => {
      render(<VideoCall {...defaultProps} />);
      const audioButton = screen.getByTitle('كتم الصوت');
      fireEvent.click(audioButton);
      expect(mockOnToggleAudio).toHaveBeenCalledTimes(1);
    });
  });

  describe('Video Control Button', () => {
    test('renders video button with correct icon when video is enabled', () => {
      render(<VideoCall {...defaultProps} />);
      const videoButton = screen.getByTitle('إيقاف الفيديو');
      expect(videoButton).toBeInTheDocument();
      expect(videoButton).toHaveTextContent('📹');
    });

    test('renders video button with correct icon when video is disabled', () => {
      render(<VideoCall {...defaultProps} isVideoEnabled={false} />);
      const videoButton = screen.getByTitle('تفعيل الفيديو');
      expect(videoButton).toBeInTheDocument();
      expect(videoButton).toHaveTextContent('📷');
      expect(videoButton).toHaveClass('disabled');
    });

    test('calls onToggleVideo when video button is clicked', () => {
      render(<VideoCall {...defaultProps} />);
      const videoButton = screen.getByTitle('إيقاف الفيديو');
      fireEvent.click(videoButton);
      expect(mockOnToggleVideo).toHaveBeenCalledTimes(1);
    });

    test('shows video disabled overlay when video is off', () => {
      render(<VideoCall {...defaultProps} isVideoEnabled={false} />);
      const overlay = document.querySelector('.video-disabled-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveTextContent('📷');
    });
  });

  describe('Camera Switch Button', () => {
    test('does not render switch button when hasMultipleCameras is false', () => {
      render(<VideoCall {...defaultProps} hasMultipleCameras={false} />);
      const switchButton = screen.queryByTitle('تبديل الكاميرا');
      expect(switchButton).not.toBeInTheDocument();
    });

    test('renders switch button when hasMultipleCameras is true', () => {
      render(<VideoCall {...defaultProps} hasMultipleCameras={true} />);
      const switchButton = screen.getByTitle('تبديل الكاميرا');
      expect(switchButton).toBeInTheDocument();
      expect(switchButton).toHaveTextContent('🔄');
    });

    test('calls onSwitchCamera when switch button is clicked', () => {
      render(<VideoCall {...defaultProps} hasMultipleCameras={true} />);
      const switchButton = screen.getByTitle('تبديل الكاميرا');
      fireEvent.click(switchButton);
      expect(mockOnSwitchCamera).toHaveBeenCalledTimes(1);
    });

    test('disables switch button when video is off', () => {
      render(<VideoCall {...defaultProps} hasMultipleCameras={true} isVideoEnabled={false} />);
      const switchButton = screen.getByTitle('تبديل الكاميرا');
      expect(switchButton).toBeDisabled();
    });
  });

  describe('Connection Quality Indicator', () => {
    test('displays correct quality text for excellent connection', () => {
      render(<VideoCall {...defaultProps} connectionQuality="excellent" />);
      expect(screen.getByText('ممتاز')).toBeInTheDocument();
    });

    test('displays correct quality text for good connection', () => {
      render(<VideoCall {...defaultProps} connectionQuality="good" />);
      expect(screen.getByText('جيد')).toBeInTheDocument();
    });

    test('displays correct quality text for poor connection', () => {
      render(<VideoCall {...defaultProps} connectionQuality="poor" />);
      expect(screen.getByText('ضعيف')).toBeInTheDocument();
    });
  });

  describe('Video Streams', () => {
    test('shows placeholder when no remote stream', () => {
      render(<VideoCall {...defaultProps} remoteStream={null} />);
      expect(screen.getByText('في انتظار الطرف الآخر...')).toBeInTheDocument();
    });
  });
});
