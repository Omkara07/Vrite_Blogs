// Array of months in short form
const months: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

// Array of days in short form
const days: string[] = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
];

const getDays = (d: string): string => {
    const date = new Date(d)

    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getFullYear()} `
}

export default getDays