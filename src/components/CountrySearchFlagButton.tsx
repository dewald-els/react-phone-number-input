type CountrySearchFlagButtonProps = {
  currentCountryCode: string;
  onClick: () => void;
};
const CountrySearchFlagButton: React.FC<CountrySearchFlagButtonProps> = (
  props
) => {
  const { currentCountryCode, onClick } = props;

  return (
    <div
      onClick={onClick}
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
  );
};

export default CountrySearchFlagButton;
