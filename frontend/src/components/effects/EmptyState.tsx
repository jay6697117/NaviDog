import React from 'react';
import { Button, ButtonProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionProps?: ButtonProps;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionProps,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
        height: '100%',
        minHeight: 200,
      }}
    >
      {icon && (
        <div
          className="empty-state-icon"
          style={{
            fontSize: 48,
            color: 'var(--color-text-secondary)',
            marginBottom: 16,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          margin: 0,
          marginBottom: 8,
          color: 'var(--color-text-primary)',
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            marginBottom: 16,
            color: 'var(--color-text-secondary)',
            fontSize: 14,
          }}
        >
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAction}
          className="empty-state-cta"
          {...actionProps}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
