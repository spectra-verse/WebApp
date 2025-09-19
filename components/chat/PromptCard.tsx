interface PromptCardProps {
  title: string;
  subtitle: string;
  promptText: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconHoverColor: string;
  iconTextColor: string;
  onClick: (promptText: string) => void;
}

export default function PromptCard({
  title,
  subtitle,
  promptText,
  icon,
  iconBgColor,
  iconHoverColor,
  iconTextColor,
  onClick,
}: PromptCardProps) {
  return (
    <button
      onClick={() => onClick(promptText)}
      className="p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${iconBgColor} rounded-lg ${iconHoverColor} transition-colors`}>
          <div className={iconTextColor}>
            {icon}
          </div>
        </div>
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </button>
  );
}