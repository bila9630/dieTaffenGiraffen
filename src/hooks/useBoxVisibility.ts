import { useContext } from 'react';
import { BoxVisibilityContext } from '@/contexts/BoxVisibilityContext';

export const useBoxVisibility = () => {
  const context = useContext(BoxVisibilityContext);

  if (!context) {
    throw new Error('useBoxVisibility must be used within a BoxVisibilityProvider');
  }

  return context;
};
