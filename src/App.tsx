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
import CountrySearchFlagButton from "./components/CountrySearchFlagButton";
import CountrySearchCountryList from "./components/CountrySearchCountryList";

const getCurrentKeyboardCaretPosition = (keyboard: SimpleKeyboard | null) => {
  return keyboard?.caretPosition === undefined
    ? 0
    : keyboard?.caretPosition === null
    ? 1
    : keyboard?.caretPosition;
};

type PhoneNumberDigitProps = {
  digit: string;
  id: string;
  onClick: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
} & React.HTMLAttributes<HTMLSpanElement>;

const PhoneNumberDigit: React.FC<PhoneNumberDigitProps> = (props) => {
  const { id, onClick, digit, ...rest } = props;
  return (
    <span id={id} key={id} onClick={onClick} {...rest}>
      {digit}
    </span>
  );
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
        <PhoneNumberDigit
          id={key}
          digit={digit}
          className="phone-number-digit"
          onClick={(event) => {
            event.stopPropagation();
            const index = parseInt(event.currentTarget.id.split("-")[2]);
            inputRef.current?.setSelectionRange(index, index);
            keyboardRef.current?.setCaretPosition(index);
            setRenderCount((count) => count + 1);
          }}
        />
      );
    } else {
      displayDigitIndex++;
      const key = "digit-" + displayDigitIndex;
      return (
        <PhoneNumberDigit
          id={key}
          digit={digit}
          className={
            "phone-number-digit " +
            (currentCaret === displayDigitIndex ? "active-digit" : "")
          }
          onClick={(event) => {
            event.stopPropagation();
            const index = parseInt(event.currentTarget.id.split("-")[1]) - 1;
            inputRef.current?.setSelectionRange(index, index);
            keyboardRef.current?.setCaretPosition(index);
            setRenderCount((count) => count + 1);
          }}
        />
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
          onClick={(e) => {
            e.stopPropagation();
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
        <CountrySearchCountryList
          isCountryListOpen={isCountryListOpen}
          countryCodeOptions={countryCodeOptions}
        />
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
        <CountrySearchFlagButton
          currentCountryCode={currentCountryCode}
          onClick={() => {
            setIsCountryListOpen(!isCountryListOpen);
            setActiveInput("countrySearch");
          }}
        />

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
          onClick={() => {
            setActiveInput("phone");
            keyboardRef.current?.setInput(input, "phone");
            keyboardRef.current?.setCaretPosition(input.length);
            inputRef.current?.setSelectionRange(input.length, input.length);
            setRenderCount((count) => count + 1);
            console.log("clicked input");
          }}
        >
          {input.length === 0 && (
            <span
              style={{
                fontSize: "small",
                color: "#e28b7a",
              }}
            >
              Phone number
            </span>
          )}
          {displayDigits}
        </div>
      </div>

      <div className="custom-keyboard">
        <KeyboardReact
          inputName={activeInput}
          layout={{
            default: ["1 2 3", "4 5 6", "7 8 9", "{bksp} 0 {enter}"],
          }}
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
