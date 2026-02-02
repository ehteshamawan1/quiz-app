import { useEffect, useRef } from "react";

type RichTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextInput({ value, onChange, placeholder }: RichTextInputProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const format = (command: string) => {
    document.execCommand(command, false);
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  };

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-text-wrapper">
      <div className="rich-text-toolbar">
        <button type="button" onClick={() => format("bold")} aria-label="Bold">
          B
        </button>
        <button type="button" onClick={() => format("italic")} aria-label="Italic">
          I
        </button>
        <button type="button" onClick={() => format("underline")} aria-label="Underline">
          U
        </button>
        <button type="button" onClick={() => format("insertUnorderedList")} aria-label="Bullets">
          •
        </button>
      </div>
      <div
        ref={ref}
        className="rich-text-input"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={(event) => onChange((event.target as HTMLDivElement).innerHTML)}
      />
    </div>
  );
}
