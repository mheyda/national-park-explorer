import { useSelector } from 'react-redux';
import { selectSort } from '../../features/parks/parksSlice.js';
import './Select.css';


export default function Select( { name, options, onChange, clearSort } ) {

    const sort = useSelector(selectSort);

    return (
        <div className='select-container'>
            <label>{name}</label>
            {sort !== 'Alphabetical (A-Z)' ? <button className='clear-filter-btn' onClick={clearSort}>Clear</button> : <></>}
            <select defaultValue={sort} onChange={onChange}>
                {options.map((option, index) => {
                    return <option key={index} value={option.value}>{option.title}</option>;
                })}
            </select>
        </div>
    );
}
