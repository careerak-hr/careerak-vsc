import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeviceTest from '../DeviceTest';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();

beforeAll(() => {
  global.navigator.mediaDevices = {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices
  };

  // Mock AudioContext
  global.AudioContext = jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn(() => ({
      fftSize: 256,
      frequencyBinCount: 128,
      getByteFrequencyData: jest.fn()
    })),
    createMediaStreamSource: jest.fn(() => ({
      connect: jest.fn()
    })),
    close: jest.fn()
  }));

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
  global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('DeviceTest Component', () => {
  const mockDevices = [
    { deviceId: 'camera1', kind: 'videoinput', label: 'Camera 1' },
    { deviceId: 'camera2', kind: 'videoinput', label: 'Camera 2' },
    { deviceId: 'mic1', kind: 'audioinput', label: 'Microphone 1' },
    { deviceId: 'mic2', kind: 'audioinput', label: 'Microphone 2' }
  ];

  const mockStream = {
    getTracks: jest.fn(() => [
      { stop: jest.fn() }
    ])
  };

  beforeEach(() => {
    mockGetUserMedia.mockResolvedValue(mockStream);
    mockEnumerateDevices.mockResolvedValue(mockDevices);
  });

  test('renders component with title', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      expect(screen.getByText('اختبار الكاميرا والميكروفون')).toBeInTheDocument();
    });
  });

  test('loads devices on mount', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true, audio: true });
      expect(mockEnumerateDevices).toHaveBeenCalled();
    });
  });

  test('displays camera options', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
      expect(screen.getByText('Camera 2')).toBeInTheDocument();
    });
  });

  test('displays microphone options', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      expect(screen.getByText('Microphone 1')).toBeInTheDocument();
      expect(screen.getByText('Microphone 2')).toBeInTheDocument();
    });
  });

  test('tests camera when button clicked', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      const testButton = screen.getByText('اختبار الكاميرا');
      fireEvent.click(testButton);
    });

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.any(Object),
          audio: false
        })
      );
    });
  });

  test('tests microphone when button clicked', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      const testButton = screen.getByText('اختبار الميكروفون');
      fireEvent.click(testButton);
    });

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          audio: expect.any(Object),
          video: false
        })
      );
    });
  });

  test('shows success status after camera test', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      const testButton = screen.getByText('اختبار الكاميرا');
      fireEvent.click(testButton);
    });

    await waitFor(() => {
      expect(screen.getByText('الكاميرا تعمل بشكل جيد')).toBeInTheDocument();
    });
  });

  test('shows success status after microphone test', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      const testButton = screen.getByText('اختبار الميكروفون');
      fireEvent.click(testButton);
    });

    await waitFor(() => {
      expect(screen.getByText('الميكروفون يعمل بشكل جيد')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('enables continue button after both tests pass', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    // Test camera
    await waitFor(() => {
      const cameraButton = screen.getByText('اختبار الكاميرا');
      fireEvent.click(cameraButton);
    });

    await waitFor(() => {
      expect(screen.getByText('الكاميرا تعمل بشكل جيد')).toBeInTheDocument();
    });

    // Test microphone
    await waitFor(() => {
      const micButton = screen.getByText('اختبار الميكروفون');
      fireEvent.click(micButton);
    });

    await waitFor(() => {
      expect(screen.getByText('الميكروفون يعمل بشكل جيد')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Continue button should be enabled
    const continueButton = screen.getByText('متابعة');
    expect(continueButton).not.toBeDisabled();
  });

  test('calls onTestComplete when continue clicked', async () => {
    const mockOnTestComplete = jest.fn();
    render(<DeviceTest onTestComplete={mockOnTestComplete} language="ar" />);
    
    // Test camera
    await waitFor(() => {
      const cameraButton = screen.getByText('اختبار الكاميرا');
      fireEvent.click(cameraButton);
    });

    await waitFor(() => {
      expect(screen.getByText('الكاميرا تعمل بشكل جيد')).toBeInTheDocument();
    });

    // Test microphone
    await waitFor(() => {
      const micButton = screen.getByText('اختبار الميكروفون');
      fireEvent.click(micButton);
    });

    await waitFor(() => {
      expect(screen.getByText('الميكروفون يعمل بشكل جيد')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click continue
    const continueButton = screen.getByText('متابعة');
    fireEvent.click(continueButton);

    expect(mockOnTestComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        cameraId: expect.any(String),
        microphoneId: expect.any(String),
        devicesWorking: true
      })
    );
  });

  test('handles permission denied error', async () => {
    mockGetUserMedia.mockRejectedValueOnce({ name: 'NotAllowedError' });
    
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      expect(screen.getByText(/تم رفض الإذن/)).toBeInTheDocument();
    });
  });

  test('handles device error', async () => {
    mockGetUserMedia.mockRejectedValueOnce({ name: 'DeviceError' });
    
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      expect(screen.getByText(/حدث خطأ/)).toBeInTheDocument();
    });
  });

  test('renders in English', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="en" />);
    
    await waitFor(() => {
      expect(screen.getByText('Camera and Microphone Test')).toBeInTheDocument();
    });
  });

  test('renders in French', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="fr" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test de caméra et microphone')).toBeInTheDocument();
    });
  });

  test('stops stream on unmount', async () => {
    const { unmount } = render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      const cameraButton = screen.getByText('اختبار الكاميرا');
      fireEvent.click(cameraButton);
    });

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    unmount();

    expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
  });

  test('allows camera selection change', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      const cameraSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(cameraSelect, { target: { value: 'camera2' } });
    });

    await waitFor(() => {
      const cameraSelect = screen.getAllByRole('combobox')[0];
      expect(cameraSelect.value).toBe('camera2');
    });
  });

  test('allows microphone selection change', async () => {
    render(<DeviceTest onTestComplete={jest.fn()} language="ar" />);
    
    await waitFor(() => {
      const micSelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(micSelect, { target: { value: 'mic2' } });
    });

    await waitFor(() => {
      const micSelect = screen.getAllByRole('combobox')[1];
      expect(micSelect.value).toBe('mic2');
    });
  });
});
