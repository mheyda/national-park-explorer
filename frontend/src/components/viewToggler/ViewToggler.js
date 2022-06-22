import { selectView, setView } from '../../features/parks/parksSlice';
import { useSelector, useDispatch } from 'react-redux';
import './ViewToggler.css';


export default function ViewToggler() {

    const view = useSelector(selectView);
    const label = (view === 'list' ? 'Map' : 'List');
    const dispatch = useDispatch();
    
    const updateView = (e) => {
        dispatch(setView({view: e.target.dataset.view}))
    }

    return (
        <button className='view-btn' data-view={label.toLowerCase()} onClick={updateView} >Show {label} <i data-view={label.toLowerCase()} className={`fa-solid fa-${label.toLowerCase()}`}></i></button>
    );
}
