import { useRef, useState } from "react";
import "./App.css";
import KeyboardReact, { SimpleKeyboard } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import {
  AsYouType,
  CountryCode,
  formatIncompletePhoneNumber,
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";

const getCurrentKeyboardCaretPosition = (keyboard: SimpleKeyboard | null) => {
  return keyboard?.caretPosition === undefined
    ? 0
    : keyboard?.caretPosition === null
    ? 1
    : keyboard?.caretPosition;
};

function App() {
  const countries = getCountries();
  console.log("countries", countries);
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);
  const [currentCountryCode, setCurrentCountryCode] =
    useState<CountryCode>("ZA");
  const keyboardRef = useRef<SimpleKeyboard | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [_, setRenderCount] = useState(0); // Forcing re-render
  const [input, setInput] = useState("");
  const [activeInput, setActiveInput] = useState("phone");
  const formattedPhoneNumber = formatIncompletePhoneNumber(
    input,
    currentCountryCode
  );
  const [countrySearchText, setCountrySearchText] = useState("");

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

  const countryCodeOptions = countries
    .filter((countryCode) => {
      const regionName = new Intl.DisplayNames(["en"], {
        type: "region",
      });
      const countryName = regionName.of(countryCode);
      return countryName
        ?.toLowerCase()
        .includes(countrySearchText.toLowerCase());
    })
    .map((countryCode) => {
      const callingCode = getCountryCallingCode(countryCode);
      const regionName = new Intl.DisplayNames(["en"], {
        type: "region",
      });
      const countryName = regionName.of(countryCode);
      return (
        <div
          key={countryCode}
          id={countryCode}
          onClick={() => {
            setCurrentCountryCode(countryCode);
            setIsCountryListOpen(false);
            setCountrySearchText("");
            keyboardRef.current?.setInput("", "countrySearch");
            setActiveInput("phone");
          }}
        >
          <span>+{callingCode}</span> - <span>{countryName}</span>
        </div>
      );
    });

  console.log("current caret position: ", keyboardRef.current?.caretPosition);

  return (
    <div className="App">
      <p>Country Code: {currentCountryCode}</p>
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          className="country-search"
          style={{
            display: isCountryListOpen ? "flex" : "none",
          }}
        >
          <input
            type="text"
            autoFocus={true}
            placeholder="Search for country"
            onFocus={() => setActiveInput("countrySearch")}
            defaultValue={countrySearchText}
          />
        </div>
        <div
          className="options"
          style={{
            display: isCountryListOpen ? "block" : "none",
            backgroundColor: "#ffffe3",
            border: "2px solid #e28b7a",
            maxHeight: "10rem",
            overflowY: "scroll",
            position: "absolute",
            width: "100%",
          }}
        >
          {countryCodeOptions}
        </div>
      </div>
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
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          onClick={() => {
            setIsCountryListOpen(!isCountryListOpen);
            setActiveInput("countrySearch");
          }}
          className="flag"
          style={{
            marginRight: "0.5rem",
          }}
        >
          <img
            style={{
              display: "block",
            }}
            width={30}
            src={`https://flagcdn.com/h40/${currentCountryCode.toLowerCase()}.png`}
            alt={currentCountryCode}
          />
        </div>

        <div
          style={{
            display: "flex",

            alignItems: "center",
            border: "2px solid #e28b7a",
            height: "2rem",
            borderRadius: "0.5rem",
            paddingLeft: "0.5rem",
            width: "100%",
          }}
          onClick={() => setActiveInput("phone")}
        >
          {displayDigits}
        </div>
      </div>

      <div className="custom-keyboard">
        <KeyboardReact
          inputName={activeInput}
          onInit={(keyboard) => {
            keyboardRef.current = keyboard as SimpleKeyboard;
            keyboardRef.current?.setInput(input, activeInput);
            keyboardRef.current?.setCaretPosition(input.length);
            inputRef.current?.setSelectionRange(input.length, input.length);
            setRenderCount((count) => count + 1);
          }}
          keyboardRef={(r) => (keyboardRef.current = r)}
          onChange={(newInput) => {
            if (activeInput === "phone") {
              setInput(newInput);
            } else {
              setCountrySearchText(newInput);
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
