import { useSelector, useDispatch } from 'react-redux';
import { selectFormat, toggleFormat } from './weatherSlice';
import './WeatherFormatToggler.css';

export default function WeatherFormatToggler() {

    const dispatch = useDispatch();
    const tempFormat = useSelector(selectFormat);

    return (
        <button className='temp-format-toggler' onClick={() => dispatch(toggleFormat())}>
            <i className={tempFormat === 'C' ? 'active-temp-format-toggler' : ''}>&deg;C</i>
            <i className={tempFormat === 'F' ? 'active-temp-format-toggler' : ''}>&deg;F</i>
        </button>
    );
}
