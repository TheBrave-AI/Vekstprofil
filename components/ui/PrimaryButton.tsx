import Arrow from "./Arrow";

interface Props {
    label: string;
    onClick: () => void;
}

export default function PrimaryButton({ label, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 bg-brand text-onbrand font-medium px-6 py-3.5 rounded-xl transition-colors hover:bg-brand-deep">
            {label}
            <Arrow />
        </button>
    );
}
