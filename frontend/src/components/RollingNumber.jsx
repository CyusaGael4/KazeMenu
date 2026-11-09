/**
 * Digits that roll into place, one place at a time. Punctuation and letters
 * sit still, so "8,250 RWF" reads as a number while only the digits move.
 */
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function RollingNumber({ value, className = '' }) {
  const text = String(value);
  const parts = [];
  let place = 0;

  for (let index = text.length - 1; index >= 0; index -= 1) {
    const char = text[index];
    if (char >= '0' && char <= '9') {
      place += 1;
      parts.unshift({ key: `place-${place}`, digit: char });
    } else {
      parts.unshift({ key: `fixed-${index}`, char });
    }
  }

  return (
    <span className={`roll-num${className ? ` ${className}` : ''}`}>
      <span className="sr-only">{text}</span>
      <span className="roll-visual" aria-hidden="true">
        {parts.map((part) => (part.digit === undefined ? (
          <span key={part.key} className="roll-fixed">{part.char}</span>
        ) : (
          <span key={part.key} className="roll-place">
            <span className="roll-strip" style={{ '--roll-digit': part.digit }}>
              {DIGITS.map((digit) => <span key={digit} className="roll-cell">{digit}</span>)}
            </span>
          </span>
        )))}
      </span>
    </span>
  );
}
