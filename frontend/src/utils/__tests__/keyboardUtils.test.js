/**
 * Tests for keyboard accessibility utilities
 */

import { handleButtonKeyDown, getButtonProps, handleArrowKeyNavigation } from '../keyboardUtils';

describe('keyboardUtils', () => {
  describe('handleButtonKeyDown', () => {
    it('should call callback on Enter key', () => {
      const callback = jest.fn();
      const event = {
        key: 'Enter',
        preventDefault: jest.fn()
      };

      handleButtonKeyDown(event, callback);

      expect(callback).toHaveBeenCalledWith(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call callback on Space key', () => {
      const callback = jest.fn();
      const event = {
        key: ' ',
        preventDefault: jest.fn()
      };

      handleButtonKeyDown(event, callback);

      expect(callback).toHaveBeenCalledWith(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not call callback on other keys', () => {
      const callback = jest.fn();
      const event = {
        key: 'Tab',
        preventDefault: jest.fn()
      };

      handleButtonKeyDown(event, callback);

      expect(callback).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should not prevent default when preventDefault is false', () => {
      const callback = jest.fn();
      const event = {
        key: 'Enter',
        preventDefault: jest.fn()
      };

      handleButtonKeyDown(event, callback, false);

      expect(callback).toHaveBeenCalledWith(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('getButtonProps', () => {
    it('should return correct props object', () => {
      const onClick = jest.fn();
      const ariaLabel = 'Test Button';

      const props = getButtonProps(onClick, ariaLabel);

      expect(props).toHaveProperty('role', 'button');
      expect(props).toHaveProperty('tabIndex', 0);
      expect(props).toHaveProperty('onClick', onClick);
      expect(props).toHaveProperty('onKeyDown');
      expect(props).toHaveProperty('aria-label', ariaLabel);
    });

    it('should merge additional props', () => {
      const onClick = jest.fn();
      const ariaLabel = 'Test Button';
      const additionalProps = {
        className: 'test-class',
        'data-testid': 'test-button'
      };

      const props = getButtonProps(onClick, ariaLabel, additionalProps);

      expect(props).toHaveProperty('className', 'test-class');
      expect(props).toHaveProperty('data-testid', 'test-button');
    });

    it('should trigger onClick on Enter key via onKeyDown', () => {
      const onClick = jest.fn();
      const ariaLabel = 'Test Button';

      const props = getButtonProps(onClick, ariaLabel);
      const event = {
        key: 'Enter',
        preventDefault: jest.fn()
      };

      props.onKeyDown(event);

      expect(onClick).toHaveBeenCalledWith(event);
    });
  });

  describe('handleArrowKeyNavigation', () => {
    let elements;

    beforeEach(() => {
      elements = [
        { focus: jest.fn() },
        { focus: jest.fn() },
        { focus: jest.fn() }
      ];
    });

    it('should navigate to next element on ArrowDown', () => {
      const event = {
        key: 'ArrowDown',
        preventDefault: jest.fn()
      };

      handleArrowKeyNavigation(event, elements, 0, false);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(elements[1].focus).toHaveBeenCalled();
    });

    it('should navigate to previous element on ArrowUp', () => {
      const event = {
        key: 'ArrowUp',
        preventDefault: jest.fn()
      };

      handleArrowKeyNavigation(event, elements, 1, false);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(elements[0].focus).toHaveBeenCalled();
    });

    it('should wrap around to last element when going up from first', () => {
      const event = {
        key: 'ArrowUp',
        preventDefault: jest.fn()
      };

      handleArrowKeyNavigation(event, elements, 0, false);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(elements[2].focus).toHaveBeenCalled();
    });

    it('should wrap around to first element when going down from last', () => {
      const event = {
        key: 'ArrowDown',
        preventDefault: jest.fn()
      };

      handleArrowKeyNavigation(event, elements, 2, false);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(elements[0].focus).toHaveBeenCalled();
    });

    it('should use ArrowRight/ArrowLeft for horizontal navigation', () => {
      const eventRight = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      };

      handleArrowKeyNavigation(eventRight, elements, 0, true);

      expect(eventRight.preventDefault).toHaveBeenCalled();
      expect(elements[1].focus).toHaveBeenCalled();

      const eventLeft = {
        key: 'ArrowLeft',
        preventDefault: jest.fn()
      };

      handleArrowKeyNavigation(eventLeft, elements, 1, true);

      expect(eventLeft.preventDefault).toHaveBeenCalled();
      expect(elements[0].focus).toHaveBeenCalled();
    });
  });
});
