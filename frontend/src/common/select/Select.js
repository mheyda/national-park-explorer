import './Select.css';


export default function Select( { name, options, defaultValue, onChange } ) {

    return (
        <div className='select-container'>
            <label>{name}</label>
            <select defaultValue={defaultValue} onChange={onChange}>
                {options.map((option, index) => {
                    return <option key={index} value={option.value}>{option.title}</option>;
                })}
            </select>
        </div>
    );
}
