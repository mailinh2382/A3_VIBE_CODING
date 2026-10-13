import './PrimaryButton.css';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  fullWidth = true,
}: PrimaryButtonProps) {
  const className = [
    'primary-button',
    `primary-button--${variant}`,
    fullWidth ? 'primary-button--full-width' : '',
    loading ? 'primary-button--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  );
}
