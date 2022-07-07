import { useState } from 'react';
import './FilterSelector.css';


export default function FilterSelector( { options, name, handleChange, filterTitle, newFilter, setNewFilter }) {

    const [checkboxOpen, setCheckboxOpen] = useState(false);

    const clearFilter = () => {
        setNewFilter({...newFilter, [filterTitle]: []});
    }

    return (
        <div className='checkbox-selector'>
            {newFilter[filterTitle].length > 0 ? <button className='clear-filter-btn' onClick={clearFilter}>Clear</button> : <></>}
            <button className='checkbox-header' type='button' onClick={() => setCheckboxOpen(checkboxOpen => !checkboxOpen)}>
                {name} 
                <i className={checkboxOpen ? 'fa-solid fa-minus' : 'fa-solid fa-plus'}></i>
            </button>
            {checkboxOpen
            ?   <div className='options'>
                    {options.map((option, index) => {
                        return (
                            <label key={index} className='option' htmlFor={option.title}>
                                <input className='checkbox' type="checkbox" name={option.title} value={option.value} onChange={handleChange} checked={newFilter[filterTitle].includes(option.value) ? true : false}></input>
                                <span className='checkbox-label'>{option.title}</span>
                            </label>
                        )
                    })}
                </div>
            :<></>}
        </div>
    );
}