import cn from 'classnames';
import { getRandomInt } from '../helpers/randomNumber';

interface CurrentTurnButtonsProps {
  type: string;
  isDisabled?: boolean;
  letters: string[];
  selectedLetter?: string;
  onLetterClick: (type: string, letter: string) => void;
}

const transformPresets = [
  [
    'rotate(12deg) translate(-42px, -102px) rotate(-18deg) scale(1.55)',
    'rotate(55deg) translate(-5px, -107px) rotate(25deg) scale(1.35)',
    'rotate(98deg) translate(0px, -109px) rotate(-10deg) scale(1.4)',
    'rotate(145deg) translate(9px, -112px) rotate(5deg) scale(1)',
    'rotate(187deg) translate(0px, -99px) rotate(-22deg) scale(0.88)',
    'rotate(230deg) translate(0px, -119px) rotate(17deg) scale(1.1)',
    'rotate(275deg) translate(0px, -12px) rotate(-5deg) scale(1.87)',
    'rotate(320deg) translate(-82px, -78px) rotate(20deg) scale(1.22',
  ],
  [
    'rotate(12deg) translate(0px, -97px) rotate(-18deg) scale(1.65)',
    'rotate(55deg) translate(8px, -124px) rotate(25deg) scale(0.95)',
    'rotate(55deg) translate(71px, -79px) rotate(25deg) scale(1.55)',
    'rotate(145deg) translate(0px, -124px) rotate(5deg) scale(1)',
    'rotate(187deg) translate(-18px, -125px) rotate(-22deg) scale(0.88)',
    'rotate(230deg) translate(-14px, -40px) rotate(17deg) scale(1.93)',
    'rotate(275deg) translate(-65px, -108px) rotate(-5deg) scale(0.87)',
    'rotate(320deg) translate(-23px, -95px) rotate(20deg) scale(1.52)',
  ]
]

const savedParams: Record<string, [string, number]> = {};

export function CurrentTurnButtons({ type, letters, selectedLetter, isDisabled, onLetterClick }: CurrentTurnButtonsProps) {
  if (!letters || letters.length === 0) {
    return (
      <div className="text-muted">
        No letters available
      </div>
    );
  }

  const paramsKey = letters.join('');

  if (!savedParams[paramsKey]) {
    savedParams[paramsKey] = [`rotate(${getRandomInt(-290, 290)}deg)`, getRandomInt(0, 1)]
  }

  const [rotate, transformPresetNum] = savedParams[paramsKey];
  const transformPreset = transformPresets[transformPresetNum];

  return (
    <div
      className="d-flex flex-wrap gap-2 align-items-center justify-content-center"
      style={{
        background: '#fff',
        borderRadius: '50%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        width: '320px',
        height: '320px',
        margin: '0 auto',
        position: 'relative',
        transform: rotate,
      }}
    >
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
              position: 'absolute',
              width: '60px',
              height: '60px',
              padding: 0,
              border: 'none',
              boxShadow: isLetterSeleted ? '0 0 0 2px #0d6efd' : undefined,
              transform: transformPreset[index]
            }}
          >
            <img
              src={imageSrc}
              alt={letter}
              style={{
                width: "100%",
                height: '100%',
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
