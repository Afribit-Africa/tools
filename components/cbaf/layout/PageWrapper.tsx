import { ReactNode } from 'react';

export interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
}
