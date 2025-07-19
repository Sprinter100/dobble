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

        return (
          <button
            key={`${letter}-${index}`}
            disabled={isDisabled}
            className={cn("btn btn-lg", { 'btn-primary': isLetterSeleted, 'btn-outline-primary': !isLetterSeleted })}
            onClick={() => onLetterClick(type, letter)}
            style={{
              minWidth: '60px',
              height: '60px',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {letter}
          </button>
        )
      })}
    </div>
  );
}
