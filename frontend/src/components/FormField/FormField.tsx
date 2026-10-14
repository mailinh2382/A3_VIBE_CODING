import './FormField.css';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  name?: string;
  options?: { value: string; label: string }[];
}

export default function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  name,
  options,
}: FormFieldProps) {
  const inputId = name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={inputId}>
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      {type === 'select' && options ? (
        <select
          id={inputId}
          name={name}
          className={`form-field__input form-field__select${error ? ' form-field__input--error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type === 'select' ? 'text' : type}
          className={`form-field__input${error ? ' form-field__input--error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}