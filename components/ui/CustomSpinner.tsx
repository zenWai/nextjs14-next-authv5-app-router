import * as React from 'react';

export const CustomSpinner = () => (
  <div aria-label='Loading' className='mr-2 h-6 w-6'>
    <div className='h-full w-full animate-spin rounded-full border-2 border-current border-t-transparent' />
  </div>
);
