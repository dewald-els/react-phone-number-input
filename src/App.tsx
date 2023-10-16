import PhoneNumberInput from "./components/PhoneNumberInput";
import "./App.css";
import { useState } from "react";
import { PhoneNumberInputSize } from "./components/types";
import { CountryCode } from "libphonenumber-js";

const App: React.FC = () => {
  const [countryCode, setCountryCode] = useState<CountryCode>("ZA");
  const [phoneNumber, setPhoneNumber] = useState("+27714834857");

  console.log("countryCode", countryCode);
  console.log("phoneNumber", phoneNumber);

  return (
    <div className="App">
      <PhoneNumberInput
        size={PhoneNumberInputSize.Medium}
        defaultValue={phoneNumber}
        language="no"
        defaultCountryCode={countryCode}
        onCountryCodeChange={(newCountryCode) => {
          setCountryCode(newCountryCode);
        }}
        onPhoneNumberChange={(newPhoneNumber) => {
          setPhoneNumber(newPhoneNumber);
        }}
      />
    </div>
  );
};

export default App;
