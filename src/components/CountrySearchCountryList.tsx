type CountrySearchCountryListProps = {
  isCountryListOpen: boolean;
  countryCodeOptions: JSX.Element[];
};
const CountrySearchCountryList: React.FC<CountrySearchCountryListProps> = (
  props
) => {
  const { isCountryListOpen, countryCodeOptions } = props;

  return (
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
  );
};

export default CountrySearchCountryList;
