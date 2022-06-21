import { useSelector, useDispatch } from 'react-redux';
import { selectFilter, setFilter, setQuery, setSort } from '../../features/parks/parksSlice.js';
import Select from '../select/Select.js';
import SearchBar from '../searchBar/SearchBar';
import { selectView, setView } from '../../features/parks/parksSlice.js';
import './OptionsBar.css';


export default function OptionsBar() {

    const dispatch = useDispatch();
    const filter = useSelector(selectFilter);
    const view = useSelector(selectView);


    const designationOptions = [
        {
            title: 'National Parks',
            value: 'National Park',
        }, 
        {
            title: 'National Monuments',
            value: 'Monument'
        }, 
        {
            title: 'National Preserves',
            value: 'Preserve'
        }, 
        {
            title: 'National Historical Parks',
            value: 'Historic'
        }
    ];

    const sortSelectOptions = [
        {
            title: 'Alphabetical (A-Z)',
            value: 'Alphabetical (A-Z)'
        }, 
        {
            title: 'Reverse Alphabetical (Z-A)',
            value: 'Reverse Alphabetical (Z-A)'
        }, 
    ];

    const updateView = (e) => {
        dispatch(setView({view: e.target.dataset.view}))
    }

    const updateStateCodes = (e) => {
        if (e.target.checked) {
            let newStateCodes = filter.stateCodes;
            newStateCodes = [...newStateCodes, e.target.value];
            const newFilter = {...filter, stateCodes: newStateCodes};
            dispatch(setFilter(newFilter));
        } else {
            let newStateCodes = filter.stateCodes;
            newStateCodes = newStateCodes.filter(stateCode => stateCode !== e.target.value);
            const newFilter = {...filter, stateCodes: newStateCodes};
            dispatch(setFilter(newFilter));
        }
    }

    const updateDesignations = (e) => {
        if (e.target.checked) {
            let newDesignations = filter.designations;
            newDesignations = [...newDesignations, e.target.value];
            const newFilter = {...filter, designations: newDesignations};
            dispatch(setFilter(newFilter));
        } else {
            let newDesignations = filter.designations;
            newDesignations = newDesignations.filter(designation => designation !== e.target.value);
            const newFilter = {...filter, designations: newDesignations};
            dispatch(setFilter(newFilter));
        }
    }

    const updateSort = (e) => {
        const selectedIndex = e.target.options.selectedIndex;
        const newSort = e.target.options[selectedIndex].value;
        dispatch(setSort(newSort));
    }

    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.queryTerm.value;
        dispatch(setQuery(query));
    }

    if (view === 'list') {
        return (
            <div className='options-bar'>
                <Select name={'Sort By '} options={sortSelectOptions} onChange={updateSort} /> 
                <SearchBar handleSearch={handleSearch} />

                <label htmlFor="National Parks">National Parks</label>
                <input type="checkbox" name="National Parks" value="National Park" onChange={updateDesignations} checked={filter.designations.includes('National Park') ? true : false}></input>
                <label htmlFor="National Monuments">National Monuments</label>
                <input type="checkbox" name="National Monuments" value="Monument" onChange={updateDesignations} checked={filter.designations.includes('Monument') ? true : false}></input>
                <label htmlFor="National Preserves">National Preserves</label>
                <input type="checkbox" name="National Preservers" value="Preserve" onChange={updateDesignations} checked={filter.designations.includes('Preserve') ? true : false}></input>
                <label htmlFor="National Historic Parks">National Historic Parks</label>
                <input type="checkbox" name="National Historic Parks" value="Historic" onChange={updateDesignations} checked={filter.designations.includes('Historic') ? true : false}></input>

                <label htmlFor="MN">MN</label>
                <input type="checkbox" name="MN" value="MN" onChange={updateStateCodes} checked={filter.stateCodes.includes('MN') ? true : false}></input>
                <label htmlFor="WI">WI</label>
                <input type="checkbox" name="WI" value="WI" onChange={updateStateCodes} checked={filter.stateCodes.includes('WI') ? true : false}></input>
                

                <button className='view-btn' data-view={'map'} onClick={updateView} >Show Map <i data-view={'map'} className="fa-solid fa-map"></i></button>
            </div>
        );
    } else {
        return (
            <div className='options-bar'>
                <button className='view-btn' data-view={'list'} onClick={updateView} >Show List <i data-view={'list'} className="fa-solid fa-list"></i></button>
            </div>
        );
    }
}
