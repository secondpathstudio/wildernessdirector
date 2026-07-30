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

// Approved questions a fellow must author per topic.
export const REQUIRED_APPROVED_QUESTIONS = 11;

// The academic year runs July–June. Returns the July calendar year of the
// current academic year (e.g. 2026 covers July 2026 – June 2027), which is
// also how users/{uid}.cohortYear is stored.
export const getCurrentAcademicYear = () => {
    const now = new Date();
    return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

// 2026 -> "2026–27"
export const formatCohort = (year: number) =>
    `${year}–${String(year + 1).slice(-2)}`;