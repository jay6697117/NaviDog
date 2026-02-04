import React from 'react';
import { Button, ButtonProps } from 'antd';
import { Ripple } from './Ripple';

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  rippleDuration?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  rippleColor,
  rippleDuration,
  style,
  ...props
}) => {
  return (
    <Button
      {...props}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
      <Ripple color={rippleColor} duration={rippleDuration} />
    </Button>
  );
};

export default RippleButton;
