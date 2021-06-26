export default function Checkbox({ value, label, onChange } :
  { value: boolean, label: string, onChange: Function }) {

  const handleChange = () => {
    onChange(!value);
  }

  return (<>
    <div className="container" onClick={handleChange}>
      <input type="checkbox" checked={value} readOnly/>
      <label>{label}</label>
    </div>

    <style jsx>
      {`
        .container > * {
          cursor: pointer;
        }
      `}
    </style>
  </>)
}