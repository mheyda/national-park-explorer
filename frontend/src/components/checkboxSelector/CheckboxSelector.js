import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilter, setFilter, setQuery, setSort } from '../../features/parks/parksSlice.js';
import './CheckboxSelector.css';


export default function CheckboxSelector( { options, name, handleChange, filterTitle }) {

    const dispatch = useDispatch();
    const filter = useSelector(selectFilter);
    const [checkboxOpen, setCheckboxOpen] = useState(false);

    const clearFilter = () => {
        dispatch(setFilter({...filter, [filterTitle]: []}))
    }

    return (
        <div className='checkbox-selector'>
            {filter[filterTitle].length > 0 ? <button className='clear-filter-btn' onClick={clearFilter}>Clear</button> : <></>}
            <button className='checkbox-header' onClick={() => setCheckboxOpen(checkboxOpen => !checkboxOpen)}>
                {name} 
                <i className={checkboxOpen ? 'fa-solid fa-minus' : 'fa-solid fa-plus'}></i>
            </button>
            {checkboxOpen
            ?   <div className='options'>
                    {options.map((option, index) => {
                        return (
                            <label key={index} className='option' htmlFor={option.title}>
                                <input className='checkbox' type="checkbox" name={option.title} value={option.value} onChange={handleChange} checked={filter[filterTitle].includes(option.value) ? true : false}></input>
                                <span className='checkbox-label'>{option.title}</span>
                            </label>
                        )
                    })}
                </div>
            :<></>}
        </div>
    );
}