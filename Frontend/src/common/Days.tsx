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

// Function to get appropriate date suffix
const getDateSuffix = (date: number): string => {
    if (date > 3 && date < 21) return 'th'; // Handles 11th, 12th, 13th
    switch (date % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
};

const getDays = (d: string): string => {
    const date = new Date(d);

    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const getDate = (d: string): string => {
    const date = new Date(d);
    const day = date.getDate();

    // Add the day with the correct suffix
    return `${day}${getDateSuffix(day)} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export { getDays, getDate };
