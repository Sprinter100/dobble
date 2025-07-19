import cn from 'classnames';

interface CurrentTurnButtonsProps {
  type: string;
  isDisabled?: boolean;
  letters: string[];
  selectedLetter?: string;
  onLetterClick: (type: string, letter: string) => void;
}

export function CurrentTurnButtons({ type, letters, selectedLetter, isDisabled, onLetterClick }: CurrentTurnButtonsProps) {
  if (!letters || letters.length === 0) {
    return (
      <div className="text-muted">
        No letters available
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {letters.map((letter, index) => {
        const isLetterSeleted = selectedLetter === letter;
        const imageSrc = `/png/${letter}.png`;

        return (
          <button
            key={`${letter}-${index}`}
            disabled={isDisabled}
            className={cn("btn btn-lg p-0 d-flex align-items-center justify-content-center", { 'btn-primary': isLetterSeleted, 'btn-outline-primary': !isLetterSeleted })}
            onClick={() => onLetterClick(type, letter)}
            style={{
              minWidth: '60px',
              height: '60px',
              padding: 0,
              background: 'none',
              border: 'none',
              boxShadow: isLetterSeleted ? '0 0 0 2px #0d6efd' : undefined,
            }}
          >
            <img
              src={imageSrc}
              alt={letter}
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                filter: isDisabled ? 'grayscale(80%) opacity(0.5)' : 'none',
                transition: 'filter 0.2s',
              }}
            />
          </button>
        )
      })}
    </div>
  );
}
