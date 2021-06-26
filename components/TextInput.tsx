export default function TextInput({ value, onChange, placeholder = "" } :
  { value: string | null, onChange: Function, placeholder?: string }) {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    onChange(selectedValue);
  }

  return (
    <input type="text" value={value ?? ""} onChange={handleChange} placeholder={placeholder}/>
  )
}