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
      className="p-6 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-colors text-left group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${iconBgColor} dark:bg-opacity-20 rounded-lg ${iconHoverColor} dark:group-hover:bg-opacity-30 transition-colors`}>
          <div className={`${iconTextColor} dark:text-current`}>
            {icon}
          </div>
        </div>
        <h3 className="font-medium text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </button>
  );
}