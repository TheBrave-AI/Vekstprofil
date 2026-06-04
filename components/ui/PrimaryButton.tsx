import Arrow from "./Arrow";

interface Props {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

export default function PrimaryButton({ label, onClick, disabled }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 bg-brand text-onbrand font-medium px-6 py-3.5 rounded-xl transition-colors hover:bg-brand-deep disabled:opacity-40 disabled:cursor-not-allowed">
            {label}
            <Arrow />
        </button>
    );
}
