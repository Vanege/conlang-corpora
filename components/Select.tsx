export default function Select({ items, value, onChange, placeholder } :
  { items: string[], value: string | null, onChange: Function, placeholder: string }) {

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    onChange(selectedValue);
  }

  return (
    <select value={value ?? ""} onChange={handleChange}>
      <option value="" disabled>{ placeholder }</option>
      {items.map(item => (
        <option value={item} key={item}>{item}</option>
      ))}
    </select>
  )
}