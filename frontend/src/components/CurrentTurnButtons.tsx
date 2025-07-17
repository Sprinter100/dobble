interface CurrentTurnButtonsProps {
  isDisabled?: boolean;
  letters: string[];
  onLetterClick: (letter: string) => void;
}

export function CurrentTurnButtons({ letters, isDisabled, onLetterClick }: CurrentTurnButtonsProps) {
  if (!letters || letters.length === 0) {
    return (
      <div className="text-muted">
        No letters available
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {letters.map((letter, index) => (
        <button
          key={`${letter}-${index}`}
          disabled={isDisabled}
          className="btn btn-outline-primary btn-lg"
          onClick={() => onLetterClick(letter)}
          style={{
            minWidth: '60px',
            height: '60px',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
