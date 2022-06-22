import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilter, setFilter, setQuery, setSort } from '../../features/parks/parksSlice.js';
import CheckboxSelector from '../checkboxSelector/CheckboxSelector.js';
import Select from '../select/Select.js';
import './FilterPage.css';

export default function FilterPage({ setFiltersOpen }) {

    const filterPage = useRef(null);
    const filter = useSelector(selectFilter);
    const dispatch = useDispatch();

    const designationOptions = [
        { title: 'National Parks', value: 'National Park' }, 
        { title: 'National Monuments', value: 'Monument' }, 
        { title: 'National Preserves', value: 'Preserve' }, 
        { title: 'National Historical Parks', value: 'Historic' }
    ];

    const stateOptions = [
        { title: 'Alabama', value: 'AL' }, { title: 'Alaska', value: 'AK' }, { title: 'Arizona', value: 'AZ' }, { title: 'Arkansas', value: 'AR' }, { title: 'American Samoa', value: 'AS' }, { title: 'California', value: 'CA' }, { title: 'Colorado', value: 'CO' }, { title: 'Connecticut', value: 'CT' }, { title: 'Delaware', value: 'DE' }, { title: 'Distric of Columbia', value: 'DC' }, 
        { title: 'Florida', value: 'FL' }, { title: 'Georgia', value: 'GA' }, { title: 'Guam', value: 'GU' }, { title: 'Hawaii', value: 'HI' }, { title: 'Idaho', value: 'ID' }, { title: 'Illinois', value: 'IL' }, { title: 'Indiana', value: 'IN' }, { title: 'Iowa', value: 'IA' }, { title: 'Kansas', value: 'KS' }, { title: 'Kentucky', value: 'KY' }, 
        { title: 'Louisiana', value: 'LA' }, { title: 'Maine', value: 'ME' }, { title: 'Maryland', value: 'MD' }, { title: 'Massachusettes', value: 'MA' }, { title: 'Michigan', value: 'MI' }, { title: 'Minnesota', value: 'MN' }, { title: 'Mississippi', value: 'MS' }, { title: 'Missouri', value: 'MO' }, { title: 'Montana', value: 'MT' }, { title: 'Nebraska', value: 'NE' }, 
        { title: 'Nevada', value: 'NV' }, { title: 'New Hampshire', value: 'NH' }, { title: 'New Jersey', value: 'NJ' }, { title: 'New Mexico', value: 'NM' }, { title: 'New York', value: 'NY' }, { title: 'North Carolina', value: 'NC' }, { title: 'North Dakota', value: 'ND' }, { title: 'Ohio', value: 'OH' }, { title: 'Oklahoma', value: 'OK' }, 
        { title: 'Oregon', value: 'OR' }, { title: 'Pennsylvania', value: 'PA' }, { title: 'Puerto Rico', value: 'PR' }, { title: 'Rhode Island', value: 'RI' }, { title: 'South Carolina', value: 'SC' }, { title: 'South Dakota', value: 'SD' }, { title: 'Tennessee', value: 'TN' }, { title: 'Texas', value: 'TX' }, { title: 'Utah', value: 'UT' }, 
        { title: 'Vermont', value: 'VT' }, { title: 'Virginia', value: 'VA' }, { title: 'Virgin Islands', value: 'VI' }, { title: 'Washington', value: 'WA' }, { title: 'West Virginia', value: 'WV' }, { title: 'Wisconsin', value: 'WI' }, { title: 'Wyoming', value: 'WY' },  
    ];

    const sortOptions = [
        { title: 'Alphabetical (A-Z)', value: 'Alphabetical (A-Z)' }, 
        { title: 'Reverse Alphabetical (Z-A)', value: 'Reverse Alphabetical (Z-A)' }, 
    ];
   

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

    return (
        <div ref={filterPage} className='filter-page-container'>
            <div className='filter-page'>
                <p className='filter-page-header'>
                    <span className='filter-page-title'>Filter & Sort</span>
                    <button className='close-filter-page' onClick={() => {
                        setFiltersOpen(false);
                    }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </p>
                <p className='filter-page-subheading'>Sort by</p>
                <Select name={''} options={sortOptions} onChange={updateSort} />
                <p className='filter-page-subheading'>Filter by</p>
                <CheckboxSelector name={'Park Designation'} filterTitle={'designations'} options={designationOptions} handleChange={updateDesignations} />
                <CheckboxSelector name={'State & Territory'} filterTitle={'stateCodes'} options={stateOptions} handleChange={updateStateCodes} />
            </div>
        </div>
    );
}