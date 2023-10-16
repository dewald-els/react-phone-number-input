import PhoneNumberInput from "./components/PhoneNumberInput";
import "./App.css";
import { useState } from "react";
import { PhoneNumberInputSize } from "./components/types";

const App: React.FC = () => {
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  console.log("countryCode", countryCode);
  console.log("phoneNumber", phoneNumber);

  return (
    <div className="App">
      <PhoneNumberInput
        size={PhoneNumberInputSize.Medium}
        defaultValue="+27714834857"
        defaultCountryCode="ZA"
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
