import { useRef, useState } from "react";
import "./App.css";
import KeyboardReact, { SimpleKeyboard } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { AsYouType } from "libphonenumber-js";

const getCurrentKeyboardCaretPosition = (keyboard: SimpleKeyboard | null) => {
  return keyboard?.caretPosition === undefined
    ? 0
    : keyboard?.caretPosition === null
    ? 1
    : keyboard?.caretPosition;
};

function App() {
  const keyboardRef = useRef<SimpleKeyboard | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [renderCount, setRenderCount] = useState(0); // Forcing re-render
  const [input, setInput] = useState("");
  const [activeInput, setActiveInput] = useState("phone");
  const formattedPhoneNumber = new AsYouType("ZA").input(input);

  console.log("formattedPhoneNumber", formattedPhoneNumber);

  if (inputRef.current && keyboardRef.current) {
    setTimeout(() => {
      // Give the DOM time to re-render.
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        keyboardRef.current?.caretPosition ?? input.length,
        keyboardRef.current?.caretPosition ?? input.length
      );
    }, 50);
  }

  let displayDigitIndex = 0;
  const currentCaret = getCurrentKeyboardCaretPosition(keyboardRef.current);

  const displayDigits = formattedPhoneNumber.split("").map((digit) => {
    if (isNaN(parseInt(digit))) {
      const key = "non-digit-" + displayDigitIndex;
      return (
        <span
          id={key}
          key={key}
          style={{
            display: "block",
            width: "0.4rem",
            height: "0.5rem",
          }}
          onClick={(event) => {
            const index = parseInt(event.currentTarget.id.split("-")[2]);
            inputRef.current?.setSelectionRange(index, index);
            keyboardRef.current?.setCaretPosition(index);
            setRenderCount((count) => count + 1);
          }}
        >
          {digit}
        </span>
      );
    } else {
      displayDigitIndex++;
      const key = "digit-" + displayDigitIndex;
      return (
        <span
          id={"digit-" + displayDigitIndex}
          key={key}
          onClick={(event) => {
            const index = parseInt(event.currentTarget.id.split("-")[1]);
            inputRef.current?.setSelectionRange(index, index);
            keyboardRef.current?.setCaretPosition(index);
            setRenderCount((count) => count + 1);
          }}
          style={{
            display: "block",
            borderBottom:
              currentCaret === displayDigitIndex
                ? "2px solid #e06b88"
                : "2px solid transparent",
          }}
        >
          {digit}
        </span>
      );
    }
  });

  console.log("current caret position: ", keyboardRef.current?.caretPosition);

  return (
    <div className="App">
      <span>Country: South Africa</span>
      <div className="input">
        <input
          type="tel"
          id="phone"
          defaultValue={input}
          ref={inputRef}
          style={{
            border: "2px solid transparent",
            outline: activeInput === "phone" ? "2px solid #00f" : "none",
            visibility: "hidden",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          marginBottom: "1rem",
          alignItems: "center",
          border: "2px solid #e28b7a",
          height: "2rem",
          borderRadius: "0.5rem",
          paddingLeft: "0.5rem",
        }}
      >
        {displayDigits}
      </div>

      <KeyboardReact
        keyboardRef={(r) => (keyboardRef.current = r)}
        onChange={(newInput) => setInput(newInput)}
      />
    </div>
  );
}

export default App;
