// Export all UI components
export { default as Button } from './ui/Button';
export type { ButtonProps } from './ui/Button';

export { default as Input } from './ui/Input';
export type { InputProps } from './ui/Input';

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps, CardFooterProps } from './ui/Card';

export { default as Badge } from './ui/Badge';
export type { BadgeProps } from './ui/Badge';

export { default as Alert } from './ui/Alert';
export type { AlertProps } from './ui/Alert';

export { default as EmptyState } from './ui/EmptyState';
export type { EmptyStateProps } from './ui/EmptyState';

export { default as Table } from './ui/Table';
export type { TableProps, Column } from './ui/Table';

export { default as Modal } from './ui/Modal';
export type { ModalProps } from './ui/Modal';

export { Toast, ToastContainer, useToast } from './ui/Toast';
export type { ToastProps, ToastType, ToastContainerProps } from './ui/Toast';

export { default as Skeleton, SkeletonCard as SkeletonCardNew, SkeletonTable, SkeletonText as SkeletonTextNew } from './ui/Skeleton';
export type { SkeletonProps } from './ui/Skeleton';

// Export layout components
export { default as PageWrapper } from './layout/PageWrapper';
export type { PageWrapperProps } from './layout/PageWrapper';

export { default as Header } from './layout/Header';
export type { HeaderProps } from './layout/Header';

export { default as Container } from './layout/Container';
export type { ContainerProps } from './layout/Container';

export { default as Sidebar, BCESidebarSections, AdminSidebarSections, SuperAdminSidebarSections } from './layout/Sidebar';
export type { SidebarProps, SidebarItem, SidebarSection } from './layout/Sidebar';

export { default as Breadcrumbs, generateBreadcrumbs } from './layout/Breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './layout/Breadcrumbs';

export { default as PageHeader } from './layout/PageHeader';
export type { PageHeaderProps } from './layout/PageHeader';

export { default as DashboardLayout } from './layout/DashboardLayout';
export type { DashboardLayoutProps } from './layout/DashboardLayout';

// Export shared components
export { default as StatCard } from './shared/StatCard';
export type { StatCardProps } from './shared/StatCard';

export { default as LoadingSpinner, SkeletonCard, SkeletonText } from './shared/LoadingState';

// Export video components
export { default as VideoEmbed } from './VideoEmbed';
export { default as VideoModal } from './VideoModal';
