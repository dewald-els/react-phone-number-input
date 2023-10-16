import { useRef, useState } from "react";
import KeyboardReact, { SimpleKeyboard } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import {
  CountryCode,
  formatIncompletePhoneNumber,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
} from "libphonenumber-js";
import CountrySearchFlagButton from "./CountrySearchFlagButton";
import CountrySearchCountryList from "./CountrySearchCountryList";
import { PhoneNumberInputSize } from "./types";

const getCurrentKeyboardCaretPosition = (keyboard: SimpleKeyboard | null) => {
  return keyboard?.caretPosition === undefined
    ? 0
    : keyboard?.caretPosition === null
    ? 1
    : keyboard?.caretPosition;
};

const getPhoneNumberInputSizeInputPixels = (size: PhoneNumberInputSize) => {
  switch (size) {
    case PhoneNumberInputSize.Small:
      return "10rem";
    case PhoneNumberInputSize.Medium:
      return "13rem";
    case PhoneNumberInputSize.Large:
      return "20rem";
    default:
      return "13rem";
  }
};

type GetPhoneNumberWithoutDiallingCodeArgs = {
  phoneNumberWithDiallingCode: string;
  countryCode: CountryCode;
};

const getPhoneNumberWithoutDiallingCode = (
  args: GetPhoneNumberWithoutDiallingCodeArgs
) => {
  try {
    const { phoneNumberWithDiallingCode, countryCode } = args;

    const parsedPhoneNumber = parsePhoneNumber(
      phoneNumberWithDiallingCode,
      countryCode
    );
    if (parsedPhoneNumber && parsedPhoneNumber.nationalNumber) {
      const numberWithLocalPrefix = parsedPhoneNumber.format("NATIONAL", {
        nationalPrefix: true,
      });
      // We only want numbers. The formatter will apply special chars/spaces.
      return numberWithLocalPrefix.replace(/[^0-9]/g, "");
    } else {
      return args.phoneNumberWithDiallingCode;
    }
  } catch (error) {
    return args.phoneNumberWithDiallingCode;
  }
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

type PhoneNumberInputProps = {
  defaultValue?: string;
  defaultCountryCode: CountryCode;
  language?: string;
  onCountryCodeChange: (countryCode: CountryCode) => void;
  onPhoneNumberChange: (phoneNumber: string) => void;
  size?: PhoneNumberInputSize;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = (props) => {
  const {
    onCountryCodeChange,
    onPhoneNumberChange,
    defaultValue = "",
    defaultCountryCode,
    size = PhoneNumberInputSize.Medium,
    language = "en",
  } = props;
  const countries = getCountries();
  const defaultPhoneNumberWithoutDiallingCode =
    getPhoneNumberWithoutDiallingCode({
      phoneNumberWithDiallingCode: defaultValue,
      countryCode: defaultCountryCode,
    });
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);
  const [currentCountryCode, setCurrentCountryCode] =
    useState<CountryCode>(defaultCountryCode);
  const keyboardRef = useRef<SimpleKeyboard | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [_, setRenderCount] = useState(0); // Forcing re-render
  /**
   * Hello, you maybe be wondering why we keep internal track of the input.
   * This is done because we need a copy of the number that has not been tainted by the formatting.
   * This is essential in managing the caret position. So please do not "lift the state up", since it would circumvent the caret position logic.
   * Also, we need to have the api to use the PhoneNumberInput to be simple. So from the "outsider's" perspective, they on need to know the phone number and country code.
   */
  const [input, setInput] = useState(defaultPhoneNumberWithoutDiallingCode);
  const [activeInput, setActiveInput] = useState("phone");
  const formattedPhoneNumber = formatIncompletePhoneNumber(
    input,
    currentCountryCode
  );
  const [countrySearchText, setCountrySearchText] = useState("");
  const [currentLayout, setCurrentLayout] = useState("phone");

  // Updating DOM Elements with the caret position.
  if (inputRef.current && keyboardRef.current) {
    setTimeout(() => {
      console.log("setting caret on DOM", keyboardRef.current?.caretPosition);
      // Give the DOM time to re-render.
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        keyboardRef.current?.caretPosition ?? input.length,
        keyboardRef.current?.caretPosition ?? input.length
      );
    }, 50);
  }

  // Create the individual phone number digits with the correct click handlers.
  let displayDigitIndex = 0;
  const currentCaret = getCurrentKeyboardCaretPosition(keyboardRef.current);

  const displayDigits = formattedPhoneNumber.split("").map((digit) => {
    if (isNaN(parseInt(digit))) {
      const key = "non-digit-" + displayDigitIndex;
      return (
        <PhoneNumberDigit
          id={key}
          key={key}
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
          key={key}
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

  // Create the list of country codes that match the search text.
  const countryCodeOptions = countries
    .filter((countryCode) => {
      const regionName = new Intl.DisplayNames([language], {
        type: "region",
      });
      const countryName = regionName.of(countryCode);
      return countryName
        ?.toLowerCase()
        .includes(countrySearchText.toLowerCase());
    })
    .map((countryCode) => {
      const callingCode = getCountryCallingCode(countryCode);
      const regionName = new Intl.DisplayNames([language], {
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
            setCurrentLayout("phone");
            onCountryCodeChange(countryCode);
          }}
        >
          <span>+{callingCode}</span> - <span>{countryName}</span>
        </div>
      );
    });

  const phoneNumberInputSizeInputPixels =
    getPhoneNumberInputSizeInputPixels(size);

  return (
    <div className="phone-number-input">
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
            onFocus={() => {
              setActiveInput("countrySearch");
              setCurrentLayout("default");
            }}
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
            setCurrentLayout("default");
          }}
        />

        <div
          key="phone-number-input-digits"
          style={{
            display: "flex",
            alignItems: "center",
            border: "2px solid #e28b7a",
            height: "2rem",
            borderRadius: "0.5rem",
            paddingLeft: "0.5rem",
            width: phoneNumberInputSizeInputPixels,
          }}
          onClick={(event) => {
            event.stopPropagation();
            keyboardRef.current?.setInput(input, "phone");
            keyboardRef.current?.setCaretPosition(input.length);
            inputRef.current?.setSelectionRange(input.length, input.length);
            setActiveInput("phone");
            setCurrentLayout("phone");
            setRenderCount((count) => count + 1);
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
          layoutName={currentLayout}
          layout={{
            default: [
              "q w e r t y u i o p {bksp}",
              "a s d f g h j k l",
              "z x c v b n m ",
              "{space} {enter}",
            ],
            phone: ["1 2 3", "4 5 6", "7 8 9", "{bksp} 0 {enter}"],
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
              const diallingCode =
                getCountryCallingCode(currentCountryCode) ?? "";
              onPhoneNumberChange(`+${diallingCode}${newInput}`);
            } else {
              setCountrySearchText(newInput);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PhoneNumberInput;
