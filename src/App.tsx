import { useState } from "react";
import "./App.css";
import KeyboardReact from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { AsYouType } from "libphonenumber-js";

function App() {
  const [input, setInput] = useState("");
  const formattedPhoneNumber = new AsYouType("NO").input(input);

  console.log("formattedPhoneNumber", formattedPhoneNumber);

  return (
    <>
      <div className="input">
        <input type="tel" id="phone" defaultValue={input} />
      </div>
      <KeyboardReact onChange={(newInput) => setInput(newInput)} />
    </>
  );
}

export default App;
