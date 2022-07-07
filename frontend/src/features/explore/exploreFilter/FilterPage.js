import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilter, setFilter, selectSort, setSort, selectView } from '../exploreSlice.js';
import FilterSelector from './FilterSelector.js';
import Select from '../../../common/select/Select.js';
import { designationOptions, stateOptions, sortOptions } from '../../../assets/data/filterOptions.js';
import './FilterPage.css';

export default function FilterPage({ setFiltersOpen }) {

    const view = useSelector(selectView);
    const sort = useSelector(selectSort);
    const filterPage = useRef(null);
    const filter = useSelector(selectFilter);
    const dispatch = useDispatch();   

    const [newFilter, setNewFilter] = useState(filter);
    const [newSort, setNewSort] = useState(sort);

    const updateStateCodes = (e) => {
        if (e.target.checked) {
            let newStateCodes = newFilter.stateCodes;
            newStateCodes = [...newStateCodes, e.target.value];
            const updatedFilter = {...newFilter, stateCodes: newStateCodes};
            setNewFilter(updatedFilter);
        } else {
            let newStateCodes = newFilter.stateCodes;
            newStateCodes = newStateCodes.filter(stateCode => stateCode !== e.target.value);
            const updatedFilter = {...newFilter, stateCodes: newStateCodes};
            setNewFilter(updatedFilter);
        }
    }

    const updateDesignations = (e) => {
        if (e.target.checked) {
            let newDesignations = newFilter.designations;
            newDesignations = [...newDesignations, e.target.value];
            const updatedFilter = {...newFilter, designations: newDesignations};
            setNewFilter(updatedFilter);
        } else {
            let newDesignations = newFilter.designations;
            newDesignations = newDesignations.filter(designation => designation !== e.target.value);
            const updatedFilter = {...newFilter, designations: newDesignations};
            setNewFilter(updatedFilter);
        }
    }

    const updateSort = (e) => {
        const selectedIndex = e.target.options.selectedIndex;
        const newSort = e.target.options[selectedIndex].value;
        setNewSort(newSort);
    }

    const clearSort = () => {
        if (view === 'list') {
            document.querySelector('select').options.selectedIndex = 0;
        }
        setNewSort('Alphabetical (A-Z)');
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(setSort(newSort));
        dispatch(setFilter(newFilter));
        setFiltersOpen(false);
    }

    return (
        <div ref={filterPage} className='filter-page-container'>
            <form className='filter-page' onSubmit={handleSubmit}>
                <p className='filter-page-header'>
                    <span className='filter-page-title' >{view === 'list' ? 'Filter & Sort' : 'Filter'}</span>
                    <button className='close-filter-page' type='button' onClick={() => {
                        setFiltersOpen(false);
                    }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </p>
                {view === 'list'
                ?   <> 
                        <p className='filter-page-subheading'>
                            Sort by
                            {newSort !== 'Alphabetical (A-Z)' ? <button className='clear-sort-btn' type='button' onClick={clearSort}>Clear</button> : <></>}
                        </p>
                        <Select name={''} options={sortOptions} onChange={updateSort} clearSort={clearSort} />
                    </> 
                : <></>}
                <p className='filter-page-subheading'>Filter by</p>
                <FilterSelector name={'Park Designation'} filterTitle={'designations'} options={designationOptions} newFilter={newFilter} setNewFilter={setNewFilter} handleChange={updateDesignations} />
                <FilterSelector name={'State & Territory'} filterTitle={'stateCodes'} options={stateOptions} newFilter={newFilter} setNewFilter={setNewFilter} handleChange={updateStateCodes} />
                <p className='filter-page-footer'>
                    {newSort !== 'Alphabetical (A-Z)' || !Object.values(newFilter).every(value => value.length === 0) ? <button className='clear-all-btn' type='button' onClick={() => {
                        clearSort();
                        setNewFilter({designations: [], stateCodes: []});
                    }}>Clear All</button> : <></>}
                    <br></br>
                    <button className='apply-filter-btn' type='submit'>Apply</button>
                </p>
            </form>
        </div>
    );
}