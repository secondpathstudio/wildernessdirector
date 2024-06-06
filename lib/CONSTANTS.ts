export const getMonth = (int: number) => {
    switch (int) {
        case 0:
        return "July";
        case 1:
        return "August";
        case 2:
        return "September";
        case 3:
        return "October";
        case 4:
        return "November";
        case 5:
        return "December";
        case 6:
        return "January";
        case 7:
        return "February";
        case 8:
        return "March";
        case 9:
        return "April";
        case 10:
        return "May";
        case 11:
        return "June";
        default:
        return "Unknown";
    }
}

export const getAcademicMonthNumber = (int: number) => {
    switch (int) {
        case 0:
        return 6;
        case 1:
        return 7;
        case 2:
        return 8;
        case 3:
        return 9;
        case 4:
        return 10;
        case 5:
        return 11;
        case 6:
        return 0;
        case 7:
        return 1;
        case 8:
        return 2;
        case 9:
        return 3;
        case 10:
        return 4;
        case 11:
        return 5;
        default:
        return 0;
    }
}