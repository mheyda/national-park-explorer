// Takes a temperature in kelvin and converts it to the desired unit Fahrenheit or Celcius
export default function convertFromKelvin(kelvin, unit) {
    if (unit === 'F') {
        return ((kelvin - 273.15) * 9/5 + 32);
    } else {
        return (kelvin - 273.15);
    }
}