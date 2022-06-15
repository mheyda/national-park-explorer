import { useSelector, useDispatch } from 'react-redux';
import { selectSort, filterParks, sortParks } from '../../features/parks/parksSlice.js';
import Select from '../select/Select.js';
import SearchBar from '../searchBar/SearchBar';
import { selectView, changeView } from '../../features/parks/parksSlice.js';
import './OptionsBar.css';


export default function OptionsBar() {

    const dispatch = useDispatch();
    const sort = useSelector(selectSort);
    const view = useSelector(selectView);


    const filterSelectOptions = [
        {
            title: 'All Parks',
            value: 'All'
        },
        {
            title: 'National Parks',
            value: 'National Park'
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

    const handleChangeView = (e) => {
        dispatch(changeView({view: e.target.dataset.view}))
    }

    const handleUpdateFilter = (e) => {
        const selectedIndex = e.target.options.selectedIndex;
        const filter = e.target.options[selectedIndex].value;
        dispatch(filterParks(filter));
        dispatch(sortParks(sort));
    }

    const handleUpdateSort = (e) => {
        const selectedIndex = e.target.options.selectedIndex;
        const newSort = e.target.options[selectedIndex].value;
        dispatch(sortParks(newSort));
    }

    if (view === 'list') {
        return (
            <div className='options-bar'>
                {// For future functionality
                // <SearchBar />
                }
                <Select name={'Filter By '} options={filterSelectOptions} onChange={handleUpdateFilter} />
                <Select name={'Sort By '} options={sortSelectOptions} onChange={handleUpdateSort} /> 
                
                <button className='view-btn' data-view={'map'} onClick={handleChangeView} >Show Map <i data-view={'map'} className="fa-solid fa-map"></i></button>
            </div>
        );
    } else {
        return (
            <div className='options-bar'>
                <button className='view-btn' data-view={'list'} onClick={handleChangeView} >Show List <i data-view={'list'} className="fa-solid fa-list"></i></button>
            </div>
        );
    }
}
