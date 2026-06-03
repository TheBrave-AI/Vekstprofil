interface Props {
    label: string;
    onClick: () => void;
  }

  export default function GhostButton({ label, onClick }: Props) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 text-muted border border-steel bg-transparent font-medium px-6 py-3.5 rounded-xl
  transition-colors hover:border-muted hover:text-cloud"
      >
        {label}
      </button>
    );
}