import React from 'react';
import Layout from './layout/Layout';

interface LayoutProps {
  children: React.ReactNode;
}

// This is now just a wrapper around our refactored Layout component
// We keep this file to maintain backward compatibility with existing imports
const LayoutWrapper: React.FC<LayoutProps> = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export default LayoutWrapper;
