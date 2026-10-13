import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import './RadioCardGroup.css';

export interface RadioCardOption {
  value: string;
  title: string;
  desc: string;
}

interface RadioCardGroupProps {
  options: RadioCardOption[];
  value?: string;
  onValueChange: (value: string) => void;
  name?: string;
}

export default function RadioCardGroup({
  options,
  value,
  onValueChange,
  name,
}: RadioCardGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className="radio-card-group"
      value={value}
      onValueChange={onValueChange}
      name={name}
    >
      {options.map((opt) => (
        <RadioGroupPrimitive.Item
          key={opt.value}
          className="radio-card"
          value={opt.value}
        >
          <div className="radio-card__title">{opt.title}</div>
          <div className="radio-card__desc">{opt.desc}</div>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
