import { useApp } from '../context/AppContext'; // Corrected import

const useNavigationGuard = () => {
  const { user } = useApp(); // Corrected hook

  // ... (rest of the hook remains the same)
};

export default useNavigationGuard;
