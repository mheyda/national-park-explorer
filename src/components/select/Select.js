import './Select.css';


export default function Select( { name, options, onChange } ) {


    return (
        <div className='select-container'>
            <label>{name}</label>
            <select defaultValue={name} onChange={onChange}>
                {options.map((option, index) => {
                    return <option key={index} value={option.value}>{option.title}</option>;
                })}
            </select>
        </div>
    );
}
