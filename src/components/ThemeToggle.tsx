import { Sun, Moon, Monitor } from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const options: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'auto', icon: Monitor, label: 'Auto' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  return (
    <div className="flex items-center bg-[#F5F1E8] dark:bg-[#2a2a2a] rounded-[2px] p-0.5 border border-[#808080]/20 dark:border-[#555]/30">
      {options.map(option => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            title={option.label}
            className={`flex items-center justify-center w-7 h-7 rounded-[2px] transition-all ${
              theme === option.value
                ? 'bg-[#000] dark:bg-white text-white dark:text-[#000] shadow-sm'
                : 'text-[#808080] dark:text-[#999] hover:text-[#000] dark:hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
